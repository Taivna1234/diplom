"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { PostCard } from "../components/community/PostCard"
import { CreatePost } from "../components/community/CreatePost"

interface Post {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
  book: {
    externalId: string
    title: string
    thumbnailUrl: string | null
  } | null
  _count: { comments: number; likes: number }
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])

  const fetchPosts = useCallback(() => {
    api
      .get<Post[]>("/api/posts")
      .then(setPosts)
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <CreatePost onCreated={fetchPosts} />
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
