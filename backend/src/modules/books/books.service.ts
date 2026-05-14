import axios from "axios"
import { randomUUID } from "crypto"
import { env } from "../../config/env"
import { TranslationService } from "../translation/translation.service"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const translationService = new TranslationService()

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function formatCachedBook(book: any) {
  return {
    id: book.externalId,
    title: book.title,
    authors: book.authors?.map((ba: any) => ba.author.name) ?? [],
    description: book.description || "",
    categories: book.categories?.map((bc: any) => bc.category.name) ?? [],
    pages: 0,
    published: book.publishedDate,
    cover: book.thumbnailUrl,
  }
}

export class BooksService {
  static async createManualBook(data: {
    title: string
    authors?: string[]
    description?: string
    categories?: string[]
    language?: string
    published?: string | null
    cover?: string | null
  }) {
    const externalId = `manual-${randomUUID()}`
    const publishedDate = data.published ? new Date(data.published) : null

    const bookRecord = await prisma.book.create({
      data: {
        externalId,
        title: data.title,
        description: data.description || "",
        thumbnailUrl: data.cover || "",
        language: data.language || "mn",
        publishedDate: publishedDate && !Number.isNaN(publishedDate.getTime()) ? publishedDate : null,
        detailFetched: true,
      },
    })

    const authorNames = [...new Set(data.authors ?? [])]
    const categoryNames = [...new Set(data.categories ?? [])]

    for (const name of authorNames) {
      let author = await prisma.author.findFirst({ where: { name } })
      if (!author) {
        author = await prisma.author.create({ data: { name } })
      }
      await prisma.bookAuthor.create({
        data: { bookId: bookRecord.id, authorId: author.id },
      })
    }

    for (const name of categoryNames) {
      const category = await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
      await prisma.bookCategory.create({
        data: { bookId: bookRecord.id, categoryId: category.id },
      })
    }

    return {
      id: externalId,
      title: data.title,
      authors: authorNames,
      description: data.description || "",
      categories: categoryNames,
      published: data.published || "",
      cover: data.cover || "",
    }
  }

  static async searchBooks(query: string) {
    let searchQuery = query

    if (/[\u0400-\u04FF]/.test(query)) {
      try {
        searchQuery = await translationService.translate(query, "en")
      } catch (err) {
        console.error("Query translation failed:", err)
      }
    }

    const cachedRanked = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "Book"
      WHERE "externalId" IS NOT NULL
        AND (
          to_tsvector('simple', COALESCE(title, ''))
            @@ plainto_tsquery('simple', ${searchQuery})
          OR title ILIKE ${`%${query}%`}
          OR title ILIKE ${`%${searchQuery}%`}
        )
      ORDER BY ts_rank(
        to_tsvector('simple', COALESCE(title, '')),
        plainto_tsquery('simple', ${searchQuery})
      ) DESC
      LIMIT 10
    `

    const words = [...new Set([query, searchQuery]
      .flatMap((value) => value.split(/\s+/))
      .map((word) => word.trim())
      .filter((word) => word.length > 2))]

    const cachedFallback = words.length > 0
      ? await prisma.book.findMany({
          where: {
            externalId: { not: null },
            OR: words.map((word) => ({
              title: { contains: word, mode: "insensitive" as const }
            }))
          },
          select: { id: true },
          take: 10
        })
      : []

    const cachedIds = [...new Set([
      ...cachedRanked.map((book) => book.id),
      ...cachedFallback.map((book) => book.id),
    ])]

    const cached = cachedIds.length > 0
      ? await prisma.book.findMany({
          where: { id: { in: cachedIds } },
          include: {
            authors: { include: { author: true } },
            categories: { include: { category: true } },
          },
        })
      : []

    const cachedById = new Map(cached.map((book) => [book.id, book]))
    const cachedBooks = cachedIds
      .map((id) => cachedById.get(id))
      .filter(Boolean)
      .map(formatCachedBook)

    const results = [...cachedBooks]
    const seenExternalIds = new Set(results.map((book) => book.id))

    const hasStrongManualMatch = results.some((book) =>
      book.id?.startsWith("manual-") &&
      book.title.toLowerCase().includes(query.toLowerCase())
    )

    if (hasStrongManualMatch && results.length >= 10) {
      return results.slice(0, 10)
    }

    let items: any[] = []
    try {
      const res = await axios.get(
        "https://www.googleapis.com/books/v1/volumes",
        {
          params: {
            q: searchQuery,
            maxResults: 10,
            key: env.GOOGLE_BOOKS_API_KEY
          }
        }
      )
      items = res.data.items || []
    } catch (error) {
      console.error("Google Books search failed:", error)
      return results.slice(0, 10)
    }

    for (const item of items) {
      const volume = item.volumeInfo
      if (!volume?.title) continue
      if (seenExternalIds.has(item.id)) continue

      await prisma.book.upsert({
        where: { externalId: item.id },
        update: {},
        create: {
          externalId: item.id,
          title: volume.title,
          description: volume.description ? stripHtml(volume.description) : "",
          thumbnailUrl: volume.imageLinks?.thumbnail || "",
          language: volume.language || "en",
          publishedDate: volume.publishedDate ? new Date(volume.publishedDate) : null
        }
      })

      let title = volume.title
      let description = volume.description || ""
      try {
        title = await translationService.translate(title, "mn")
        if (description) description = await translationService.translate(description, "mn")
      } catch {}

      results.push({
        id: item.id,
        title,
        authors: volume.authors || [],
        description,
        categories: volume.categories || [],
        pages: volume.pageCount || 0,
        published: volume.publishedDate || "",
        cover: volume.imageLinks?.thumbnail || ""
      })
      seenExternalIds.add(item.id)
    }

    return results.slice(0, 10)
  }

  static async getBookById(id: string) {
    const cached = await prisma.book.findUnique({
      where: { externalId: id },
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
      },
    })

    // Use cache only when a full detail fetch has been done before
    if (cached?.detailFetched) {
      return {
        id: cached.externalId,
        title: cached.title,
        authors: cached.authors.map((ba) => ba.author.name),
        description: cached.description ? stripHtml(cached.description) : "",
        categories: cached.categories.map((bc) => bc.category.name),
        pages: 0,
        published: cached.publishedDate,
        cover: cached.thumbnailUrl,
        averageRating: cached.externalRating ?? null,
        ratingsCount: cached.externalRatingCount ?? null,
      }
    }

    // Fetch full detail from Google
    const res = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${id}`,
      { params: { key: env.GOOGLE_BOOKS_API_KEY } }
    )

