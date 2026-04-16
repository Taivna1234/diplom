"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, X } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface Props {
  onCreated: () => void
  preselectedBook?: BookResult | null
}

interface BookResult {
  id: string
  title: string
  cover: string
  authors: string[]
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function CreatePost({ onCreated, preselectedBook }: Props) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [showBookSearch, setShowBookSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BookResult[]>([])
  const [selectedBook, setSelectedBook] = useState<BookResult | null>(preselectedBook ?? null)
  const { user } = useAuth()
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/books/search?q=${encodeURIComponent(searchQuery)}`,
        { credentials: "include" }
      )
        .then((r) => r.json())
        .then((data) => setSearchResults(Array.isArray(data) ? data : []))
        .catch(() => {})
    }, 400)
  }, [searchQuery])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      await api.post("/api/posts", {
        content,
        bookId: selectedBook?.id ?? null,
      })
      setContent("")
      setSelectedBook(null)
      setShowBookSearch(false)
      setSearchQuery("")
      onCreated()
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-6 border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {user ? initials(user.name) : "?"}
        </div>

        <div className="flex-1 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Номын талаар бодлоо хуваалцаарай..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200"
          />

          {/* Selected book preview */}
          {selectedBook && (
            <div className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
              {selectedBook.cover && (
                <img
                  src={selectedBook.cover}
                  alt={selectedBook.title}
                  className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-2">
                  {selectedBook.title}
                </p>
                {selectedBook.authors?.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {selectedBook.authors.join(", ")}
                  </p>
                )}
              </div>
              {!preselectedBook && (
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Book search */}
          {showBookSearch && !selectedBook && (
            <div className="relative">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ном хайх..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                  {searchResults.slice(0, 5).map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book)
                        setShowBookSearch(false)
                        setSearchQuery("")
                        setSearchResults([])
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition text-left border-b border-gray-100 dark:border-slate-700 last:border-0"
                    >
                      {book.cover && (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-8 h-11 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">
                          {book.title}
                        </p>
                        {book.authors?.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {book.authors[0]}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            {!selectedBook && !preselectedBook && (
              <button
                onClick={() => setShowBookSearch((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Ном нэмэх
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Нийтэлж байна..." : "Нийтлэх"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
