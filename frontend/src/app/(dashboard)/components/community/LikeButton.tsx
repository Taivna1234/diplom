"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface Props {
  postId: string
  initialCount: number
}

export function LikeButton({ postId, initialCount }: Props) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    if (!user) return
    api.get<{ liked: boolean }>(`/api/likes/${postId}/status`)
      .then((data) => setLiked(data.liked))
      .catch(() => {})
  }, [postId, user])

  const toggle = async () => {
    try {
      if (liked) {
        await api.delete(`/api/likes/${postId}`)
        setCount((c) => c - 1)
      } else {
        await api.post(`/api/likes/${postId}`)
        setCount((c) => c + 1)
      }
      setLiked((l) => !l)
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 hover:text-blue-500 transition ${
        liked ? "text-blue-500" : ""
      }`}
    >
      <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      {count}
    </button>
  )
}
