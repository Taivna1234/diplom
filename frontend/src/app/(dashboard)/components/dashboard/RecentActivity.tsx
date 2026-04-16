"use client"

import { useEffect, useState } from "react"
import { MessageSquare } from "lucide-react"
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

export function RecentActivity() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    api
      .get<Post[]>("/api/posts")
      .then((data) => setPosts(data.slice(0, 5)))
      .catch(() => {})
  }, [])

  if (posts.length === 0) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Сүүлийн үеийн хэлэлцүүлгүүд
        </h2>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
