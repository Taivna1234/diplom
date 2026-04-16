"use client"

import { Search } from "lucide-react"
import { useState } from "react"

interface Conversation {
  id: string
  participants: { user: { id: string; name: string } }[]
  messages: { content: string }[]
}

interface Props {
  conversations: Conversation[]
  selectedId: string | null
  currentUserId: string
  onSelect: (id: string) => void
}

function otherParticipant(conv: Conversation, currentUserId: string) {
  return (
    conv.participants.find((p) => p.user.id !== currentUserId)?.user ?? {
      id: "",
      name: "Unknown",
    }
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("")

  const filtered = conversations.filter((c) => {
    const other = otherParticipant(c, currentUserId)
    return other.name.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="w-80 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Яриа хайх..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv) => {
          const other = otherParticipant(conv, currentUserId)
          const lastMsg = conv.messages[conv.messages.length - 1]
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full p-4 flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 transition ${
                selectedId === conv.id
                  ? "bg-blue-50 dark:bg-slate-700"
                  : "hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {initials(other.name)}
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {other.name}
                </h3>
                {lastMsg && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {lastMsg.content}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
