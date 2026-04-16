import { PrismaClient, SummaryType } from "@prisma/client"
import { askGemini } from "../../utils/gemini"
import axios from "axios"
import { env } from "../../config/env"
import { ActivityService } from "../activity/activity.service"

const prisma = new PrismaClient()

export class AIService {

  static async getBookSummary(bookExternalId: string) {


    let book = await prisma.book.findUnique({
  where: { externalId: bookExternalId }
})

if (!book) {

  book = await prisma.book.create({
    data: {
      externalId: bookExternalId,
      title: "Unknown book",
      language: "unknown"
    }
  })
}

    const cached = await prisma.aiSummary.findFirst({
      where: { bookId: book.id, summaryType: "OVERVIEW" }
    })

    if (cached && cached.content.length >= 200) {
      return cached.content
    }
    if (cached) {
      await prisma.aiSummary.delete({ where: { id: cached.id } })
    }

    const prompt = `
Та "${book.title}" номыг монгол хэлээр хураангуйл.

Шаардлага:

Нийт урт: 120–180 үг
Давталт, илүү тайлбар бүү оруул
Зөвхөн гол мэдээлэл

Бүтэц:

Номын тухай (1 өгүүлбэр)
Агуулга (товч, гэхдээ бүрэн)
Гол дүрүүд (зөвхөн чухлууд)
Гол санаа (1–2 өгүүлбэр)

Нэг урсгалтай, таслахгүй бич.
`
    const summary = await askGemini(prompt)

    await prisma.aiSummary.create({
      data: {
        bookId: book.id,
        summaryType: "OVERVIEW",
        content: summary
      }
    })

    return summary
  }

  static async getSummaryByTitle(title: string) {
    const cached = await prisma.aiSummary.findFirst({
      where: { book: { title } }
    })
    if (cached && cached.content.length >= 200) return cached.content
    if (cached) {
      await prisma.aiSummary.delete({ where: { id: cached.id } })
    }

    const prompt = `
Та "${title}" номын бүрэн хураангуйг монгол хэлээр бич.

Дараах бүтцээр бич:
1. Номын тухай (1-2 өгүүлбэр): зохиолч, жанр, хэвлэгдсэн он
2. Үндсэн агуулга: номын гол сэдэв, үйл явдал, санааг дэлгэрэнгүй тайлбарла
3. Гол дүрүүд: хамгийн чухал дүрүүдийн товч тайлбар
4. Номын гол санаа: уншигчид юу сурах, ойлгох вэ
5. Дүгнэлт: энэ номыг хэнд уншихыг зөвлөх вэ

Хариултаа бүрэн, тодорхой бич. Хэсгийн дунд таслахгүй.
`
    const summary = await askGemini(prompt)

    // cache against an existing or new book record
    let book = await prisma.book.findFirst({ where: { title } })
    if (!book) {
      book = await prisma.book.create({ data: { title, language: "unknown" } })
    }

    await prisma.aiSummary.create({
      data: { bookId: book.id, summaryType: "OVERVIEW", content: summary }
    })

    return summary
  }

static async askBookQuestion(
    question: string,
  userId?: string,
  bookExternalId?: string
) {
    let bookId: string | undefined

  if (bookExternalId) {
    const book = await prisma.book.findUnique({
      where: { externalId: bookExternalId }
    })
    if (book) bookId = book.id
  }
  const prompt = `
You are BookMind AI, an assistant for people who read books.

Your role:
- Help users understand books
- Explain plots, endings, themes, characters
- Suggest books
- Help with reading discussions

Rules:
- Answer ONLY questions related to books or reading.
- If the question is not related to books, say:
  "Би зөвхөн номтой холбоотой асуултад хариулж чадна."

- Always answer in Mongolian.
- Keep answers clear and concise.

User question:
${question}
`

  const answer = await askGemini(prompt)

  if (userId && bookId) {
    await ActivityService.track(userId, bookId, "AI_QUESTION")
  }
  return answer
}

  // ── Hybrid Recommendation Engine ──────────────────────────────────────────
  // Combines content-based filtering (categories/authors overlap) and
  // collaborative filtering (users with similar taste) — max 5 each.

