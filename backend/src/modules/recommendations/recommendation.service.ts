import { PrismaClient, ActivityType } from "@prisma/client"
import { Matrix, SVD } from "ml-matrix"

const prisma = new PrismaClient()

const ACTIVITY_WEIGHTS: Record<ActivityType, number> = {
  SEARCH: 1,
  POST_LIKE: 2,
  AI_QUESTION: 3,
  LISTING_CREATE: 5,
}

export class RecommendationService {

  static async getTrendingBooks() {

    const since = new Date()
    since.setDate(since.getDate() - 7)

    const activities = await prisma.userBookActivity.findMany({
      where: {
        createdAt: { gte: since }
      }
    })

    const scoreMap: Record<string, number> = {}

    for (const a of activities) {

      let weight = 1

      if (a.actionType === ActivityType.AI_QUESTION) weight = 3
      if (a.actionType === ActivityType.POST_LIKE) weight = 2

      scoreMap[a.bookId] = (scoreMap[a.bookId] || 0) + weight
    }

    const sorted = Object.entries(scoreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const bookIds = sorted.map(([bookId]) => bookId)

    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds }
      }
    })

    return books
  }
  static async getPersonalRecommendations(userId: string, numRecommendations = 10) {

    const allActivities = await prisma.userBookActivity.findMany()

    if (allActivities.length === 0) return []
    const userIds = [...new Set(allActivities.map(a => a.userId))]
    const bookIds = [...new Set(allActivities.map(a => a.bookId))]

    if (!userIds.includes(userId)) return []

    const userIndex = new Map(userIds.map((id, i) => [id, i]))
    const bookIndex = new Map(bookIds.map((id, i) => [id, i]))

    const matrixData: number[][] = Array.from({ length: userIds.length }, () =>
      new Array(bookIds.length).fill(0)
    )

    for (const activity of allActivities) {
      const ui = userIndex.get(activity.userId)!
      const bi = bookIndex.get(activity.bookId)!
      matrixData[ui][bi] += ACTIVITY_WEIGHTS[activity.actionType] ?? 1
    }

    const M = new Matrix(matrixData)
    const svd = new SVD(M, { autoTranspose: true })

    const U = svd.leftSingularVectors   
    const S = svd.diagonal              
    const V = svd.rightSingularVectors  

    // Truncate to k components (same concept as k=50 in the Python version)
    const k = Math.min(50, S.length)
    const Uk = U.subMatrix(0, U.rows - 1, 0, k - 1)
    const Sk = Matrix.diag(S.slice(0, k))
    const Vkt = V.subMatrix(0, V.rows - 1, 0, k - 1).transpose()

    const predicted = Uk.mmul(Sk).mmul(Vkt)

    // Get predicted rating row for this user
    const ui = userIndex.get(userId)!
    const userRow = predicted.getRow(ui)

    // Books this user has already interacted with
    const seenBookIds = new Set(
      allActivities.filter(a => a.userId === userId).map(a => a.bookId)
    )

    const bookPopularity: Record<string, number> = {}
    for (const activity of allActivities) {
      bookPopularity[activity.bookId] = (bookPopularity[activity.bookId] || 0) + 1
    }

    // predicted_rating * popularity
    const scored: Array<{ bookId: string; score: number }> = []
    for (let bi = 0; bi < bookIds.length; bi++) {
      const bookId = bookIds[bi]
      if (!seenBookIds.has(bookId)) {
        const popularity = bookPopularity[bookId] || 1
        scored.push({ bookId, score: userRow[bi] * popularity })
      }
    }

    scored.sort((a, b) => b.score - a.score)
    const topBookIds = scored.slice(0, numRecommendations).map(s => s.bookId)

    if (topBookIds.length === 0) return []

    const books = await prisma.book.findMany({
      where: { id: { in: topBookIds } }
    })

    const bookMap = new Map(books.map(b => [b.id, b]))
    return topBookIds.map(id => bookMap.get(id)).filter(Boolean)
  }

}