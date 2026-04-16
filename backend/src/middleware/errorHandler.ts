import { Request, Response, NextFunction } from "express"

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err?.message ?? err)

  // Prisma known errors
  if (err?.code === "P2002") {
    return res.status(409).json({ message: "Бүртгэл аль хэдийн байна." })
  }
  if (err?.code === "P2025") {
    return res.status(404).json({ message: "Мэдээлэл олдсонгүй." })
  }

  // JWT errors
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Нэвтрэлт хүчингүй болсон." })
  }

  const status = err?.status ?? err?.statusCode ?? 500
  const message = status < 500 ? err.message : "Серверийн алдаа гарлаа."
  res.status(status).json({ message })
}
