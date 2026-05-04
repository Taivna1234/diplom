"use client"

import { Suspense, useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { getSocket } from "@/lib/socket"
import { useAuth } from "@/context/AuthContext"
import { ConversationList } from "../components/messages/ConversationList"
import { ChatWindow } from "../components/messages/ChatWindow"
import { MessageInput } from "../components/messages/MessageInput"

interface Conversation {
  id: string
  participants: { user: { id: string; name: string; avatarUrl: string | null } }[]
  messages: { content: string }[]
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt?: string
}

function MessagesContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("c"))
  const [messages, setMessages] = useState<Message[]>([])
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    searchParams.get("c") ? "chat" : "list"
  )
  const selectedIdRef = useRef<string | null>(selectedId)

  // Keep ref in sync so socket handler always sees current value
  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  // Load conversations once
  useEffect(() => {
    api
      .get<Conversation[]>("/api/messages")
      .then((data) => {
        setConversations(data)
        setSelectedId((prev) => prev ?? (data.length > 0 ? data[0].id : null))
      })
      .catch(() => {})
  }, [])

  // Load message history when conversation changes
  const fetchMessages = useCallback(() => {
    if (!selectedId) return
    api
      .get<Message[]>(`/api/messages/${selectedId}`)
      .then(setMessages)
      .catch(() => {})
  }, [selectedId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Socket lifecycle
  useEffect(() => {
    if (!user) return
    const socket = getSocket()

    if (!socket.connected) socket.connect()

    const handleNewMessage = (msg: Message & { conversationId: string }) => {
      // Only append if it belongs to the currently open conversation
      if (msg.conversationId === selectedIdRef.current) {
        setMessages((prev) => {
          // Deduplicate by id in case REST and socket overlap
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }

      // Bump last message preview in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, messages: [{ content: msg.content }] }
            : c
        )
      )
    }

    socket.on("new_message", handleNewMessage)

    return () => {
      socket.off("new_message", handleNewMessage)
    }
  }, [user])

  // Join / leave rooms when selected conversation changes
  useEffect(() => {
    const socket = getSocket()
    if (!selectedId) return

    socket.emit("join", selectedId)

    return () => {
      socket.emit("leave", selectedId)
    }
  }, [selectedId])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setMobileView("chat")
  }

  const selectedConv = conversations.find((c) => c.id === selectedId)
  const recipient =
    selectedConv && user
      ? selectedConv.participants.find((p) => p.user.id !== user.id)?.user
      : undefined
  const recipientName = recipient?.name ?? ""
  const recipientAvatar = recipient?.avatarUrl ?? null

  return (
    <div className="h-[calc(100vh-88px)] flex overflow-hidden">
      {user && (
        <div className={`${mobileView === "list" ? "flex" : "hidden"} md:flex w-full md:w-80 flex-shrink-0`}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            currentUserId={user.id}
            onSelect={handleSelect}
          />
        </div>
      )}

      <div className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
        {selectedId && user ? (
          <>
            <div className="md:hidden px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button
                onClick={() => setMobileView("list")}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium"
              >
                ← Буцах
              </button>
            </div>
            <ChatWindow
              recipientName={recipientName}
              recipientAvatar={recipientAvatar}
              messages={messages}
              currentUserId={user.id}
            />
            <MessageInput conversationId={selectedId} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Яриа сонгоно уу
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  )
}
