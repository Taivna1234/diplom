import { Sparkles } from "lucide-react"
import Link from "next/link"
import { LoginForm } from "../components/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1648905755287-b5c721ab36c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-blue-500/60 to-cyan-500/60" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Тавтай морил
            </h1>
            <p className="text-white/80">BookIntelligence акаунтдаа нэвтэрнэ үү</p>
          </div>

          <LoginForm />

          <p className="text-center text-white mt-6">
            Акаунт байхгүй юу?{" "}
            <Link
              href="/signup"
              className="font-semibold hover:text-white/80 transition-colors"
            >
              Бүртгүүлэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
