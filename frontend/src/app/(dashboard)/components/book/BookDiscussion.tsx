"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { PostCard } from "../community/PostCard"
import { CreatePost } from "../community/CreatePost"

interface Post {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
  book: { externalId: string; title: string; thumbnailUrl: string | null } | null
  _count: { comments: number; likes: number }
}

interface BookInfo {
  id: string
  title: string
  cover: string
  authors: string[]
}

export function BookDiscussion({ bookId, bookInfo }: { bookId: string; bookInfo?: BookInfo }) {
  const [posts, setPosts] = useState<Post[]>([])

  const fetchPosts = useCallback(() => {
    api
      .get<Post[]>(`/api/posts/book/${bookId}`)
      .then(setPosts)
      .catch(() => {})
  }, [bookId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <div className="space-y-6">
      <CreatePost onCreated={fetchPosts} preselectedBook={bookInfo ?? null} />
      {posts.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Энэ номын талаар хэлэлцүүлэг алга байна
        </p>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
