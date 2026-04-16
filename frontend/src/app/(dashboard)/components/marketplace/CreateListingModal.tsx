"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { api } from "@/lib/api"

interface Props {
  onClose: () => void
  onCreated: () => void
}

interface BookResult {
  id: string
  title: string
  cover: string
  authors: string[]
}

type ListingType = "SELL" | "RENT" | "EXCHANGE"

export function CreateListingModal({ onClose, onCreated }: Props) {
  const [bookTitle, setBookTitle] = useState("")
  const [selectedBook, setSelectedBook] = useState<BookResult | null>(null)
  const [suggestions, setSuggestions] = useState<BookResult[]>([])
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [type, setType] = useState<ListingType>("SELL")
  const [price, setPrice] = useState("")
  const [rentDays, setRentDays] = useState("")
  const [condition, setCondition] = useState("")
  const [location, setLocation] = useState("")
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (selectedBook || !bookTitle.trim()) {
      setSuggestions([])
      return
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/books/search?q=${encodeURIComponent(bookTitle)}`,
        { credentials: "include" }
      )
        .then((r) => r.json())
        .then((data) => setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []))
        .catch(() => {})
    }, 350)
  }, [bookTitle, selectedBook])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoBase64(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.post("/api/listings", {
        bookTitle: selectedBook ? selectedBook.title : bookTitle,
        bookExternalId: selectedBook?.id ?? null,
        type,
        price: price ? parseFloat(price) : null,
        rentDurationDays: rentDays ? parseInt(rentDays) : null,
        condition,
        location,
        photoBase64,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message || "Зар үүсгэхэд алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Зар үүсгэх</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Book title with suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Номын нэр
            </label>

            {selectedBook ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                {selectedBook.cover && (
                  <img src={selectedBook.cover} alt={selectedBook.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">{selectedBook.title}</p>
                  {selectedBook.authors?.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedBook.authors[0]}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedBook(null); setBookTitle("") }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Номын нэрийг бичнэ үү"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                    {suggestions.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedBook(book)
                          setBookTitle(book.title)
                          setSuggestions([])
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition text-left border-b border-gray-100 dark:border-slate-700 last:border-0"
                      >
                        {book.cover && (
                          <img src={book.cover} alt={book.title} className="w-8 h-11 object-cover rounded flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{book.title}</p>
                          {book.authors?.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{book.authors[0]}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Номын зураг
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 dark:file:bg-slate-700 dark:file:text-blue-400 hover:file:bg-blue-100"
            />
            {photoBase64 && (
              <img src={photoBase64} alt="preview" className="mt-2 h-32 w-auto rounded-lg object-cover" />
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Төрөл</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ListingType)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="SELL">Зарах</option>
              <option value="RENT">Түрээслэх</option>
              <option value="EXCHANGE">Солилцох</option>
            </select>
          </div>

          {type !== "EXCHANGE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Үнэ (₮)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}

          {type === "RENT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Түрээсийн хугацаа (өдөр)</label>
              <input
                type="number"
                min="1"
                value={rentDays}
                onChange={(e) => setRentDays(e.target.value)}
                placeholder="7 өдөр"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Байдал</label>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Шинэ, Маш сайн, Сайн, Хэрэглэсэн..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Байршил</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            >
              <option value="">Байршил сонгох...</option>
              <option value="Улаанбаатар">Улаанбаатар</option>
              <option value="Архангай">Архангай</option>
              <option value="Баян-Өлгий">Баян-Өлгий</option>
              <option value="Баянхонгор">Баянхонгор</option>
              <option value="Булган">Булган</option>
              <option value="Говь-Алтай">Говь-Алтай</option>
              <option value="Говьсүмбэр">Говьсүмбэр</option>
              <option value="Дархан-Уул">Дархан-Уул</option>
              <option value="Дорнод">Дорнод</option>
              <option value="Дорноговь">Дорноговь</option>
              <option value="Дундговь">Дундговь</option>
              <option value="Завхан">Завхан</option>
              <option value="Орхон">Орхон</option>
              <option value="Өвөрхангай">Өвөрхангай</option>
              <option value="Өмнөговь">Өмнөговь</option>
              <option value="Сүхбаатар">Сүхбаатар</option>
              <option value="Сэлэнгэ">Сэлэнгэ</option>
              <option value="Төв">Төв</option>
              <option value="Увс">Увс</option>
              <option value="Ховд">Ховд</option>
              <option value="Хөвсгөл">Хөвсгөл</option>
              <option value="Хэнтий">Хэнтий</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Үүсгэж байна..." : "Зар үүсгэх"}
          </button>
        </form>
      </div>
    </div>
  )
}
