"use client"

import { useRef, useState } from "react"
import { BookPlus, ImagePlus, Loader2, Sparkles, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CreatedBook {
  id: string
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState("")
  const [authors, setAuthors] = useState("")
  const [categories, setCategories] = useState("")
  const [published, setPublished] = useState("")
  const [description, setDescription] = useState("")
  const [cover, setCover] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleCoverChange = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCover(typeof reader.result === "string" ? reader.result : null)
    reader.readAsDataURL(file)
  }

  const reset = () => {
    setTitle("")
    setAuthors("")
    setCategories("")
    setPublished("")
    setDescription("")
    setCover(null)
    setError("")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const book = await api.post<CreatedBook>("/api/books/manual", {
        title,
        authors: splitList(authors),
        categories: splitList(categories),
        published: published || null,
        description,
        cover,
        language: "mn",
      })
      reset()
      onClose()
      router.push(`/book/${book.id}`)
    } catch (err: any) {
      setError(err.message || "Book creation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/30 bg-gradient-to-br from-blue-500/85 via-sky-500/85 to-cyan-500/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl bg-white/20 p-2 text-white transition hover:bg-white/30"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-7 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-700 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Ном нэмэх</h2>
          <p className="mt-1 text-sm text-white/80">Өөрийн номын мэдээллийг гараар оруулна уу.</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-500/25 px-4 py-3 text-sm text-white">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleCoverChange(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-white/40 text-white transition hover:bg-white/50"
            >
              {cover ? (
                <img src={cover} alt="Book cover" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm font-medium">
                  <ImagePlus className="h-7 w-7" />
                  Cover
                </span>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Гарчиг</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="w-full rounded-xl border border-white/40 bg-white/65 px-4 py-3 text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/60"
                placeholder="Book title"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Зохиолч</span>
              <input
                value={authors}
                onChange={(event) => setAuthors(event.target.value)}
                className="w-full rounded-xl border border-white/40 bg-white/65 px-4 py-3 text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/60"
                placeholder="Author one, Author two"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Ангилал</span>
                <input
                  value={categories}
                  onChange={(event) => setCategories(event.target.value)}
                  className="w-full rounded-xl border border-white/40 bg-white/65 px-4 py-3 text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/60"
                  placeholder="Novel, History"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Хэвлэгдсэн огноо</span>
                <input
                  type="date"
                  value={published}
                  onChange={(event) => setPublished(event.target.value)}
                  className="w-full rounded-xl border border-white/40 bg-white/65 px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-white/60"
                />
              </label>
            </div>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-white">Тайлбар</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-white/40 bg-white/65 px-4 py-3 text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/60"
            placeholder="Write a short description..."
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-semibold text-blue-600 shadow-lg transition hover:bg-white/90 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookPlus className="h-5 w-5" />}
          {loading ? "Хадгалж байна..." : "Ном нэмэх"}
        </button>
      </form>
    </div>
  )
}
