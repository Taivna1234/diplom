"use client"

import { useState } from "react"
import { Settings, Library, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { EditProfileModal } from "./EditProfileModal"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

type Tab = "library" | "discussions"

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function ProfileHeader({ activeTab, onTabChange }: Props) {
  const { user } = useAuth()
  const [showEdit, setShowEdit] = useState(false)

  if (!user) return null

  return (
    <>
      <div className="rounded-2xl p-4 sm:p-8 shadow-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0 border-2 border-blue-200"
              />
            ) : (
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold flex-shrink-0">
                {initials(user.name)}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">{user.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition text-sm self-start"
          >
            <Settings className="w-4 h-4" />
            Профайл засах
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {([
          { key: "library", label: "Номын сан", icon: Library },
          { key: "discussions", label: "Хэлэлцүүлэг", icon: MessageSquare },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`rounded-2xl p-6 shadow-sm text-center border transition ${
              activeTab === key
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
              activeTab === key ? "bg-blue-100 dark:bg-blue-800/60" : "bg-blue-100 dark:bg-blue-900/40"
            }`}>
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={`text-sm font-medium ${
              activeTab === key ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
            }`}>
              {label}
            </div>
          </button>
        ))}
      </div>

      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
    </>
  )
}
