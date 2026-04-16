"use client"

import { useState } from "react"
import { Sparkles, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1648905755287-b5c721ab36c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-blue-500/60 to-cyan-500/60" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Нууц үг сэргээх</h1>
            <p className="text-white/80 text-sm">
              Бүртгэлтэй имэйл хаягаа оруулна уу.<br />Нууц үг сэргээх холбоос илгээнэ.
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-2xl bg-green-500/20 border border-green-400/30">
                <p className="text-white font-medium">Имэйл илгээгдлээ!</p>
                <p className="text-white/80 text-sm mt-1">
                  Имэйлээ шалгаад нууц үг сэргээх холбоос дээр дарна уу.
                </p>
              </div>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-white/80 hover:text-white text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Нэвтрэх хуудас руу буцах
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/20 text-white text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Имэйл хаяг</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg disabled:opacity-70"
              >
                {loading ? "Илгээж байна..." : "Холбоос илгээх"}
              </button>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-white/80 hover:text-white text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Буцах
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
