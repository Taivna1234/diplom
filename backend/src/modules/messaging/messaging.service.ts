import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class MessagingService {

  static async startConversation(
    userId: string,
    otherUserId: string,
    listingId?: string
  ) {

    // Always reuse an existing conversation between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ]
      }
    })

    if (existing) {
      return existing
    }

    return prisma.conversation.create({
      data: {
        listingId: listingId || null,
        participants: {
          create: [
            { userId },
            { userId: otherUserId }
          ]
        }
      }
    })
  }

  static async sendMessage(
    userId: string,
    conversationId: string,
    content: string
  ) {

    return prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content
      }
    })
  }

  static async getMessages(conversationId: string) {

    return prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
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
    })
  }

  static async getUserConversations(userId: string) {

    return prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        },
        listing: {
          select: {
            id: true,
            bookId: true
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  }

}