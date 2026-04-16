"use client"

import { X, Send, Sparkles, BookOpen, Lightbulb, Star, Users, ExternalLink } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import Link from "next/link"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
}

type Mode = "chat" | "summary" | "recommendations"

interface BookCard {
  id: string
  title: string
  cover: string | null
  authors: string[]
  categories: string[]
  rating: number | null
}

interface RecommendationResult {
  contentBased: BookCard[]
  collaborative: BookCard[]
}

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  darkMode?: boolean
  bookId?: string
  bookTitle?: string
}

export function AIAssistantModal({ isOpen, onClose, darkMode = false, bookId, bookTitle }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", type: "assistant", content: "Сайн уу! Би таны номын AI туслах. Номын талаар асуулт асуугаарай." },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>("chat")
  const [summaryTitle, setSummaryTitle] = useState(bookTitle ?? "")
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
  const [recoLoading, setRecoLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const addMessage = (type: "user" | "assistant", content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type, content }])
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput("")
    addMessage("user", question)
    setLoading(true)
    try {
      const res = await api.post<{ answer: string }>("/api/ai/book-question", {
        question,
        bookId: bookId ?? null,
      })
      addMessage("assistant", res.answer)
    } catch {
      addMessage("assistant", "Алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setLoading(false)
    }
  }

  const handleShowRecommendations = async () => {
    if (mode === "recommendations") { setMode("chat"); return }
    setMode("recommendations")
    if (recommendations) return  // already loaded
    setRecoLoading(true)
    try {
      const params = bookId ? `?bookId=${bookId}` : ""
      const res = await api.get<RecommendationResult>(`/api/ai/recommendations${params}`)
      setRecommendations(res)
    } catch {
      setRecommendations({ contentBased: [], collaborative: [] })
    } finally {
      setRecoLoading(false)
    }
  }

  const handleBookCardClick = async (book: BookCard) => {
    setMode("chat")
    addMessage("user", `"${book.title}" номын тухай`)
    setLoading(true)
    try {
      // Fetch full data from backend (fetches from Google Books API & stores if not cached)
      const data = await api.get<any>(`/api/books/${book.id}?lang=mn`)
      const authors    = (data.authors ?? []).join(", ") || "Тодорхойгүй"
      const rating     = data.averageRating ? `⭐ ${data.averageRating}/5` : ""
      const published  = data.published ? `📅 ${String(data.published).slice(0, 4)}` : ""
      const desc       = data.description ? data.description.slice(0, 400) + (data.description.length > 400 ? "…" : "") : ""
      const meta       = [authors && `✍️ ${authors}`, published, rating].filter(Boolean).join("  •  ")
      addMessage("assistant", `📖 **${data.title ?? book.title}**\n${meta}\n\n${desc}\n\n__book_link__${book.id}`)
    } catch {
      addMessage("assistant", "Номын мэдээллийг авахад алдаа гарлаа.")
    } finally {
      setLoading(false)
    }
  }

  // Summary for current book (when opened from book detail page)
  const handleSummaryCurrentBook = async () => {
    if (!bookId || loading) return
    setMode("chat")
    addMessage("user", `"${bookTitle}" номын хураангуй`)
    setLoading(true)
    try {
      const res = await api.get<{ summary: string }>(`/api/ai/book-summary/${bookId}`)
      addMessage("assistant", res.summary)
    } catch {
      addMessage("assistant", "Хураангуй үүсгэхэд алдаа гарлаа.")
    } finally {
      setLoading(false)
    }
  }

  // Summary by title (user types a book name)
  const handleSummaryByTitle = async () => {
    if (!summaryTitle.trim() || loading) return
    setMode("chat")
    addMessage("user", `"${summaryTitle}" номын хураангуй`)
    setLoading(true)
    try {
      const res = await api.post<{ summary: string }>("/api/ai/summary-by-title", { title: summaryTitle.trim() })
      addMessage("assistant", res.summary)
    } catch {
      addMessage("assistant", "Хураангуй үүсгэхэд алдаа гарлаа.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const card = darkMode ? "bg-slate-800/90 backdrop-blur-xl border-slate-700/40" : "bg-white/90 backdrop-blur-xl border-white/40"
  const text = darkMode ? "text-gray-100" : "text-gray-800"
  const subtext = darkMode ? "text-gray-400" : "text-gray-500"
  const border = darkMode ? "border-slate-700/50" : "border-gray-200/50"
  const inputCls = darkMode ? "bg-slate-700/80 border-slate-600 text-gray-100 placeholder-gray-500" : "bg-white/80 border-gray-200 text-gray-800 placeholder-gray-500"
  const bubbleAI = darkMode ? "bg-slate-700/90 text-gray-100 border border-slate-600/50" : "bg-white/90 text-gray-800 border border-gray-200/50"

  return (
    <>
      <div className={`fixed inset-0 z-50 ${darkMode ? "bg-black/40" : "bg-black/20"} backdrop-blur-sm`} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col pointer-events-auto ${card}`} style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between flex-shrink-0 ${border}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-xl font-semibold ${text}`}>AI Номын Туслах</h2>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"}`}>
              <X className={`w-5 h-5 ${subtext}`} />
            </button>
          </div>

          {/* Quick action buttons */}
          <div className={`px-6 py-3 flex flex-wrap gap-2 border-b flex-shrink-0 ${border}`}>
            {bookId && (
              <button
                onClick={handleSummaryCurrentBook}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 transition disabled:opacity-50"
              >
                <BookOpen className="w-4 h-4" />
                Хураангуй үүсгэх
              </button>
            )}
            <button
              onClick={() => setMode(mode === "summary" ? "chat" : "summary")}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                mode === "summary"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Номын нэрээр хураангуй
            </button>
            <button
              onClick={handleShowRecommendations}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                mode === "recommendations"
                  ? "bg-violet-600 text-white"
                  : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100"
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Зөвлөмж
            </button>
          </div>

          {/* Summary by title input panel */}
          {mode === "summary" && (
            <div className={`px-6 py-4 border-b flex-shrink-0 space-y-2 ${border}`}>
              <p className={`text-sm font-medium ${text}`}>Хураангуйлах номын нэрийг оруулна уу:</p>
              <div className="flex gap-2">
                <input
                  value={summaryTitle}
                  onChange={e => setSummaryTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSummaryByTitle()}
                  placeholder="Номын нэр..."
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                />
                <button
                  onClick={handleSummaryByTitle}
                  disabled={loading || !summaryTitle.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-md transition"
                >
                  Үүсгэх
                </button>
              </div>
            </div>
          )}

          {/* Recommendations panel */}
          {mode === "recommendations" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {recoLoading ? (
                <div className={`text-sm text-center animate-pulse ${subtext}`}>Зөвлөмж боловсруулж байна...</div>
              ) : (
                <>
                  {/* Content-based */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <h3 className={`text-sm font-semibold ${text}`}>Таны уншсан номтой төстэй</h3>
                      <span className={`text-xs ${subtext}`}>(Content-based)</span>
                    </div>
                    {recommendations?.contentBased.length === 0 ? (
                      <p className={`text-xs ${subtext}`}>Мэдээлэл хангалтгүй байна.</p>
                    ) : (
                      <div className="space-y-2">
                        {recommendations?.contentBased.map(book => (
                          <RecoBookCard key={book.id} book={book} darkMode={darkMode} onClick={() => handleBookCardClick(book)} />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Collaborative */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-violet-500" />
                      <h3 className={`text-sm font-semibold ${text}`}>Таны адил уншигчдын дуртай</h3>
                      <span className={`text-xs ${subtext}`}>(Collaborative)</span>
                    </div>
                    {recommendations?.collaborative.length === 0 ? (
                      <p className={`text-xs ${subtext}`}>Мэдээлэл хангалтгүй байна.</p>
                    ) : (
                      <div className="space-y-2">
                        {recommendations?.collaborative.map(book => (
                          <RecoBookCard key={book.id} book={book} darkMode={darkMode} onClick={() => handleBookCardClick(book)} />
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          )}

          {/* Messages + Input (hidden in recommendations mode) */}
          {mode !== "recommendations" && (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {messages.map(message => {
                  const bookLinkMatch = message.type === "assistant" && message.content.includes("__book_link__")
                  const cleanContent  = bookLinkMatch ? message.content.replace(/__book_link__.*$/, "").trim() : message.content
                  const linkedBookId  = bookLinkMatch ? message.content.split("__book_link__")[1] : null
                  return (
                    <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md ${message.type === "user" ? "ml-16" : "mr-16"}`}>
                        <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          message.type === "user" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : bubbleAI
                        }`}>
                          {cleanContent}
                          {linkedBookId && (
                            <Link
                              href={`/book/${linkedBookId}`}
                              onClick={onClose}
                              className="mt-3 flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-xs font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Дэлгэрэнгүй харах
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {loading && (
                  <div className="flex justify-start">
                    <div className={`px-5 py-4 rounded-2xl text-sm ${bubbleAI}`}>
                      <span className="animate-pulse">Бодож байна...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className={`px-6 py-4 border-t flex-shrink-0 ${border}`}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Номын талаар асуулт асуугаарай..."
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 ${inputCls}`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}

// ── Small book card component for recommendations ────────────────────────────
function RecoBookCard({ book, darkMode, onClick }: { book: BookCard; darkMode: boolean; onClick: () => void }) {
  const cardBg  = darkMode ? "bg-slate-700/60 hover:bg-slate-700" : "bg-gray-50 hover:bg-gray-100"
  const titleCls = darkMode ? "text-gray-100" : "text-gray-800"
  const subCls   = darkMode ? "text-gray-400" : "text-gray-500"

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${cardBg}`}
    >
      {book.cover ? (
        <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
      ) : (
        <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${titleCls}`}>{book.title}</p>
        {book.authors.length > 0 && (
          <p className={`text-xs truncate mt-0.5 ${subCls}`}>{book.authors.join(", ")}</p>
        )}
        {book.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className={`text-xs ${subCls}`}>{book.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <ExternalLink className={`w-3.5 h-3.5 flex-shrink-0 ${subCls}`} />
    </button>
  )
}
