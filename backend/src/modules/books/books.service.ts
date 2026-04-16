import axios from "axios"
import { env } from "../../config/env"
import { TranslationService } from "../translation/translation.service"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const translationService = new TranslationService()

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export class BooksService {

  static async searchBooks(query: string) {
    let searchQuery = query

    if (/[\u0400-\u04FF]/.test(query)) {
      try {
        searchQuery = await translationService.translate(query, "en")
      } catch (err) {
        console.error("Query translation failed:", err)
      }
    }

    // Full-text search in DB cache — only real Google books (have externalId)
    let cached = await prisma.$queryRaw<any[]>`
      SELECT * FROM "Book"
      WHERE "externalId" IS NOT NULL
        AND to_tsvector('english', COALESCE(title, ''))
            @@ plainto_tsquery('english', ${searchQuery})
      ORDER BY ts_rank(
        to_tsvector('english', COALESCE(title, '')),
        plainto_tsquery('english', ${searchQuery})
      ) DESC
      LIMIT 10
    `

    // Fallback: word-split OR match
    if (cached.length === 0) {
      const words = searchQuery.split(/\s+/).filter((w: string) => w.length > 2)
      if (words.length > 0) {
        cached = await prisma.book.findMany({
          where: {
            externalId: { not: null },
            OR: words.map((word: string) => ({
              title: { contains: word, mode: "insensitive" as const }
            }))
          },
          take: 10
        }) as any[]
      }
    }

    const isCyrillic = (text: string) => /[\u0400-\u04FF]/.test(text)
    const maybeTranslate = async (text: string) =>
      isCyrillic(text) ? text : translationService.translate(text, "mn").catch(() => text)

    if (cached.length > 0) {
      const valid = cached.filter(b => b.externalId)
      const translated = await Promise.all(
        valid.map(async (book) => {
          const [title, description] = await Promise.all([
            maybeTranslate(book.title),
            book.description ? maybeTranslate(book.description) : Promise.resolve("")
          ])
          return {
            id: book.externalId,
            title,
            authors: [],
            description,
            categories: [],
            pages: 0,
            published: book.publishedDate,
            cover: book.thumbnailUrl
          }
        })
      )
      if (translated.length > 0) return translated
    }

    // Call Google API
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

    const items = res.data.items || []
    const books = []

    for (const item of items) {
      const volume = item.volumeInfo
      if (!volume?.title) continue

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

      books.push({
        id: item.id,
        title,
        authors: volume.authors || [],
        description,
        categories: volume.categories || [],
        pages: volume.pageCount || 0,
        published: volume.publishedDate || "",
        cover: volume.imageLinks?.thumbnail || ""
      })
    }

    return books
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
