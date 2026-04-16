import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class PostsService {

  static async createPost(
  userId: string,
  bookExternalId: string | null,
  content: string
) {

  let bookId: string | null = null

  if (bookExternalId) {

    const book = await prisma.book.findUnique({
      where: {
        externalId: bookExternalId
      }
    })

    if (book) {
      bookId = book.id
    }

  }

  return prisma.post.create({
    data: {
      userId,
      bookId,
      content
    }
  })
}

  static async getAllPosts() {

    return prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        book: {
          select: {
            externalId: true,
            title: true,
            thumbnailUrl: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

  }

  static async getPostsByBook(bookExternalId: string) {

    const book = await prisma.book.findUnique({
      where: {
        externalId: bookExternalId
      }
    })

    if (!book) {
      return []
    }

    return prisma.post.findMany({
      where: {
        bookId: book.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        book: {
          select: {
            externalId: true,
            title: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

  }

}