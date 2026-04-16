import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class CommentsService {

  static async createComment(
    userId: string,
    postId: string,
    content: string,
    parentId?: string
  ) {

    return prisma.comment.create({
      data: {
        userId,
        postId,
        content,
        parentId: parentId || null
      }
    })

  }

  static async getComments(postId: string) {

    return prisma.comment.findMany({
      where: {
        postId,
        parentId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    })

  }

}