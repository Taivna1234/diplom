"use client"

import { useEffect, useState, use } from "react"
import { BookGrid } from "../components/books/BookGrid"
import { TrendingBooks } from "../components/dashboard/TrendingBooks"
import { PersonalRecommendations } from "../components/dashboard/PersonalRecommendations"
import { RecentActivity } from "../components/dashboard/RecentActivity"

export default function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = use(searchParams)
  const search = params.search

  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (!search) return

    fetch(
      `http://localhost:5000/api/books/search?q=${encodeURIComponent(search)}`
    )
      .then((res) => res.json())
      .then((data) => setResults(Array.isArray(data) ? data : (data.books ?? data.results ?? [])))
  }, [search])

  if (search) {
    return (
      <div className="p-4 sm:p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          "{search}" хайлтын үр дүн
        </h1>
        <BookGrid books={results} />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 sm:space-y-12">
      <TrendingBooks />
      <PersonalRecommendations />
      <RecentActivity />
    </div>
  )
}
