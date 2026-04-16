"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface Message {
  id: string
  content: string
  createdAt: string
  sender: { id: string; name: string }
}

interface Props {
  listingId: string
  otherUserId: string
  otherUserName: string
  bookTitle: string
  onClose: () => void
}

export function ChatModal({ listingId, otherUserId, otherUserName, bookTitle, onClose }: Props) {
  const { user } = useAuth()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api
      .post<{ id: string }>("/api/messaging/start", { otherUserId, listingId })
      .then((conv) => {
        setConversationId(conv.id)
        return api.get<Message[]>(`/api/messaging/${conv.id}`)
      })
      .then(setMessages)
      .catch(() => {})
  }, [listingId, otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    if (!text.trim() || !conversationId) return
    setSending(true)
    try {
      await api.post("/api/messaging/send", { conversationId, content: text })
      setText("")
      const updated = await api.get<Message[]>(`/api/messaging/${conversationId}`)
      setMessages(updated)
    } catch {
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{otherUserName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{bookTitle}</p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400 mt-8">
              Анхны мессеж илгээгээрэй
            </p>
          )}
          {messages.map((m) => {
            const mine = m.sender.id === user?.id
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    mine
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Мессеж бичих..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl disabled:opacity-50 hover:shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
