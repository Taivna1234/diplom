"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

type ListingType = "SELL" | "RENT" | "EXCHANGE";


export default function MarketplacePage() {
  const [type, setType] = useState("ALL");

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Filter */}
        <div className="rounded-xl border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Filters
              </span>
            </div>

            <select
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200"
            >
              <option>All Types</option>
              <option>Sell</option>
              <option>Rent</option>
              <option>Exchange</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <Plus className="w-4 h-4" />
            Create Listing
          </button>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-[3/4] bg-gray-200">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {item.type}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.author}
                </p>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.condition}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {item.price}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  📍 {item.location}
                </p>

                <button className="w-full mt-2 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}