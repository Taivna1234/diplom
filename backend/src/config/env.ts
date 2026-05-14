import dotenv from "dotenv";

dotenv.config();

export const env = {
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
