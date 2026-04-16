"use client"

import { useState, use } from "react"
import { Sparkles, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = use(searchParams)
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirm) {
      setError("Нууц үг таарахгүй байна")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setDone(true)
      setTimeout(() => router.push("/login"), 2500)
    } catch (err: any) {
      setError(err.message || "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center p-6">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 text-center text-white max-w-sm w-full border border-white/30">
          <p className="font-semibold mb-4">Токен олдсонгүй</p>
          <Link href="/forgot-password" className="underline text-white/80 hover:text-white text-sm">
            Дахин хүсэлт илгээх
          </Link>
        </div>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-white mb-2">Шинэ нууц үг тохируулах</h1>
          </div>

          {done ? (
            <div className="text-center p-4 rounded-2xl bg-green-500/20 border border-green-400/30">
              <p className="text-white font-medium">Нууц үг амжилттай шинэчлэгдлээ!</p>
              <p className="text-white/80 text-sm mt-1">Нэвтрэх хуудас руу шилжиж байна...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/20 text-white text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Шинэ нууц үг</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Нууц үг давтах</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg disabled:opacity-70"
              >
                {loading ? "Хадгалж байна..." : "Нууц үг шинэчлэх"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
