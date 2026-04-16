"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { BookGrid } from "../books/BookGrid"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface Book {
  id: string
  externalId: string | null
  title: string
  thumbnailUrl: string | null
}

export function PersonalRecommendations() {
  const [books, setBooks] = useState<{ id: string; title: string; cover?: string }[]>([])
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading || !user) return
    api
      .get<Book[]>("/api/recommendations/personal")
      .then(data => {
        const filtered = data
          .filter(b => b.externalId && b.thumbnailUrl)
          .slice(0, 5)
          .map(b => ({ id: b.externalId!, title: b.title, cover: b.thumbnailUrl ?? undefined }))
        setBooks(filtered)
      })
      .catch(() => {})
  }, [user, loading])

  if (books.length === 0) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Санал болгох
        </h2>
      </div>
      <BookGrid books={books} />
    </section>
  )
}
