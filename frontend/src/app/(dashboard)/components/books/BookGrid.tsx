"use client";

import Link from "next/link";

interface Book {
  id: string;
  title: string;
  authors?: string[];
  cover?: string;
}

export function BookGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/book/${book.id}`}
          className="group rounded-lg p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-md transition"
        >
          <div className="aspect-[3/4] rounded-md overflow-hidden mb-2 bg-gray-100 dark:bg-slate-700">
            {book.cover && (
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
          </div>

          <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight">
            {book.title}
          </h3>

          {book.authors && book.authors.length > 0 && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              {book.authors.join(", ")}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}