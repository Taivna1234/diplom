"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { PostCard } from "../community/PostCard"

interface Post {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
  book: { externalId: string; title: string; thumbnailUrl: string | null } | null
  _count: { comments: number; likes: number }
}

export function UserPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Post[]>("/api/users/posts")
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  if (posts.length === 0) {
    return (
      <p className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">
        Одоогоор нийтлэл байхгүй байна
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
