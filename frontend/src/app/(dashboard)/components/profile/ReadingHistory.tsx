"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"

interface Book {
  id: string
  externalId: string | null
  title: string
  thumbnailUrl: string | null
}

export function ReadingHistory() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Book[]>("/api/library")
      .then(setBooks)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  if (books.length === 0) {
    return (
      <div className="rounded-2xl p-8 shadow-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Номын сан</h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
          Номын сан хоосон байна. Номын дэлгэрэнгүй хуудаснаас номоо нэмнэ үү.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-8 shadow-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Номын сан</h2>
      <div className="grid grid-cols-4 gap-6">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/book/${book.externalId || book.id}`}
            className="group cursor-pointer"
          >
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 mb-3">
              {book.thumbnailUrl ? (
                <img
                  src={book.thumbnailUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  {book.title}
                </div>
              )}
            </div>
            <h3 className="font-medium truncate text-gray-800 dark:text-gray-100 text-sm">
              {book.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