    const book = res.data.volumeInfo
    const rawDescription = book.description || cached?.description || ""
    const cleanDescription = rawDescription ? stripHtml(rawDescription) : ""

    const updateData = {
      title: book.title || cached?.title || "Unknown",
      description: cleanDescription,
      thumbnailUrl: book.imageLinks?.thumbnail || cached?.thumbnailUrl || "",
      language: book.language || cached?.language || "en",
      publishedDate: book.publishedDate ? new Date(book.publishedDate) : (cached?.publishedDate ?? null),
      externalRating: book.averageRating ?? null,
      externalRatingCount: book.ratingsCount ?? null,
      detailFetched: true,
    }

    let bookRecord: { id: string }
    if (cached) {
      bookRecord = await prisma.book.update({ where: { externalId: id }, data: updateData })
    } else {
      bookRecord = await prisma.book.create({ data: { externalId: id, ...updateData } })
    }

    // Persist authors
    const authorNames: string[] = book.authors || []
    for (const name of authorNames) {
      let author = await prisma.author.findFirst({ where: { name } })
      if (!author) author = await prisma.author.create({ data: { name } })
      await prisma.bookAuthor.upsert({
        where: { bookId_authorId: { bookId: bookRecord.id, authorId: author.id } },
        update: {},
        create: { bookId: bookRecord.id, authorId: author.id },
      })
    }

    // Persist categories
    const categoryNames: string[] = book.categories || []
    for (const name of categoryNames) {
      const category = await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
      await prisma.bookCategory.upsert({
        where: { bookId_categoryId: { bookId: bookRecord.id, categoryId: category.id } },
        update: {},
        create: { bookId: bookRecord.id, categoryId: category.id },
      })
    }

    return {
      id,
      title: book.title,
      authors: authorNames,
      description: cleanDescription,
      categories: categoryNames,
      pages: book.pageCount || 0,
      published: book.publishedDate || "",
      cover: book.imageLinks?.thumbnail || "",
      averageRating: book.averageRating ?? null,
      ratingsCount: book.ratingsCount ?? null,
    }
  }
}
