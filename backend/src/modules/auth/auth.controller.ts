import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { AuthService } from "./auth.service"
import { generateToken } from "../../utils/jwt"

const prisma = new PrismaClient()
const authService = new AuthService()

export class AuthController {

  async register(req: Request, res: Response) {
    try {

      const { name, email, password } = req.body
      const user = await authService.register(name, email, password)
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt
      })
    } catch (err: any) {
      res.status(400).json({ message: err.message })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const user = await authService.login(email, password)
      const token = generateToken(user.id, user.role)
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      })
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role
      })
    } catch (err: any) {
      res.status(401).json({ message: err.message })
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false })
    res.json({ message: "Logged out" })
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body
      await authService.forgotPassword(email)
      res.json({ message: "Хэрэв энэ имэйл бүртгэлтэй бол нууц үг сэргээх холбоос илгээгдсэн." })
    } catch {
      res.status(500).json({ message: "Алдаа гарлаа" })
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body
      await authService.resetPassword(token, newPassword)
      res.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" })
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Алдаа гарлаа" })
    }
  }

  async me(req: Request, res: Response) {

    try {
      const userId = (req as any).user.userId
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          createdAt: true
        }
      })

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
      res.json(user)

    } catch {
      res.status(401).json({ message: "Unauthorized" })
    }
  }

}