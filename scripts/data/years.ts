// Year parsing for period labels (shared by normalize.ts and tests).
/** Parse a period label ("17th century", "1970s", "c. 500 BCE", "present") to a year. */
export function parseYear(text: string, edge: 'start' | 'end'): number | null {
  // "1st century BCE to present" → take the relevant side of a range.
  const parts = text.toLowerCase().trim().split(/\s+(?:to|until|through)\s+|\s*[–—]\s*/)
  const t = (edge === 'start' ? parts[0] : parts[parts.length - 1]) ?? ''
  if (!t || /present|today|ongoing|current|now\b|contemporary/.test(t)) return null
  const bce = /\b(bce|bc)\b/.test(t)
  const century = /(\d{1,2})(?:st|nd|rd|th)[\s-]+century/.exec(t)
  if (century) {
    const n = Number(century[1])
    const early = /early/.test(t)
    const mid = /\bmid/.test(t)
    const late = /late/.test(t)
    const from = late ? 66 : mid ? 33 : 0
    const upTo = early ? 66 : mid ? 33 : 0
    if (bce) return edge === 'start' ? -(n * 100) + from : -((n - 1) * 100) - upTo
    return edge === 'start' ? (n - 1) * 100 + from : n * 100 - 1 - upTo
  }
  const decade = /(\d{3})0s/.exec(t)
  if (decade) return Number(decade[1]) * 10 + (edge === 'end' ? 9 : 0)
  const year = /(\d{1,4})/.exec(t)
  if (year) return bce ? -Number(year[1]) : Number(year[1])
  return null
}
