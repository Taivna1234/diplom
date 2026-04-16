"use client"

import { useEffect, useState, useCallback } from "react"
import { ShieldAlert, X } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { ListingCard } from "../components/marketplace/ListingCard"
import { ListingFilters } from "../components/marketplace/ListingFilters"
import { CreateListingModal } from "../components/marketplace/CreateListingModal"

type Filter = "ALL" | "SELL" | "RENT" | "EXCHANGE"

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

export default function MarketplacePage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState<Filter>("ALL")
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [onlyMine, setOnlyMine] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const fetchListings = useCallback(() => {
    api
      .get<Listing[]>("/api/listings")
      .then(setListings)
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const filtered = listings.filter((l) => {
    if (filter !== "ALL" && l.type !== filter) return false
    if (location && l.location !== location) return false
    if (onlyMine && l.user.id !== user?.id) return false
    if (search && !l.book.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {!bannerDismissed && (
          <div className="flex gap-4 p-4 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold">Анхааруулга</p>
              <p>
                BookIntelligence платформ нь хэрэглэгчдийн хоорондох арилжаанд ямар нэгэн хариуцлага хүлээхгүй болно.
                Худалдах, түрээслэх, эсвэл солилцохдоо өөрийн аюулгүй байдлыг хангана уу.
              </p>
              <p>
                Гүйлгээний үед <span className="font-medium">барьцаа авах</span> эсвэл{" "}
                <span className="font-medium">бичиг баримт</span>авах-ийг зөвлөж байна.
              </p>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <ListingFilters
          filter={filter}
          onChange={setFilter}
          onCreateClick={() => setShowModal(true)}
          search={search}
          onSearchChange={setSearch}
          location={location}
          onLocationChange={setLocation}
          onlyMine={onlyMine}
          onOnlyMineChange={setOnlyMine}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      </div>

      {showModal && (
        <CreateListingModal
          onClose={() => setShowModal(false)}
          onCreated={fetchListings}
        />
      )}
    </div>
  )
}
