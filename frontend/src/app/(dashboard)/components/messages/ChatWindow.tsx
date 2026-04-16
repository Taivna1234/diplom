"use client"

import { useEffect, useRef, useState } from "react"
import { getSocket } from "@/lib/socket"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt?: string
}

interface Props {
  recipientName: string
  messages: Message[]
  currentUserId: string
}

export function ChatWindow({ recipientName, messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Typing indicator from socket
  useEffect(() => {
    const socket = getSocket()

    const onTyping = () => {
      setIsTyping(true)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => setIsTyping(false), 2000)
    }

    const onStopTyping = () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      setIsTyping(false)
    }

    socket.on("typing", onTyping)
    socket.on("stop_typing", onStopTyping)

    return () => {
      socket.off("typing", onTyping)
      socket.off("stop_typing", onStopTyping)
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 min-h-0">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {recipientName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            {recipientName}
          </h2>
          {isTyping && (
            <p className="text-xs text-gray-400 dark:text-gray-500">бичиж байна...</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-sm"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-slate-700 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
