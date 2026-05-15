type DedupeBook = {
  title?: string | null
  authors?: string[] | null
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function bookDedupeKey(book: DedupeBook) {
  const title = normalize(book.title ?? "")
  const authors = (book.authors ?? [])
    .map(normalize)
    .filter(Boolean)
    .sort()
    .join("|")

  return `${title}::${authors}`
}

export function dedupeBooksByTitleAndAuthors<T extends DedupeBook>(books: T[]) {
  const seen = new Set<string>()

  return books.filter((book) => {
    const key = bookDedupeKey(book)
    if (!key || key === "::") return true
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
