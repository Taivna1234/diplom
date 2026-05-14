import { z } from "zod"

// ── Helpers ──────────────────────────────────────────────────────────────────
const safeText = (min: number, max: number) =>
  z.string().min(min).max(max).transform(s => s.trim())

const safeId = z.string().uuid("Буруу ID формат")

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  email:    z.string().email("Имэйл буруу").max(254),
  password: z.string().min(8, "Нууц үг хамгийн багадаа 8 тэмдэгт байна").max(128),
  name:     safeText(2, 60),
})

export const loginSchema = z.object({
  email:    z.string().email().max(254),
  password: z.string().min(1).max(128),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(254),
})

export const resetPasswordSchema = z.object({
  token:       z.string().min(1).max(512),
  newPassword: z.string().min(8, "Нууц үг хамгийн багадаа 8 тэмдэгт байна").max(128),
})

// ── Users ─────────────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name:      safeText(2, 60).optional(),
  email:     z.string().email().max(254).optional(),
  bio:       z.string().max(500).optional().transform(s => s?.trim()),
  avatarUrl: z.string().max(5_000_000).optional(), // base64, ~3.7MB decoded
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword:     z.string().min(8).max(128),
})

// ── Posts ─────────────────────────────────────────────────────────────────────
export const createPostSchema = z.object({
  content: safeText(1, 5000),
  bookId:  z.string().optional(),
})

// ── Comments ──────────────────────────────────────────────────────────────────
export const createCommentSchema = z.object({
  postId:   z.string().min(1).max(128),
  content:  safeText(1, 2000),
  parentId: z.string().optional(),
})

// ── Marketplace ───────────────────────────────────────────────────────────────
export const createListingSchema = z.object({
  bookTitle:        safeText(1, 300),
  bookExternalId:   z.string().max(128).nullable().optional(),
  type:             z.enum(["SELL", "RENT", "EXCHANGE"]),
  price:            z.number().min(0).max(100_000_000).nullable().optional(),
  rentDurationDays: z.number().int().min(1).max(365).nullable().optional(),
  condition:        safeText(1, 100),
  location:         safeText(1, 200),
  photoBase64:      z.string().max(7_000_000).nullable().optional(),
})

// ── AI ────────────────────────────────────────────────────────────────────────
export const askQuestionSchema = z.object({
  question: safeText(1, 2000),
  bookId:   z.string().max(128).optional().nullable(),
})

export const summaryByTitleSchema = z.object({
  title: safeText(1, 300),
})

// ── Books ───────────────────────────────────────────────────────────────────
export const createManualBookSchema = z.object({
  title:       safeText(1, 300),
  authors:     z.array(safeText(1, 120)).max(10).optional().default([]),
  description: z.string().max(10_000).optional().transform(s => s?.trim() ?? ""),
  categories:  z.array(safeText(1, 80)).max(8).optional().default([]),
  language:    z.string().min(2).max(20).optional().default("mn").transform(s => s.trim()),
  published:   z.string().max(40).optional().nullable(),
  cover:       z.string().max(7_000_000).optional().nullable(),
})

// ── Translation ───────────────────────────────────────────────────────────────
export const translateSchema = z.object({
  text:       z.string().min(1).max(10_000),
  targetLang: z.enum(["mn", "en", "ru", "zh", "ja", "ko"]),
})

// ── Books query ───────────────────────────────────────────────────────────────
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
})
