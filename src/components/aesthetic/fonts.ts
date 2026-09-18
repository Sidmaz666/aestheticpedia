// Google Fonts helpers: resolve a record's font pairing to real Google Fonts families and load them on demand.


/**
 * Real Google Fonts families the type specimen can load on demand. Only
 * families that are 100% certain to exist on Google Fonts are listed — the
 * names here are the exact CSS family names. Matching is case-insensitive
 * with whitespace collapsed, so "playfair  display" still resolves.
 */
const GOOGLE_FONTS: ReadonlySet<string> = new Set([
  // serif & display serif
  'Playfair Display', 'Cormorant Garamond', 'Cormorant', 'Cormorant Infant', 'DM Serif Display',
  'DM Serif Text', 'Libre Baskerville', 'EB Garamond', 'Crimson Pro', 'Crimson Text',
  'Spectral', 'Lora', 'Bitter', 'Arvo', 'Zilla Slab',
  'Fraunces', 'Bodoni Moda', 'Abril Fatface', 'Newsreader', 'Petrona',
  'Source Serif 4', 'Noto Serif', 'Prata', 'Young Serif', 'Instrument Serif',
  // sans, grotesque & condensed
  'Work Sans', 'Inter', 'Manrope', 'Outfit', 'Sora',
  'Unbounded', 'Syne', 'Space Grotesk', 'IBM Plex Sans', 'IBM Plex Serif',
  'IBM Plex Mono', 'Space Mono', 'Archivo', 'Archivo Black', 'Barlow',
  'Barlow Condensed', 'Oswald', 'Bebas Neue', 'Anton', 'Rubik',
  'Jost', 'Josefin Sans', 'Poiret One', 'Raleway', 'Montserrat',
  'Quicksand', 'Comfortaa', 'Fredoka', 'Baloo 2', 'DM Sans',
  'Karla', 'Chivo', 'Khand', 'Teko', 'Rajdhani',
  'Saira Condensed', 'Big Shoulders Display',
  // display, decorative, blackletter, pixel & script
  'Righteous', 'Orbitron', 'Audiowide', 'Tourney', 'Gruppo',
  'Julius Sans One', 'VT323', 'Press Start 2P', 'Silkscreen', 'Pixelify Sans',
  'Major Mono Display', 'Rubik Mono One', 'Grenze', 'Grenze Gotisch', 'UnifrakturCook',
  'UnifrakturMaguntia', 'Pirata One', 'MedievalSharp', 'Cinzel', 'Cinzel Decorative',
  'Marcellus', 'Homemade Apple', 'Caveat', 'Shadows Into Light', 'Permanent Marker',
  'Rock Salt', 'Bangers', 'Alfa Slab One', 'Ultra', 'Chonburi',
  'Trirong',
  // multilingual companions
  'Noto Sans JP', 'Noto Serif JP', 'Noto Sans KR', 'Noto Serif KR', 'Noto Sans SC',
  'Noto Serif SC', 'Noto Sans Arabic', 'Amiri', 'Scheherazade New', 'Lalezar',
  'Vazirmatn',
])

const GOOGLE_FONT_LOOKUP: ReadonlyMap<string, string> = new Map(
  [...GOOGLE_FONTS].map((f) => [f.toLowerCase().replace(/\s+/g, ' '), f])
)

/** Resolve a (possibly sloppy) family name to its canonical Google Fonts name, or null. */
export function lookupGoogleFont(name: string): string | null {
  const n = name.replace(/["']/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
  return GOOGLE_FONT_LOOKUP.get(n) ?? null
}

/** Extract the first family name from a pairing value ("Bodoni Moda, serif" → "Bodoni Moda"). */
export function firstFontFamily(value: string | undefined | null): string | null {
  if (!value) return null
  const first = (value.split(',')[0] ?? '').replace(/["']/g, '').trim()
  return first || null
}

const loadedGoogleFonts = new Set<string>()

/**
 * Inject the Google Fonts stylesheet for a family once per page load.
 * Deduped via a module-level set; a no-op during SSR.
 */
export function loadGoogleFont(family: string): void {
  if (typeof document === 'undefined') return
  const canonical = lookupGoogleFont(family)
  if (!canonical || loadedGoogleFonts.has(canonical)) return
  loadedGoogleFonts.add(canonical)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${canonical.replace(/ /g, '+')}&display=swap`
  document.head.appendChild(link)
}
