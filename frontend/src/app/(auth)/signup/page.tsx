import { Sparkles } from "lucide-react"
import Link from "next/link"
import { SignupForm } from "../components/SignupForm"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1628522972018-e7479d00e06e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/60 via-blue-500/60 to-blue-600/60" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              BookIntelligence-д нэгдэх
            </h1>
            <p className="text-white/80">Акаунт үүсгэж эхлэх</p>
          </div>

          <SignupForm />

          <p className="text-center text-white mt-6">
            Аль хэдийн акаунттай юу?{" "}
            <Link href="/login" className="font-semibold hover:text-white/80">
              Нэвтрэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
