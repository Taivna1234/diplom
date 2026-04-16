"use client"

import { useState, useEffect } from "react"
import { Send } from "lucide-react"
import { getSocket } from "@/lib/socket"

interface Props {
  conversationId: string
}

export function MessageInput({ conversationId }: Props) {
  const [content, setContent] = useState("")
  const [typing, setTyping] = useState(false)
  const typingTimeout = typeof window !== "undefined" ? { current: null as ReturnType<typeof setTimeout> | null } : { current: null }

  const send = () => {
    if (!content.trim()) return
    const socket = getSocket()
    socket.emit("send_message", { conversationId, content: content.trim() })
    setContent("")
    // stop typing indicator
    socket.emit("stop_typing", conversationId)
    setTyping(false)
  }

  const handleChange = (val: string) => {
    setContent(val)
    const socket = getSocket()
    if (!typing) {
      socket.emit("typing", conversationId)
      setTyping(true)
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", conversationId)
      setTyping(false)
    }, 1500)
  }

  return (
    <div className="p-4 border-t border-gray-200 dark:border-slate-700">
      <div className="flex gap-3">
        <input
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Мессеж бичих..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={send}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
