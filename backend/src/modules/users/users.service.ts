import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export class UsersService {

  static async getProfile(userId: string) {

    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true
      }
    })

  }

  static async updateProfile(
    userId: string,
    name?: string,
    bio?: string,
    avatarUrl?: string,
    email?: string
  ) {
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== userId) throw new Error("Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна")
    }
    return prisma.user.update({
      where: { id: userId },
      data: { name, bio, avatarUrl, ...(email ? { email } : {}) }
    })
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error("User not found")

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new Error("Одоогийн нууц үг буруу байна")

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  }

  static async getPostsByUser(userId: string) {
    return prisma.post.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        book: { select: { externalId: true, title: true, thumbnailUrl: true } },
        _count: { select: { comments: true, likes: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  }

}