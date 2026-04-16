import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendPasswordResetEmail } from "../../utils/email"

const prisma = new PrismaClient()

export class AuthService {

  async register(name: string, email: string, password: string) {

    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      throw new Error("Email already exists")
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    })

    return user
  }

  async login(email: string, password: string) {

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const valid = await bcrypt.compare(password, user.passwordHash)

    if (!valid) {
      throw new Error("Invalid credentials")
    }

    return user
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    // Always return success to avoid email enumeration
    if (!user) return

    const token = crypto.randomBytes(32).toString("hex")
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    })

    await sendPasswordResetEmail(email, token)
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) throw new Error("Токен хүчингүй эсвэл хугацаа дууссан байна")

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    })
  }

}