  static async getRecommendations(userId: string, bookExternalId?: string) {
    // ── Step 1: build the current user's interaction set ──
    const [activityRows, libraryRows] = await Promise.all([
      prisma.userBookActivity.findMany({ where: { userId }, select: { bookId: true } }),
      prisma.userLibrary.findMany({ where: { userId }, select: { bookId: true } }),
    ])
    const interactedIds = [...new Set([
      ...activityRows.map(r => r.bookId),
      ...libraryRows.map(r => r.bookId),
    ])]

    const seedIds = [...interactedIds]
    if (bookExternalId) {
      const focal = await prisma.book.findUnique({ where: { externalId: bookExternalId }, select: { id: true } })
      if (focal && !seedIds.includes(focal.id)) seedIds.push(focal.id)
    }

    let contentBased: any[] = []

    if (seedIds.length > 0) {
      const seedBooks = await prisma.book.findMany({
        where: { id: { in: seedIds } },
        include: {
          authors: { include: { author: true } },
          categories: { include: { category: true } },
        },
      })

      const categoryIds = [...new Set(seedBooks.flatMap(b => b.categories.map(c => c.categoryId)))]
      const authorIds   = [...new Set(seedBooks.flatMap(b => b.authors.map(a => a.authorId)))]

      if (categoryIds.length > 0 || authorIds.length > 0) {
        const orClauses: any[] = []
        if (categoryIds.length > 0) orClauses.push({ categories: { some: { categoryId: { in: categoryIds } } } })
        if (authorIds.length > 0)   orClauses.push({ authors:    { some: { authorId:   { in: authorIds   } } } })

        const candidates = await prisma.book.findMany({
          where: {
            externalId: { not: null },
            detailFetched: true,
            thumbnailUrl: { not: null },
            id: { notIn: interactedIds.length > 0 ? interactedIds : [] },
            OR: orClauses,
          },
          include: {
            authors:    { include: { author: true } },
            categories: { include: { category: true } },
          },
          take: 30,
        })

        contentBased = candidates
          .map(book => {
            const catScore    = book.categories.filter(c => categoryIds.includes(c.categoryId)).length * 2
            const authorScore = book.authors.filter(a => authorIds.includes(a.authorId)).length * 3
            return { book, score: catScore + authorScore }
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(({ book }) => AIService.formatBookCard(book))
      }
    }

    let collaborative: any[] = []

    if (interactedIds.length > 0) {

      const similarUsers = await prisma.userBookActivity.groupBy({
        by: ["userId"],
        where: {
          bookId: { in: interactedIds },
          userId: { not: userId },
        },
        _count: { bookId: true },
        orderBy: { _count: { bookId: "desc" } },
        take: 15,
      })

      const similarUserIds = similarUsers.map(u => u.userId)

      if (similarUserIds.length > 0) {
        // Books those users interacted with, grouped by frequency
        const topCollabBooks = await prisma.userBookActivity.groupBy({
          by: ["bookId"],
          where: {
            userId: { in: similarUserIds },
            bookId: { notIn: interactedIds },
          },
          _count: { userId: true },
          orderBy: { _count: { userId: "desc" } },
          take: 5,
        })

        const collabIds = topCollabBooks.map(r => r.bookId)
        if (collabIds.length > 0) {
          const collabBooks = await prisma.book.findMany({
            where: { id: { in: collabIds }, externalId: { not: null }, detailFetched: true, thumbnailUrl: { not: null } },
            include: {
              authors:    { include: { author: true } },
              categories: { include: { category: true } },
            },
          })
          // Preserve frequency-rank order from groupBy
          collaborative = collabIds
            .map(id => collabBooks.find(b => b.id === id))
            .filter(Boolean)
            .map(book => AIService.formatBookCard(book))
        }
      }
    }

    // ── Fallback: top-rated books when data is sparse 
    const needsContentFallback     = contentBased.length === 0
    const needsCollaborativeFallback = collaborative.length === 0

    if (needsContentFallback || needsCollaborativeFallback) {
      const fallback = await prisma.book.findMany({
        where: {
          externalId: { not: null },
          detailFetched: true,
          thumbnailUrl: { not: null },
          externalRating: { not: null },
          id: { notIn: interactedIds.length > 0 ? interactedIds : [] },
        },
        include: {
          authors:    { include: { author: true } },
          categories: { include: { category: true } },
        },
        orderBy: { externalRating: "desc" },
        take: 10,
      })

      if (needsContentFallback)     contentBased  = fallback.slice(0, 5).map(b => AIService.formatBookCard(b))
      if (needsCollaborativeFallback) collaborative = fallback.slice(5, 10).map(b => AIService.formatBookCard(b))
    }

    return { contentBased, collaborative }
  }

  private static formatBookCard(book: any) {
    return {
      id:         book.externalId,
      title:      book.title,
      cover:      book.thumbnailUrl || null,
      authors:    book.authors.map((ba: any) => ba.author.name),
      categories: book.categories.map((bc: any) => bc.category.name),
      rating:     book.externalRating ?? null,
    }
  }

}