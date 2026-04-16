import rateLimit from "express-rate-limit"

// General API limit: 200 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Хэт олон хүсэлт илгээлээ. 15 минутын дараа дахин оролдоно уу." },
})

// Auth endpoints: 10 requests per 15 minutes (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Хэт олон оролдлого хийлээ. 15 минутын дараа дахин оролдоно уу." },
})

// AI endpoints: 30 requests per 15 minutes (expensive operations)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI хүсэлтийн хязгаарт хүрлээ. 15 минутын дараа дахин оролдоно уу." },
})

// Search: 60 requests per minute
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Хайлт хэт олон удаа хийлээ. 1 минутын дараа дахин оролдоно уу." },
})
