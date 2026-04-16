import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class LibraryService {

  static async addBook(userId: string, bookExternalId: string) {
    const book = await prisma.book.findUnique({ where: { externalId: bookExternalId } })
    if (!book) throw new Error("Book not found")

    return prisma.userLibrary.upsert({
      where: { userId_bookId: { userId, bookId: book.id } },
      update: {},
      create: { userId, bookId: book.id }
    })
  }

  static async removeBook(userId: string, bookExternalId: string) {
    const book = await prisma.book.findUnique({ where: { externalId: bookExternalId } })
    if (!book) return

    await prisma.userLibrary.deleteMany({ where: { userId, bookId: book.id } })
  }

  static async isInLibrary(userId: string, bookExternalId: string) {
    const book = await prisma.book.findUnique({ where: { externalId: bookExternalId } })
    if (!book) return false

    const entry = await prisma.userLibrary.findUnique({
      where: { userId_bookId: { userId, bookId: book.id } }
    })
    return !!entry
  }

  static async getUserLibrary(userId: string) {
    const entries = await prisma.userLibrary.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            externalId: true,
            title: true,
            thumbnailUrl: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return entries.map(e => e.book)
  }

}
