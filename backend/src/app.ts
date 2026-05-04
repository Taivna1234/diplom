import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"

import authRoutes           from "./modules/auth/auth.routes"
import booksRoutes          from "./modules/books/books.routes"
import translationRoutes    from "./modules/translation/translation.routes"
import postsRoutes          from "./modules/community/posts/posts.routes"
import likesRoutes          from "./modules/community/likes/likes.routes"
import commentsRoutes       from "./modules/community/comments/comments.routes"
import listingsRoutes       from "./modules/marketplace/listings.routes"
import messagingRoutes      from "./modules/messaging/messaging.routes"
import aiRoutes             from "./modules/ai/ai.routes"
import recommendationRoutes from "./modules/recommendations/recommendation.routes"
import usersRoutes          from "./modules/users/users.routes"
import libraryRoutes        from "./modules/library/library.routes"
import { generalLimiter }   from "./middleware/rateLimiter"
import { errorHandler }     from "./middleware/errorHandler"

const app = express()

// ── Security headers 
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, 
}))

const allowedOrigin = (process.env.FRONTEND_URL ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
app.use(cors({ origin: allowedOrigin, credentials: true }))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))
app.use(cookieParser())

// ── Health check (no rate limit — used by CD pipeline) 
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }))

// ── Global rate limit 
app.use(generalLimiter)

app.use("/api/auth",            authRoutes)
app.use("/api/books",           booksRoutes)
app.use("/api/translate",       translationRoutes)
app.use("/api/posts",           postsRoutes)
app.use("/api/likes",           likesRoutes)
app.use("/api/comments",        commentsRoutes)
app.use("/api/listings",        listingsRoutes)
app.use("/api/messages",        messagingRoutes)
app.use("/api/ai",              aiRoutes)
app.use("/api/recommendations", recommendationRoutes)
app.use("/api/users",           usersRoutes)
app.use("/api/library",         libraryRoutes)


app.use(errorHandler)

export default app
