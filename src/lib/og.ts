// Shared bits for the generated social cards (opengraph-image.tsx routes).
export const OG_SIZE = { width: 1200, height: 630 }

const fontCache = new Map<string, Promise<ArrayBuffer | null>>()

/**
 * A Google Font as TrueType for next/og, subset to the text it will draw. Returns null when the
 * font can't be fetched (the card then falls back to the default face).
 */
export function googleFont(family: string, text: string, weight = 400): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}:${text}`
  let p = fontCache.get(key)
  if (!p) {
    p = (async () => {
      try {
        const css = await (
          await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`, {
            // An old UA makes Google serve TrueType, which Satori can read.
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1' },
            signal: AbortSignal.timeout(5000),
          })
        ).text()
        const url = /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(css)?.[1]
        if (!url) return null
        return await (await fetch(url, { signal: AbortSignal.timeout(5000) })).arrayBuffer()
      } catch {
        return null
      }
    })()
    fontCache.set(key, p)
  }
  return p
}

/** Relative luminance-based ink for text on a colour. */
export function inkOn(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#fff'
  const n = parseInt(m[1], 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? '#111' : '#fff'
}
