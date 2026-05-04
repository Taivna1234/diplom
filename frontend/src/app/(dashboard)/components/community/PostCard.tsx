"use client"

import { useState, useCallback } from "react"
import { MessageSquare, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LikeButton } from "./LikeButton"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string }
  replies: { id: string; content: string; user: { id: string; name: string } }[]
}

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} минутын өмнө`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} цагийн өмнө`
  return `${Math.floor(hrs / 24)} өдрийн өмнө`
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function BookCover({ book }: { book: Post["book"] }) {
  if (!book) return null
  const inner = (
    <div className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700 mb-4">
      <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 flex items-center justify-center">
        {book.thumbnailUrl ? (
          <img src={book.thumbnailUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-2">
          {book.title}
        </p>
      </div>
    </div>
  )
  return book.externalId ? (
    <Link href={`/book/${book.externalId}`}>{inner}</Link>
  ) : inner
}

export function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentCount, setCommentCount] = useState(post._count.comments)
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null)
  const [replyText, setReplyText] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  // For own posts use the live context avatar so it reflects profile changes immediately
  const postAvatar = user?.id === post.user.id ? user?.avatarUrl : post.user.avatarUrl

  const goToMessage = async () => {
    if (!user || user.id === post.user.id) return
    try {
      const conv = await api.post<{ id: string }>("/api/messages/start", { otherUserId: post.user.id })
      router.push(`/messages?c=${conv.id}`)
    } catch {}
  }

  const loadComments = useCallback(() => {
    api
      .get<Comment[]>(`/api/comments/${post.id}`)
      .then(setComments)
      .catch(() => {})
  }, [post.id])

  const toggleComments = () => {
    if (!showComments) loadComments()
    setShowComments((v) => !v)
  }

  const submitComment = async () => {
    if (!commentText.trim()) return
    setCommentLoading(true)
    try {
      await api.post("/api/comments", { postId: post.id, content: commentText })
      setCommentText("")
      setCommentCount((c) => c + 1)
      loadComments()
    } catch {
    } finally {
      setCommentLoading(false)
    }
  }

  const submitReply = async () => {
    if (!replyText.trim() || !replyingTo) return
    setCommentLoading(true)
    try {
      await api.post("/api/comments", { postId: post.id, content: replyText, parentId: replyingTo.id })
      setReplyText("")
      setReplyingTo(null)
      setCommentCount((c) => c + 1)
      loadComments()
    } catch {
    } finally {
      setCommentLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-6 border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <button
          onClick={goToMessage}
          disabled={!user || user.id === post.user.id}
          className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 disabled:cursor-default hover:opacity-80 transition"
        >
          {postAvatar ? (
            <img src={postAvatar} alt={post.user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
              {initials(post.user.name)}
            </div>
          )}
        </button>
        <div>
          <button
            onClick={goToMessage}
            disabled={!user || user.id === post.user.id}
            className="font-semibold text-gray-800 dark:text-gray-100 text-sm disabled:cursor-default hover:underline"
          >
            {post.user.name}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {timeAgo(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Book */}
      <BookCover book={post.book} />

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        <LikeButton postId={post.id} initialCount={post._count.likes} />
        <button
          onClick={toggleComments}
          className="flex items-center gap-2 hover:text-blue-500 transition"
        >
          <MessageSquare className="w-4 h-4" />
          {commentCount} сэтгэгдэл
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="space-y-2">
              {/* Root comment */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {initials(c.user.name)}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-slate-700 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
                    {c.user.name}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {c.content}
                  </p>
                  {user && (
                    <button
                      onClick={() => setReplyingTo(replyingTo?.id === c.id ? null : { id: c.id, name: c.user.name })}
                      className="mt-1 text-xs text-blue-500 hover:text-blue-600 transition"
                    >
                      {replyingTo?.id === c.id ? "Болих" : "Хариу бичих"}
                    </button>
                  )}
                </div>
              </div>

              {/* Replies */}
              {c.replies.length > 0 && (
                <div className="ml-10 space-y-2">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {initials(r.user.name)}
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-slate-700 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
                          {r.user.name}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {r.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyingTo?.id === c.id && user && (
                <div className="ml-10 flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitReply()}
                    placeholder={`${c.user.name}-д хариулах...`}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={submitReply}
                    disabled={commentLoading || !replyText.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-md transition"
                  >
                    Илгээх
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Comment input */}
          {user && (
            <div className="flex gap-3 pt-1">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {initials(user.name)}
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  placeholder="Сэтгэгдэл бичих..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={submitComment}
                  disabled={commentLoading || !commentText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-md transition"
                >
                  Илгээх
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
