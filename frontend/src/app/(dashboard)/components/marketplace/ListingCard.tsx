"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

interface Listing {
  id: string
  type: "SELL" | "RENT" | "EXCHANGE"
  condition: string
  price: number | null
  location: string
  rentDurationDays: number | null
  photoBase64: string | null
  book: { externalId: string; title: string; thumbnailUrl: string | null }
  user: { id: string; name: string }
}

const TYPE_LABEL: Record<string, string> = {
  SELL: "Зарах",
  RENT: "Түрээслэх",
  EXCHANGE: "Солилцох",
}

function formatPrice(listing: Listing) {
  if (listing.type === "EXCHANGE") return "Солилцох"
  if (!listing.price) return "—"
  if (listing.type === "RENT") return `${listing.price}₮/7 хоног`
  return `${listing.price}₮`
}

export function ListingCard({ listing }: { listing: Listing }) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [closed, setClosed] = useState(false)

  const handleContact = async () => {
    setLoading(true)
    try {
      const conv = await api.post<{ id: string }>("/api/messages/start", {
        otherUserId: listing.user.id,
        listingId: listing.id,
      })
      router.push(`/messages?c=${conv.id}`)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    setLoading(true)
    try {
      await api.patch(`/api/listings/${listing.id}/close`, {})
      setClosed(true)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (closed) return null

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition">
      <div className="aspect-[3/4] bg-gray-200 dark:bg-slate-700">
        {listing.photoBase64 ? (
          <img src={listing.photoBase64} alt={listing.book.title} className="w-full h-full object-cover" />
        ) : listing.book.thumbnailUrl ? (
          <img src={listing.book.thumbnailUrl} alt={listing.book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No cover
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex justify-between">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-1">
            {listing.book.title}
          </h3>
          <span className="text-xs text-gray-500">{TYPE_LABEL[listing.type]}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{listing.user.name}</p>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">{listing.condition}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {formatPrice(listing)}
          </span>
        </div>
        <p className="text-xs text-gray-500">Байршил:{listing.location}</p>
        {user && user.id !== listing.user.id && (
          <button
            onClick={handleContact}
            disabled={loading}
            className="w-full mt-2 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading ? "Уншиж байна..." : "Холбоо барих"}
          </button>
        )}
        {user && user.id === listing.user.id && (
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-full mt-2 py-2 rounded-lg border border-red-300 dark:border-red-700 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
          >
            {loading ? "Хүлээнэ үү..." : "Зар хаах"}
          </button>
        )}
      </div>
    </div>
  )
}
