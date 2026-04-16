import nodemailer from "nodemailer"
import { env } from "../config/env"

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: `"Dilpom" <${env.SMTP_USER}>`,
    to,
    subject: "Нууц үг сэргээх",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Нууц үг сэргээх</h2>
        <p>Та нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх товчийг дарж нууц үгээ шинэчлэнэ үү.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:linear-gradient(to right,#2563eb,#06b6d4);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">
          Нууц үг шинэчлэх
        </a>
        <p style="color:#6b7280;font-size:13px;">Энэ холбоос 1 цагийн дараа хүчингүй болно.<br>Хэрэв та энэ хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.</p>
      </div>
    `,
  })
}
