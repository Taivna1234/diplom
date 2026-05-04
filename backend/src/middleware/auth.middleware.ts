import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UserRole } from "@prisma/client"

interface JwtPayload {
  userId: string
  role: UserRole
  iat: number
  exp: number
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ message: "Нэвтрэх шаардлагатай." })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error("JWT_SECRET is not set")
    return res.status(500).json({ message: "Серверийн тохиргооны алдаа." })
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    req.user = decoded
    next()
  } catch (err: any) {
    const msg = err?.name === "TokenExpiredError"
      ? "Нэвтрэлт хугацаа дууссан."
      : "Нэвтрэлт хүчингүй."
    return res.status(401).json({ message: msg })
  }
}
