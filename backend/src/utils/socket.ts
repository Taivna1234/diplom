import { Server as HttpServer } from "http"
import { Server as SocketServer, Socket } from "socket.io"
import jwt from "jsonwebtoken"
import { parse as parseCookie } from "cookie"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface AuthSocket extends Socket {
  userId?: string
}

export function initSocket(httpServer: HttpServer) {
  const allowedOrigin = (process.env.FRONTEND_URL ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  const io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
    },
  })

  // Auth middleware — read JWT from cookie
  io.use((socket: AuthSocket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie || ""
      const cookies = parseCookie(rawCookie)
      const token = cookies.token

      if (!token) return next(new Error("Unauthorized"))

      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any
      socket.userId = payload.userId
      next()
    } catch {
      next(new Error("Unauthorized"))
    }
  })

  io.on("connection", (socket: AuthSocket) => {

    socket.on("join", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
    })

    socket.on("leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
    })

    socket.on("send_message", async (data: { conversationId: string; content: string }) => {
      const { conversationId, content } = data
      if (!socket.userId || !content?.trim()) return

      try {
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: socket.userId,
            content: content.trim(),
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        })

        io.to(`conversation:${conversationId}`).emit("new_message", {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          sender: message.sender,
          createdAt: message.createdAt,
          conversationId,
        })
      } catch (err) {
        socket.emit("error", "Мессеж илгээхэд алдаа гарлаа")
      }
    })

    // Typing indicator
    socket.on("typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing", socket.userId)
    })

    socket.on("stop_typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("stop_typing", socket.userId)
    })
  })

  return io
}
