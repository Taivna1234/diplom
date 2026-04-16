"use client"

import { useState, useRef } from "react"
import { X, Camera } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface Props {
  onClose: () => void
}

export function EditProfileModal({ onClose }: Props) {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState("")
  const [passSuccess, setPassSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Зургийн хэмжээ 5MB-аас хэтрэхгүй байх ёстой")
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAvatarUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError("")
    setProfileSuccess(false)
    setProfileLoading(true)
    try {
      await api.put("/api/users/profile", { name, email, avatarUrl: avatarUrl || undefined })
      setProfileSuccess(true)
    } catch (err: any) {
      setProfileError(err.message || "Алдаа гарлаа")
    } finally {
      setProfileLoading(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassError("")
    setPassSuccess(false)
    setPassLoading(true)
    try {
      await api.put("/api/users/password", { currentPassword, newPassword })
      setPassSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      setPassError(err.message || "Алдаа гарлаа")
    } finally {
      setPassLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Профайл засах</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {/* Profile info */}
        <form onSubmit={saveProfile} className="space-y-4">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-blue-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-gray-400">JPG, PNG — 5MB хүртэл</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имэйл</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Нэр</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>
          {profileError && <p className="text-sm text-red-500">{profileError}</p>}
          {profileSuccess && <p className="text-sm text-green-500">Амжилттай хадгаллаа</p>}
          <button
            type="submit"
            disabled={profileLoading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 text-sm"
          >
            {profileLoading ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </form>

        <hr className="border-gray-200 dark:border-slate-700" />

        {/* Password change */}
        <form onSubmit={savePassword} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Нууц үг солих</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Одоогийн нууц үг</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Шинэ нууц үг</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
              minLength={6}
            />
          </div>
          {passError && <p className="text-sm text-red-500">{passError}</p>}
          {passSuccess && <p className="text-sm text-green-500">Нууц үг амжилттай солигдлоо</p>}
          <button
            type="submit"
            disabled={passLoading}
            className="w-full py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50 text-sm"
          >
            {passLoading ? "Хадгалж байна..." : "Нууц үг солих"}
          </button>
        </form>
      </div>
    </div>
  )
}
