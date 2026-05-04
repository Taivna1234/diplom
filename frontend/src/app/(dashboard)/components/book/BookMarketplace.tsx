"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, X } from "lucide-react"
import { api } from "@/lib/api"
import { ListingCard } from "../marketplace/ListingCard"

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

export function BookMarketplace({ bookId }: { bookId: string }) {
  const [listings, setListings] = useState<Listing[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    api
      .get<Listing[]>(`/api/listings/book/${bookId}`)
      .then(setListings)
      .catch(() => {})
  }, [bookId])

  return (
    <div className="space-y-6">
      {!dismissed && (
        <div className="flex gap-4 p-4 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold">Анхааруулга</p>
            <p>
              BookIntelligence платформ нь хэрэглэгчдийн хоорондох арилжаанд ямар нэгэн хариуцлага хүлээхгүй болно.
              Худалдах, түрээслэх, эсвэл солилцохдоо өөрийн аюулгүй байдлыг хангана уу.
            </p>
            <p>
              Гүйлгээний үед <span className="font-medium">барьцаа авах</span> буюу{" "}
              <span className="font-medium">үнэмлэх шалгах</span>-ийг зөвлөж байна.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {listings.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Энэ номын зар олдсонгүй
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
