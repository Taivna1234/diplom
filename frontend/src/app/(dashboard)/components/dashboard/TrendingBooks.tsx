"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { BookGrid } from "../books/BookGrid"
import { api } from "@/lib/api"

interface Book {
  id: string
  externalId: string | null
  title: string
  thumbnailUrl: string | null
}

export function TrendingBooks() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    api
      .get<Book[]>("/api/recommendations/trending")
      .then((data) => setBooks(data.slice(0, 5)))
      .catch(() => {})
  }, [])

  if (books.length === 0) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Энэ долоо хоногт алдартай
        </h1>
      </div>
      <BookGrid
        books={books.map((b) => ({
          id: b.externalId || b.id,
          title: b.title,
          cover: b.thumbnailUrl ?? undefined,
        }))}
      />
    </section>
  )
}
