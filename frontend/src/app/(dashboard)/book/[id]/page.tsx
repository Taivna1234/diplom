"use client"

import { use, useEffect, useState } from "react"
import { MessageSquare, ShoppingBag, Sparkles, BookOpen, BookMarked, Check } from "lucide-react"
import { BookDiscussion } from "../../components/book/BookDiscussion"
import { BookMarketplace } from "../../components/book/BookMarketplace"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

type TabType = "overview" | "ai" | "discussion" | "marketplace"

interface Book {
  title: string
  authors?: string[]
  cover?: string
  categories?: string[]
  description?: string
  pages?: number
  published?: string
  averageRating?: number | null
  ratingsCount?: number | null
}

const fallbackBook: Book = {
  title: "Unknown Book",
  cover: "",
  categories: [],
  description: "",
  pages: 0,
  published: "",
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [book, setBook] = useState<Book>(fallbackBook)
  const [saved, setSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:5000/api/books/${id}?lang=mn`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setBook(data))
      .catch(() => {})
  }, [id])

  useEffect(() => {
    if (!user) return
    api
      .get<{ saved: boolean }>(`/api/library/${id}/status`)
      .then((data) => setSaved(data.saved))
      .catch(() => {})
  }, [id, user])

  const toggleLibrary = async () => {
    if (!user) return
    setSaveLoading(true)
    try {
      if (saved) {
        await api.delete(`/api/library/${id}`)
        setSaved(false)
      } else {
        await api.post(`/api/library/${id}`, {})
        setSaved(true)
      }
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  const tabs = [
    { id: "overview" as TabType, label: "Тойм", icon: BookOpen },
    { id: "ai" as TabType, label: "AI Туслах", icon: Sparkles },
    { id: "discussion" as TabType, label: "Хэлэлцүүлэг", icon: MessageSquare },
    { id: "marketplace" as TabType, label: "Зах зээл", icon: ShoppingBag },
  ]

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-12">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div className="w-full sm:w-48 md:w-64 flex-shrink-0 mx-auto sm:mx-0 max-w-[180px] sm:max-w-none">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                {book.cover && (
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                {book.categories?.map((c: string) => (
                  <span key={c} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm rounded-lg">
                    {c}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{book.title}</h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {book.authors?.join(", ")}
              </p>

              {book.averageRating ? (
                <div className="flex items-center gap-1 mb-6 text-sm">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={s <= Math.round(book.averageRating!) ? "text-yellow-400" : "text-gray-300"}>★</span>
                  ))}
                  <span className="ml-1 font-medium text-gray-800 dark:text-gray-100">{book.averageRating.toFixed(1)}</span>
                  {book.ratingsCount ? <span className="text-gray-400 ml-1">({book.ratingsCount.toLocaleString()} үнэлгээ)</span> : null}
                </div>
              ) : <div className="mb-6" />}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={toggleLibrary}
                  disabled={saveLoading || !user}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition hover:shadow-lg disabled:opacity-50 ${
                    saved
                      ? "bg-green-500 text-white"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                  }`}
                >
                  {saved ? <Check className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
                  {saved ? "Номын санд байна" : "Номын санд нэмэх"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition ${
                      activeTab === tab.id
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-slate-700"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 sm:p-8 text-gray-800 dark:text-gray-200">
            {activeTab === "overview" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Тайлбар</h3>
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">{book.description || "Тайлбар байхгүй байна."}</p>
              </div>
            )}
            {activeTab === "ai" && (
              <div className="space-y-6">
                {!summary && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      AI ашиглан энэ номын хураангуйг үүсгэнэ үү.
                    </p>
                    <button
                      onClick={async () => {
                        setSummaryLoading(true)
                        try {
                          const res = await api.get<{ summary: string }>(`/api/ai/book-summary/${id}`)
                          setSummary(res.summary)
                        } catch {
                          setSummary("Хураангуй үүсгэхэд алдаа гарлаа.")
                        } finally {
                          setSummaryLoading(false)
                        }
                      }}
                      disabled={summaryLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
                    >
                      <Sparkles className="w-5 h-5" />
                      {summaryLoading ? "Үүсгэж байна..." : "Хураангуй үүсгэх"}
                    </button>
                  </div>
                )}
                {summary && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">AI Хураангуй</h3>
                    </div>
                    <p className="leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{summary}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "discussion" && (
              <BookDiscussion
                bookId={id}
                bookInfo={{
                  id,
                  title: book.title,
                  cover: book.cover ?? "",
                  authors: book.authors ?? [],
                }}
              />
            )}
            {activeTab === "marketplace" && <BookMarketplace bookId={id} />}
          </div>
        </div>
      </div>

    </div>
  )
}
