"use client"

import { Search, SlidersHorizontal, Plus } from "lucide-react"

type Filter = "ALL" | "SELL" | "RENT" | "EXCHANGE"

const LOCATIONS = [
  "Улаанбаатар", "Архангай", "Баян-Өлгий", "Баянхонгор", "Булган",
  "Говь-Алтай", "Говьсүмбэр", "Дархан-Уул", "Дорнод", "Дорноговь",
  "Дундговь", "Завхан", "Орхон", "Өвөрхангай", "Өмнөговь",
  "Сүхбаатар", "Сэлэнгэ", "Төв", "Увс", "Ховд", "Хөвсгөл", "Хэнтий",
]

interface Props {
  filter: Filter
  onChange: (f: Filter) => void
  onCreateClick: () => void
  search: string
  onSearchChange: (v: string) => void
  location: string
  onLocationChange: (v: string) => void
  onlyMine: boolean
  onOnlyMineChange: (v: boolean) => void
}

export function ListingFilters({
  filter, onChange, onCreateClick,
  search, onSearchChange,
  location, onLocationChange,
  onlyMine, onOnlyMineChange,
}: Props) {
  const handleType = (val: string) => {
    const map: Record<string, Filter> = {
      Бүгд: "ALL", Зарах: "SELL", Түрээслэх: "RENT", Солилцох: "EXCHANGE",
    }
    onChange(map[val] ?? "ALL")
  }

  const typeLabel =
    filter === "SELL" ? "Зарах" :
    filter === "RENT" ? "Түрээслэх" :
    filter === "EXCHANGE" ? "Солилцох" : "Бүгд"

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-4 space-y-3">
      {/* Row 1: search + create button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Номын нэрээр хайх..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Зар үүсгэх</span>
        </button>
      </div>

      {/* Row 2: type + location + owned */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-medium">Шүүлтүүр:</span>
        </div>

        <select
          value={typeLabel}
          onChange={(e) => handleType(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Бүгд</option>
          <option>Зарах</option>
          <option>Түрээслэх</option>
          <option>Солилцох</option>
        </select>

        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Бүх байршил</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => onOnlyMineChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-slate-500 accent-blue-600"
          />
          Миний зарууд
        </label>
      </div>
    </div>
  )
}
