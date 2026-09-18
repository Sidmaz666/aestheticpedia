'use client'

/**
 * Visual example & live-demo components for Aesthetic Atlas.
 *
 * - VisualGallery: real example imagery fetched by the research pipeline.
 * - StyleDemo: a tabbed demo suite that re-renders the aesthetic from its own
 *   palette, typography, textures, lighting and motion rules. Twelve live
 *   templates: browser window, magazine cover, editorial plate, gallery frame,
 *   event poster, UI kit, seamless pattern, type specimen, generative line
 *   art, painterly canvas study and a WebGL 3D material study (ShaderLab).
 *   "Auto" maps the entry's category to the most fitting template.
 * - TextureSwatches: CSS-rendered texture chips (each texture becomes a
 *   deterministic visual pattern tinted with the entry's palette).
 * - PendingNotice: honest "decomposition queued" state for draft entries.
 *
 * Everything is derived deterministically from the entry data — seeded hashing
 * replaces Math.random, so SSR/CSR output always matches and the same entry
 * always renders the same demo.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { ImageIcon, Loader2, ScanEye, Search } from 'lucide-react'
import { type AestheticFull, type ColorEntry, type ImageEntry } from '@/lib/aesthetic'
import { ShaderLab } from './shader-lab'

/* ------------------------------ color utilities ------------------------------ */

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

/** Relative luminance 0 (dark) – 1 (light). */
function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0.5
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function saturation(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0
  const l = (max + min) / 2
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex) ?? [137, 109, 59]
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

/** Black or white text color for a given background. */
function readableOn(hex: string): string {
  return luminance(hex) > 0.45 ? '#1c1917' : '#fdfcf8'
}

export interface DemoPalette {
  bg: string
  surface: string
  ink: string
  accent: string
  support: string
  warm: boolean
  light: boolean
  /** Label of the category preset used when the entry palette had <2 valid colors; null when derived from real data. */
  fromPreset?: string | null
}

/* ------------------------------ category palette presets ------------------------------ */

/**
 * Deterministic per-group palette presets. Used when the entry's own palette
 * has fewer than 2 valid hex colors (research still in progress) so demos
 * always render something plausible for the group instead of a generic gray.
 */
interface PalettePreset {
  label: string
  match: RegExp
  bg: string
  surface: string
  ink: string
  accent: string
  support: string
}

const PALETTE_PRESETS: PalettePreset[] = [
  { label: 'web & UI', match: /web\b|ui design|interface|website|user experience/, bg: '#f5f7f6', surface: '#e7edeb', ink: '#1f2b28', accent: '#0f766e', support: '#58a395' },
  { label: 'internet aesthetic', match: /internet|online|webcore|-core\b|\bcore\b|digital culture/, bg: '#f4f6f3', surface: '#e8efe9', ink: '#2a2a2e', accent: '#d6409f', support: '#2f9e8f' },
  { label: 'games & pixel', match: /game|pixel|arcade|voxel|8-bit|8 bit/, bg: '#211e2b', surface: '#2c2839', ink: '#f2efe4', accent: '#f2a03d', support: '#d96f4e' },
  { label: 'technology & retrofuturism', match: /technology|retrofutur|futurism|space age|atomic age|sci-?fi/, bg: '#f1f4f1', surface: '#e2e8e2', ink: '#23282b', accent: '#d96e30', support: '#6f7d72' },
  { label: 'graphic design', match: /graphic design|poster|print|brand/, bg: '#f7f4ec', surface: '#ede8db', ink: '#26221f', accent: '#c94f30', support: '#8a6d3b' },
  { label: 'fashion & dress', match: /fashion|dress|couture|garment|clothing|apparel/, bg: '#f7f3ec', surface: '#ece5d8', ink: '#17140f', accent: '#b08d57', support: '#8a6d3b' },
  { label: 'subculture', match: /subculture|punk|goth|grunge|\bemo\b|scene|skate/, bg: '#efeae2', surface: '#e2dbcf', ink: '#191614', accent: '#a8322a', support: '#4a443e' },
  { label: 'music & sonic', match: /music|sonic|album|vinyl|\bband\b|audio/, bg: '#f4f0e8', surface: '#eae3d6', ink: '#201c1a', accent: '#b3402e', support: '#6d5a48' },
  { label: 'architecture', match: /architect|building|construct|facade|urban/, bg: '#eae6dc', surface: '#dcd6c8', ink: '#33312a', accent: '#a08339', support: '#6b6a5f' },
  { label: 'interior design', match: /interior|room|\bdecor\b|furnishing|home/, bg: '#f7f2e9', surface: '#eee5d6', ink: '#4a4238', accent: '#c2743f', support: '#8b8b6e' },
  { label: 'furniture & product', match: /furniture|product design|industrial design|lighting fixture/, bg: '#f5f1ea', surface: '#e9e2d5', ink: '#33302b', accent: '#9a6b3f', support: '#b8a88f' },
  { label: 'material & texture', match: /texture|material|surface|patina|wood|stone|metal|leather|glass|paper|velvet|linen|silk|wool|concrete|marble|plaster/, bg: '#efe9de', surface: '#e2dacc', ink: '#45403a', accent: '#b0713c', support: '#8d8577' },
  { label: 'textile & craft', match: /textile|\bcraft\b|weav|embroider|fiber|knit|quilt|carpet|\brug\b|\blace\b|ikat|batik|sashiko/, bg: '#f4ecdf', surface: '#e9dec9', ink: '#5b4632', accent: '#b0562f', support: '#8a7a4a' },
  { label: 'regional tradition', match: /regional|cultural tradition|folk|vernacular|tradition/, bg: '#f6efe2', surface: '#ecdfc9', ink: '#46392a', accent: '#a34430', support: '#b98a3e' },
  { label: 'sacred art', match: /religious|sacred|liturg|temple|church|icon|shrine|ritual/, bg: '#f7f1e1', surface: '#ede2c8', ink: '#3a2f24', accent: '#b08a3e', support: '#8e3b2f' },
  { label: 'typography', match: /typography|lettering|typeface|type design|calligraphy|script/, bg: '#f8f5ee', surface: '#eee9dd', ink: '#211d1a', accent: '#b8442e', support: '#8a6d3b' },
  { label: 'drawing & line work', match: /drawing|line work|line art|sketch|pen & ink|illustration|comic|manga|cartoon/, bg: '#f9f6ef', surface: '#efe9db', ink: '#463929', accent: '#a45a3c', support: '#8a6d3b' },
  { label: 'painting', match: /painting|oil paint|watercol|fresco|gouache|tempera|encaustic|plein/, bg: '#f7f2e7', surface: '#ede5d3', ink: '#322c26', accent: '#b3822f', support: '#7c6a54' },
  { label: 'visual effects', match: /visual effect|phenomen|light effect|atmospher|optical|weather/, bg: '#f2f2ef', surface: '#e4e5e0', ink: '#23262a', accent: '#1f8a80', support: '#b08d57' },
  { label: 'film & cinema', match: /film|cinema|movie|noir|screen/, bg: '#f3f0ea', surface: '#e7e1d5', ink: '#26221e', accent: '#b3772e', support: '#5d5347' },
  { label: 'science fiction & fantasy', match: /science fiction|fantasy|worldbuild|mythic/, bg: '#f1f0f4', surface: '#e3e2ea', ink: '#2a2733', accent: '#ad7a2e', support: '#3e6f66' },
  { label: 'art movement', match: /art movement|art school|period style|avant-garde|academy/, bg: '#f6f1e6', surface: '#ece4d2', ink: '#2b2620', accent: '#8a6d3b', support: '#a68a5b' },
]

const DEFAULT_PRESET: PalettePreset = {
  label: 'atlas default',
  match: /.*/,
  bg: '#faf8f4',
  surface: '#f0ebe0',
  ink: '#292524',
  accent: '#8a6d3b',
  support: '#a68a5b',
}

function presetFor(context: string): PalettePreset {
  const c = context.toLowerCase()
  for (const preset of PALETTE_PRESETS) {
    if (preset.match.test(c)) return preset
  }
  return DEFAULT_PRESET
}

/** Derive demo roles (bg/surface/ink/accent) from the entry palette. Falls back to a category preset when <2 valid colors. */
function derivePalette(colors: ColorEntry[], context = ''): DemoPalette {
  const valid = colors.filter((c) => hexToRgb(c.hex))
  if (valid.length < 2) {
    const preset = presetFor(context)
    return {
      bg: preset.bg,
      surface: preset.surface,
      ink: preset.ink,
      accent: preset.accent,
      support: preset.support,
      warm: isWarm(preset.accent),
      light: luminance(preset.bg) > 0.5,
      fromPreset: preset.label,
    }
  }
  const sorted = [...valid].sort((a, b) => luminance(b.hex) - luminance(a.hex))
  const bg = sorted[0].hex
  const ink = sorted[sorted.length - 1].hex
  // accent: most saturated color that is neither bg nor ink
  const mid = valid.filter((c) => c.hex !== bg && c.hex !== ink)
  const accent =
    mid.length > 0
      ? [...mid].sort((a, b) => saturation(b.hex) * (1 - Math.abs(luminance(b.hex) - 0.5)) - saturation(a.hex) * (1 - Math.abs(luminance(a.hex) - 0.5)))[0].hex
      : sorted[Math.floor(sorted.length / 2)].hex
  const surface = sorted.length > 2 ? sorted[1].hex : mix(bg, ink, 0.08)
  const support = mid.find((c) => c.hex !== accent)?.hex ?? mix(accent, bg, 0.3)
  const warm = isWarm(accent)
  return { bg, surface, ink, accent, support, warm, light: luminance(bg) > 0.5, fromPreset: null }
}

function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  if (!ca || !cb) return a
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function isWarm(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return true
  const [r, g, b] = rgb
  return r + r * 0.2 + g * 0.3 >= b
}

/* ------------------------------ typography ------------------------------ */

const SERIF = 'ui-serif, Georgia, Cambria, "Times New Roman", serif'
const SANS = 'ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif'
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
const SCRIPT = '"Snell Roundhand", "Brush Script MT", "Segoe Script", cursive'

function fontFor(text: string, fallback: 'serif' | 'sans'): string {
  const t = (text || '').toLowerCase()
  if (/mono|typewriter|courier|terminal/.test(t)) return MONO
  if (/script|cursive|hand|brush letter|calligrap/.test(t)) return SCRIPT
  if (/serif|didone|garamond|roman|slab|bodoni|clarendon|garamond/.test(t) && !/sans/.test(t)) return SERIF
  if (/sans|grotesque|geometric|gothic|helvetica|futura|swiss|arial|neo-grotesque|rounded/.test(t)) return SANS
  if (fallback === 'serif') return SERIF
  return SANS
}

interface FontSpec {
  stack: string
  tracking: string
  transform: 'none' | 'uppercase'
  weight: number
}

function displayFont(a: AestheticFull): FontSpec {
  const t = `${a.typography.display ?? ''} ${a.typography.notes ?? ''} ${a.name}`.toLowerCase()
  const stack = fontFor(t, ['Internet Aesthetic', 'Web & UI Design', 'Game & Pixel Aesthetic', 'Graphic Design', 'Technology & Retrofuturism', 'Music & Sonic Culture'].includes(a.category) ? 'sans' : 'serif')
  const deco = /art deco|deco|geometric|broadway|display/.test(t)
  const mono = stack === MONO
  return {
    stack,
    tracking: deco || mono ? '0.12em' : /serif/.test(stack) ? '0.01em' : '-0.01em',
    transform: deco || /all caps|uppercase|poster/.test(t) ? 'uppercase' : 'none',
    weight: mono ? 500 : 700,
  }
}

function bodyFont(a: AestheticFull): string {
  return fontFor(`${a.typography.body ?? ''}`, 'sans')
}

/** Human label for the first family of a font stack. */
function stackLabel(stack: string): string {
  const first = stack.split(',')[0].replace(/["']/g, '').trim()
  if (/^ui-serif$/i.test(first)) return 'System serif stack'
  if (/^ui-sans-serif$/i.test(first)) return 'System sans stack'
  if (/^ui-monospace$/i.test(first)) return 'System mono stack'
  return first || 'System default'
}

/* --------------------------- web-served Google fonts --------------------------- */

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

/* ------------------------------ textures ------------------------------ */

interface TexturePattern {
  backgroundImage: string
  backgroundSize: string
}

/** Deterministic keyword-driven CSS texture tinted by the palette. */
function texturePattern(texture: string, p: DemoPalette): TexturePattern {
  const t = texture.toLowerCase()
  const inkA = rgba(p.ink, 0.1)
  const inkSoft = rgba(p.ink, 0.05)
  const accentA = rgba(p.accent, 0.12)
  if (/wood|timber|plank|oak|walnut|bamboo|driftwood/.test(t)) {
    return {
      backgroundImage: `repeating-linear-gradient(92deg, ${inkA} 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, ${inkSoft} 0 2px, transparent 2px 13px), linear-gradient(180deg, ${rgba(p.support, 0.18)}, ${rgba(p.accent, 0.08)})`,
      backgroundSize: 'auto, auto, auto',
    }
  }
  if (/linen|weave|woven|fabric|textile|canvas|burlap|tweed|boucl|herringbone|ikat/.test(t)) {
    return {
      backgroundImage: `repeating-linear-gradient(0deg, ${inkSoft} 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, ${inkSoft} 0 1px, transparent 1px 4px)`,
      backgroundSize: 'auto',
    }
  }
  if (/velvet|plush|fleece|suede|chenille|fur/.test(t)) {
    return {
      backgroundImage: `radial-gradient(ellipse at 30% 20%, ${rgba(p.accent, 0.22)}, transparent 60%), radial-gradient(ellipse at 70% 80%, ${rgba(p.ink, 0.1)}, transparent 55%)`,
      backgroundSize: 'auto',
    }
  }
  if (/concrete|stone|plaster|cement|stucco|terrazzo|marble|granite|mineral/.test(t)) {
    return {
      backgroundImage: `radial-gradient(${inkA} 0.8px, transparent 0.9px), radial-gradient(${inkSoft} 0.7px, transparent 0.8px), linear-gradient(160deg, ${rgba(p.support, 0.12)}, transparent)`,
      backgroundSize: '7px 7px, 11px 11px, auto',
    }
  }
  if (/metal|steel|chrome|brushed|alumin|foil|tin|silver|gold|gilt|brass|copper|bronze|patina/.test(t)) {
    return {
      backgroundImage: `linear-gradient(105deg, transparent 15%, ${rgba('#ffffff', 0.5)} 38%, transparent 47%, ${rgba(p.ink, 0.12)} 62%, transparent 78%)`,
      backgroundSize: 'auto',
    }
  }
  if (/gloss|lacquer|glaze|polish|enamel|patent|vinyl|glass|crystal|iridescent|holograph/.test(t)) {
    return {
      backgroundImage: `linear-gradient(115deg, ${rgba('#ffffff', 0.4)} 0%, transparent 30%), linear-gradient(335deg, ${rgba(p.accent, 0.18)} 0%, transparent 40%)`,
      backgroundSize: 'auto',
    }
  }
  if (/knit|stitch|embroider|crochet|mesh|net|perforat|grid|lattice|sashiko|kantha/.test(t)) {
    return {
      backgroundImage: `radial-gradient(${inkA} 1px, transparent 1.2px)`,
      backgroundSize: '6px 6px',
    }
  }
  if (/paper|card|newsprint|parchment|grain|kraft|dust|sand|foxing|noise|halftone/.test(t)) {
    return {
      backgroundImage: `radial-gradient(${rgba(p.ink, 0.07)} 0.6px, transparent 0.7px)`,
      backgroundSize: '3px 3px',
    }
  }
  if (/rust|corrode|tarnish|weather|distress|peel|crack|craze|aged|faded|worn|patina/.test(t)) {
    return {
      backgroundImage: `radial-gradient(ellipse at 20% 30%, ${rgba(p.accent, 0.2)}, transparent 45%), radial-gradient(ellipse at 80% 70%, ${rgba(p.ink, 0.14)}, transparent 50%), radial-gradient(${inkSoft} 0.7px, transparent 0.8px)`,
      backgroundSize: 'auto, auto, 9px 9px',
    }
  }
  if (/moss|bark|organic|botanic|leaf|coral|shell|nacre|feather|lichen/.test(t)) {
    return {
      backgroundImage: `radial-gradient(ellipse at 25% 60%, ${rgba(p.support, 0.25)}, transparent 50%), radial-gradient(ellipse at 75% 25%, ${rgba(p.accent, 0.16)}, transparent 45%)`,
      backgroundSize: 'auto',
    }
  }
  // default: subtle grain
  return {
    backgroundImage: `radial-gradient(${rgba(p.ink, 0.05)} 0.6px, transparent 0.7px)`,
    backgroundSize: '4px 4px',
  }
}

function pickTexture(textures: string[]): string | null {
  return textures.length > 0 ? textures[0] : null
}

/* ------------------------------ lighting & motion ------------------------------ */

function lightingOverlay(a: AestheticFull, p: DemoPalette): string | null {
  const lit = `${a.lighting.temperature ?? ''} ${a.lighting.quality ?? ''} ${a.lighting.shadow ?? ''}`.toLowerCase()
  if (!lit.trim()) return null
  const warm = /warm|golden|candle|amber|tungsten|sunset/.test(lit)
  const cool = /cool|blue|moon|neon|fluoresc|cold|cyan|icy/.test(lit)
  if (warm && !cool) return `linear-gradient(180deg, rgba(255, 176, 80, 0.10), transparent 70%)`
  if (cool && !warm) return `linear-gradient(180deg, rgba(96, 140, 200, 0.10), transparent 70%)`
  return null
}

function shadowFor(a: AestheticFull): string {
  const q = `${a.lighting.quality ?? ''} ${a.lighting.shadow ?? ''}`.toLowerCase()
  if (/hard|sharp|harsh|crisp|noir|dramatic|high contrast/.test(q)) return '0 10px 28px -10px rgba(28,25,23,0.5)'
  if (/soft|diffuse|gentle|even|flat/.test(q)) return '0 6px 20px -8px rgba(28,25,23,0.18)'
  return '0 8px 24px -10px rgba(28,25,23,0.28)'
}

type MotionKind = 'float' | 'flicker' | 'none'

function motionFor(a: AestheticFull): MotionKind {
  const m = `${a.uiTranslation.motion ?? ''} ${a.category}`.toLowerCase()
  if (/glitch|flicker|neon|strobe|vhs|scan|interference|crt|blink/.test(m)) return 'flicker'
  if (/slow|gentle|float|parallax|glide|drift|hover|smooth|playful|bounce|spring/.test(m)) return 'float'
  return 'none'
}

/* ------------------------------ hash & seeded randomness (deterministic) ------------------------------ */

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Seeded Lehmer LCG — a pure pseudo-random source so canvas/SVG art is identical on every render. */
function lcg(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s = 42
  return () => {
    s = (s * 48271) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* ------------------------------ shared helpers ------------------------------ */

function firstSentence(text: string, max = 130): string {
  const s = text.split(/(?<=[.!?])\s/)[0] ?? text
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

function prettifyTag(t: string): string {
  return t.replace(/(^|-)([a-z])/g, (m) => m.toUpperCase()).replace(/-/g, ' ')
}

interface DemoProps {
  a: AestheticFull
  p: DemoPalette
  df: FontSpec
  bf: string
  tex: string | null
  motion: MotionKind
  shadow: string
  overlay: string | null
  tagline?: string
  navItems?: string[]
  cardItems?: string[]
}

/* ------------------------------ StyleDemo: tabbed suite ------------------------------ */

type DemoTemplateId = 'web' | 'cover' | 'plate' | 'gallery' | 'poster' | 'uikit' | 'pattern' | 'type' | 'lineart' | 'painting' | 'shader'
type DemoTabId = DemoTemplateId | 'auto'

const TEMPLATE_LABELS: Record<DemoTemplateId, string> = {
  web: 'Web',
  cover: 'Cover',
  plate: 'Plate',
  gallery: 'Gallery',
  poster: 'Poster',
  uikit: 'UI kit',
  pattern: 'Pattern',
  type: 'Type',
  lineart: 'Line art',
  painting: 'Painting',
  shader: '3D material',
}

const TABS: { id: DemoTabId; label: string }[] = [
  { id: 'auto', label: 'Auto ★' },
  { id: 'web', label: 'Web' },
  { id: 'cover', label: 'Cover' },
  { id: 'plate', label: 'Plate' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'poster', label: 'Poster' },
  { id: 'uikit', label: 'UI kit' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'type', label: 'Type' },
  { id: 'lineart', label: 'Line art' },
  { id: 'painting', label: 'Painting' },
  { id: 'shader', label: '3D material' },
]

/** Category → auto template mapping (keyword-tolerant for future categories). */
function autoTemplateFor(a: AestheticFull): DemoTemplateId {
  const cat = `${a.category} ${a.subcategory}`.toLowerCase()
  const rules: [RegExp, DemoTemplateId][] = [
    [/web\b|ui design|interface|internet aesthetic|game|pixel|technology|retrofutur|graphic design/, 'web'],
    [/fashion|dress|subculture|music|sonic/, 'cover'],
    [/architect|interior|furniture|product design|texture & material|material & surface|building|urban/, 'plate'],
    [/visual effect|phenomena|phenomenon/, 'shader'],
    [/drawing|line work|line art/, 'lineart'],
    [/painting/, 'painting'],
    [/typography|lettering|typeface/, 'type'],
    [/textile|craft|regional|cultural tradition|folk/, 'pattern'],
    [/religious|sacred/, 'gallery'],
  ]
  for (const [re, id] of rules) {
    if (re.test(cat)) return id
  }
  return 'gallery'
}

export function StyleDemo({ a }: { a: AestheticFull }) {
  const [tab, setTab] = useState<DemoTabId>('auto')
  const p = useMemo(() => derivePalette(a.colors, `${a.category} ${a.subcategory}`), [a.colors, a.category, a.subcategory])
  const df = useMemo(() => displayFont(a), [a])
  const bf = useMemo(() => bodyFont(a), [a])
  const tex = useMemo(() => pickTexture(a.textures), [a.textures])
  const motion = motionFor(a)
  const shadow = shadowFor(a)
  const overlay = lightingOverlay(a, p)

  const auto = autoTemplateFor(a)
  const effective: DemoTemplateId = tab === 'auto' ? auto : tab
  const templateLabel = TEMPLATE_LABELS[effective]

  const tagline = firstSentence(a.summary || a.description, 150)
  const navItems = a.tags.slice(0, 4).map(prettifyTag)
  const cardItems = (a.keyExamples.length > 0 ? a.keyExamples : a.objects).slice(0, 3)

  const shared: DemoProps = { a, p, df, bf, tex, motion, shadow, overlay, tagline, navItems, cardItems }

  const onTablistKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const idx = TABS.findIndex((t) => t.id === tab)
    const next = e.key === 'ArrowRight' ? (idx + 1) % TABS.length : (idx - 1 + TABS.length) % TABS.length
    setTab(TABS[next].id)
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]')
    buttons[next]?.focus()
  }

  return (
    <section aria-label="Live style demo">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-lg text-fg">
            <ScanEye className="h-4 w-4 text-accent" aria-hidden="true" />
            Live style demo
          </h3>
          <p className="mt-0.5 text-xs text-fg-subtle">
            Each tab rebuilds the entry from its own palette, typography, textures, lighting and motion rules. Auto picks the template that best fits the category.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-line-strong bg-surface px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-fg-subtle sm:inline-block">
          {tab === 'auto' ? `Auto → ${templateLabel}` : templateLabel}
        </span>
      </div>

      {/* tab bar */}
      <div
        role="tablist"
        aria-label="Demo templates"
        onKeyDown={onTablistKeyDown}
        className="scrollbar-thin -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1"
      >
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`demo-tab-${t.id}`}
              aria-selected={active}
              aria-controls="style-demo-panel"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active
                  ? 'border-accent bg-accent text-accent-fg shadow-sm'
                  : 'border-line-strong bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* active panel */}
      <div role="tabpanel" id="style-demo-panel" aria-labelledby={`demo-tab-${effective}`}>
        {effective === 'web' && <BrowserDemo {...shared} />}
        {effective === 'cover' && <MagazineDemo {...shared} />}
        {effective === 'plate' && <PlateDemo {...shared} />}
        {effective === 'gallery' && <GalleryDemo {...shared} />}
        {effective === 'poster' && <PosterDemo {...shared} />}
        {effective === 'uikit' && <UIKitDemo {...shared} />}
        {effective === 'pattern' && <PatternDemo {...shared} />}
        {effective === 'type' && <TypeSpecimenDemo {...shared} />}
        {effective === 'lineart' && <LineArtDemo {...shared} />}
        {effective === 'painting' && <PaintingDemo {...shared} />}
        {effective === 'shader' && <ShaderLab a={a} />}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
        Rendered from: <span className="font-medium text-fg-subtle">{templateLabel} template</span> · {a.colors.length} palette color{a.colors.length === 1 ? '' : 's'}
        {p.fromPreset && <span className="text-amber-700/80"> · suggested palette ({p.fromPreset}) — research in progress</span>} ·{' '}
        {df.stack.split(',')[0]} display · {tex ? `“${tex}” texture` : 'no texture data'} · {motion === 'none' ? 'restrained motion' : `${motion} motion`}
      </p>
    </section>
  )
}

/* ------------------------------ small shared pieces ------------------------------ */

/** Deterministic barcode used by the cover + poster templates. */
function Barcode({ seed, color, width = 92 }: { seed: number; color: string; width?: number }) {
  return (
    <div className="flex h-7 items-end gap-[2px]" style={{ width }} aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} style={{ width: (seed >> i) % 3 === 0 ? 3 : 1.5, height: `${55 + ((seed >> i) % 45)}%`, background: color, opacity: 0.8 }} />
      ))}
    </div>
  )
}

/** Tiny uppercase annotation label for spec-style templates. */
function SpecLabel({ children, color }: { children: ReactNode; color: string }) {
  return (
    <p className="mb-1.5 text-[9px] uppercase" style={{ letterSpacing: '0.18em', color }}>
      {children}
    </p>
  )
}

/* ------------------------------ template: browser ------------------------------ */

function BrowserDemo({ a, p, df, bf, tex, motion, shadow, overlay, tagline, navItems, cardItems }: DemoProps) {
  const texStyle = tex ? texturePattern(tex, p) : null
  const heroBg: React.CSSProperties = {
    background: `linear-gradient(135deg, ${rgba(p.accent, 0.16)}, ${p.bg} 55%, ${rgba(p.support, 0.14)})`,
  }
  return (
    <div className="overflow-hidden rounded-xl border shadow-lg" style={{ borderColor: rgba(p.ink, 0.18), boxShadow: shadow, background: p.bg }}>
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: rgba(p.ink, 0.1), background: p.surface }}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: rgba(p.ink, 0.22) }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: rgba(p.ink, 0.14) }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
        <span className="ml-2 flex-1 truncate rounded px-2 py-0.5 text-[10px]" style={{ background: p.bg, color: rgba(p.ink, 0.55), fontFamily: MONO }}>
          {a.slug}.example
        </span>
      </div>
      {/* nav */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5" style={{ borderColor: rgba(p.ink, 0.1) }}>
        <span className="truncate text-sm" style={{ fontFamily: df.stack, fontWeight: df.weight, color: p.ink, letterSpacing: df.tracking }}>
          {a.name}
        </span>
        {navItems && navItems.length > 0 && (
          <nav className="hidden gap-3 text-[11px] sm:flex" style={{ color: rgba(p.ink, 0.6), fontFamily: bf }} aria-hidden="true">
            {navItems.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </nav>
        )}
        <span className="rounded px-2 py-1 text-[10px]" style={{ background: p.accent, color: readableOn(p.accent), fontFamily: bf }}>
          Enter
        </span>
      </div>
      {/* hero */}
      <div className="relative overflow-hidden px-5 py-8 sm:px-7 sm:py-10" style={heroBg}>
        {texStyle && <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: texStyle.backgroundImage, backgroundSize: texStyle.backgroundSize }} aria-hidden="true" />}
        {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
        <p className="relative text-[10px] uppercase" style={{ letterSpacing: '0.22em', color: p.accent, fontFamily: bf }}>
          {a.category}
          {a.era ? ` · ${a.era}` : ''}
        </p>
        <h4 className="relative mt-2 max-w-lg text-2xl leading-tight sm:text-3xl" style={{ fontFamily: df.stack, color: p.ink, letterSpacing: df.tracking, textTransform: df.transform, fontWeight: df.weight }}>
          {a.name}
        </h4>
        {tagline && (
          <p className="relative mt-2.5 max-w-md text-sm leading-relaxed" style={{ color: rgba(p.ink, 0.72), fontFamily: bf }}>
            {tagline}
          </p>
        )}
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="rounded px-3 py-1.5 text-xs" style={{ background: p.accent, color: readableOn(p.accent), fontFamily: bf, boxShadow: `0 2px 10px ${rgba(p.accent, 0.35)}` }}>
            Explore the style
          </span>
          <span className="rounded border px-3 py-1.5 text-xs" style={{ borderColor: rgba(p.ink, 0.25), color: p.ink, fontFamily: bf }}>
            Palette &amp; DNA
          </span>
          {motion === 'float' && (
            <span className="aa-motion-float ml-auto hidden self-center rounded-full px-2.5 py-1 text-[10px] sm:inline-block" style={{ background: rgba(p.support, 0.25), color: p.ink, fontFamily: bf }}>
              ✦ drifting motion
            </span>
          )}
          {motion === 'flicker' && (
            <span className="aa-motion-flicker ml-auto hidden self-center rounded-full px-2.5 py-1 text-[10px] sm:inline-block" style={{ background: rgba(p.support, 0.25), color: p.ink, fontFamily: bf }}>
              ▮ signal flicker
            </span>
          )}
        </div>
      </div>
      {/* cards */}
      {cardItems && cardItems.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-3" style={{ background: p.bg }}>
          {cardItems.map((c, i) => {
            const tint = [rgba(p.accent, 0.75), rgba(p.support, 0.75), rgba(p.ink, 0.55)][i % 3]
            return (
              <div key={c} className="overflow-hidden rounded-lg border" style={{ borderColor: rgba(p.ink, 0.12), background: p.surface }}>
                <div className="h-12" style={{ background: `linear-gradient(120deg, ${tint}, ${rgba(p.accent, 0.2)})` }} />
                <p className="truncate px-2.5 py-2 text-[11px]" style={{ color: rgba(p.ink, 0.75), fontFamily: bf }} title={c}>
                  {c}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ------------------------------ template: magazine cover ------------------------------ */

function MagazineDemo({ a, p, df, bf, tex, motion, shadow, overlay, tagline }: DemoProps) {
  const texStyle = tex ? texturePattern(tex, p) : null
  const coverLines = (a.keyExamples.length > 0 ? a.keyExamples : a.tags).slice(0, 3)
  const h = hashStr(a.slug)
  return (
    <div className="grid overflow-hidden rounded-xl border shadow-lg sm:grid-cols-[1.2fr_1fr]" style={{ borderColor: rgba(p.ink, 0.18), boxShadow: shadow, background: p.bg }}>
      <div className="relative overflow-hidden p-5 sm:p-6">
        {texStyle && <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: texStyle.backgroundImage, backgroundSize: texStyle.backgroundSize }} aria-hidden="true" />}
        {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
        <p className="relative text-[10px] uppercase" style={{ letterSpacing: '0.24em', color: p.accent, fontFamily: bf }}>
          The Atlas Review · {a.era || a.category}
        </p>
        <h4 className="relative mt-2 leading-[0.95]" style={{ fontFamily: df.stack, color: p.ink, fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', textTransform: 'uppercase', letterSpacing: df.tracking, fontWeight: df.weight }}>
          {a.name}
        </h4>
        {tagline && (
          <p className="relative mt-3 max-w-sm text-sm italic leading-relaxed" style={{ color: rgba(p.ink, 0.72), fontFamily: bf }}>
            “{tagline.replace(/\.$/, '')}”
          </p>
        )}
        <ul className="relative mt-4 space-y-1.5">
          {coverLines.map((c) => (
            <li key={c} className="flex items-center gap-2 text-xs" style={{ color: rgba(p.ink, 0.8), fontFamily: bf }}>
              <span className="inline-block h-1 w-1 rounded-full" style={{ background: p.accent }} />
              {c}
            </li>
          ))}
        </ul>
        {/* barcode */}
        <div className="relative mt-5">
          <Barcode seed={h} color={p.ink} />
        </div>
      </div>
      <div className="relative min-h-44 overflow-hidden" style={{ background: `linear-gradient(160deg, ${p.accent}, ${mix(p.accent, p.ink, 0.45)} 70%)` }}>
        {texStyle && <div className="pointer-events-none absolute inset-0 opacity-80 mix-blend-overlay" style={{ backgroundImage: texStyle.backgroundImage, backgroundSize: texStyle.backgroundSize }} aria-hidden="true" />}
        {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
        {motion === 'float' && (
          <div className="aa-motion-float absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10px]" style={{ background: rgba(p.bg, 0.85), color: p.ink, fontFamily: bf }}>
            ✦
          </div>
        )}
        <div className="absolute bottom-3 right-4 text-right">
          <p className="text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: rgba(p.bg, 0.85), fontFamily: bf }}>
            visual issue
          </p>
          <p className="text-xs" style={{ color: p.bg, fontFamily: df.stack }}>
            {a.origin || a.geography || 'Worldwide'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ template: editorial plate ------------------------------ */

function PlateDemo({ a, p, df, bf, tex, shadow, overlay }: DemoProps) {
  const texStyle = tex ? texturePattern(tex, p) : null
  const h = hashStr(a.slug)
  const specs = [
    ...a.materials.slice(0, 3),
    ...a.objects.slice(0, 2),
  ].slice(0, 4)
  // deterministic "elevation" blocks
  const blocks = Array.from({ length: 6 }).map((_, i) => ({
    col: (h >> (i * 2)) % 4,
    row: (h >> (i * 3)) % 3,
    tone: [rgba(p.ink, 0.78), rgba(p.accent, 0.8), rgba(p.support, 0.75), rgba(p.ink, 0.35)][i % 4],
  }))
  return (
    <div className="overflow-hidden rounded-xl border shadow-lg" style={{ borderColor: rgba(p.ink, 0.2), boxShadow: shadow, background: p.bg }}>
      <div className="border-b px-5 py-2.5 text-center" style={{ borderColor: rgba(p.ink, 0.12) }}>
        <p className="text-[10px] uppercase" style={{ letterSpacing: '0.3em', color: p.accent, fontFamily: bf }}>
          Plate Nº {String((h % 47) + 1).padStart(2, '0')} · {a.category}
        </p>
      </div>
      <div className="px-6 py-5 text-center">
        <h4 className="text-2xl leading-tight sm:text-3xl" style={{ fontFamily: df.stack, color: p.ink, letterSpacing: '0.06em', fontWeight: df.weight }}>
          {a.name}
        </h4>
        <p className="mt-1 text-xs" style={{ color: rgba(p.ink, 0.55), fontFamily: bf, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {[a.era, a.origin || a.geography].filter(Boolean).join(' — ') || a.subcategory || 'Aesthetic Atlas'}
        </p>
      </div>
      {/* elevation study */}
      <div className="relative mx-6 mb-5 overflow-hidden rounded-lg border" style={{ borderColor: rgba(p.ink, 0.15), background: p.surface }}>
        {texStyle && <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: texStyle.backgroundImage, backgroundSize: texStyle.backgroundSize }} aria-hidden="true" />}
        {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
        <div className="relative grid h-40 gap-1.5 p-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }} aria-hidden="true">
          {blocks.map((b, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                gridColumn: `${(b.col % 2) + 1} / span ${1 + (b.col % 2)}`,
                gridRow: `${b.row + 1} / span 1`,
                background: b.tone,
                boxShadow: `inset 0 -2px 0 ${rgba(p.ink, 0.25)}`,
              }}
            />
          ))}
        </div>
      </div>
      {/* spec table */}
      {specs.length > 0 && (
        <dl className="mx-6 mb-6 divide-y" style={{ borderColor: rgba(p.ink, 0.1), borderTop: `1px solid ${rgba(p.ink, 0.1)}` }}>
          {specs.map((s, i) => (
            <div key={`${s}-${i}`} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-[10px] uppercase" style={{ letterSpacing: '0.18em', color: p.accent, fontFamily: bf }}>
                Spec {String(i + 1).padStart(2, '0')}
              </dt>
              <dd className="truncate text-xs" style={{ color: rgba(p.ink, 0.75), fontFamily: bf }}>
                {s}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/* ------------------------------ template: gallery frame ------------------------------ */

function GalleryDemo({ a, p, df, bf, tex, shadow, overlay, tagline }: DemoProps) {
  const texStyle = tex ? texturePattern(tex, p) : null
  const shape = `${a.visualDNA.shape ?? ''} ${a.visualDNA.line ?? ''}`.toLowerCase()
  const organic = /organic|curv|fluid|soft|round|blob|flowing/.test(shape)
  const angular = /angular|geometric|sharp|angular|rectilinear|hard-edge|blocky/.test(shape)
  const h = hashStr(a.slug)
  const artworkRadius = organic ? '58% 42% 55% 45% / 48% 55% 45% 52%' : angular ? '4px' : '8px'
  return (
    <div className="overflow-hidden rounded-xl border p-3 shadow-lg sm:p-4" style={{ borderColor: rgba(p.ink, 0.18), boxShadow: shadow, background: p.surface }}>
      {/* artwork */}
      <div className="relative overflow-hidden rounded-md" style={{ border: `6px solid ${p.bg}`, outline: `1px solid ${rgba(p.ink, 0.15)}`, background: p.bg }}>
        <div className="relative h-52 overflow-hidden sm:h-64" style={{ background: `linear-gradient(135deg, ${rgba(p.accent, 0.55)}, ${rgba(p.support, 0.4)} 45%, ${rgba(p.ink, 0.65)})` }}>
          {texStyle && <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay" style={{ backgroundImage: texStyle.backgroundImage, backgroundSize: texStyle.backgroundSize }} aria-hidden="true" />}
          {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
          {/* composition motifs */}
          <div
            className="absolute"
            aria-hidden="true"
            style={{
              left: `${12 + (h % 18)}%`,
              top: `${14 + (h % 12)}%`,
              width: `${34 + (h % 16)}%`,
              height: `${40 + (h % 14)}%`,
              background: rgba(p.accent, 0.85),
              borderRadius: artworkRadius,
              boxShadow: `0 10px 30px ${rgba(p.ink, 0.35)}`,
            }}
          />
          <div
            className="absolute"
            aria-hidden="true"
            style={{
              right: `${10 + (h % 14)}%`,
              bottom: `${10 + (h % 12)}%`,
              width: `${20 + (h % 12)}%`,
              height: `${18 + (h % 10)}%`,
              background: rgba(p.bg, 0.85),
              borderRadius: organic ? '50%' : '2px',
            }}
          />
          <div className="absolute left-0 top-0 h-full w-full" aria-hidden="true" style={{ background: `repeating-linear-gradient(${(h % 180)}deg, transparent 0 26px, ${rgba(p.ink, 0.05)} 26px 27px)` }} />
        </div>
      </div>
      {/* plaque */}
      <div className="mx-auto mt-4 max-w-md rounded-sm border px-4 py-3 text-center" style={{ borderColor: rgba(p.ink, 0.18), background: p.bg }}>
        <h4 className="text-lg leading-snug" style={{ fontFamily: df.stack, color: p.ink, fontWeight: df.weight, letterSpacing: df.tracking }}>
          {a.name}
        </h4>
        <p className="mt-0.5 text-[11px]" style={{ color: rgba(p.ink, 0.55), fontFamily: bf }}>
          {[a.periodStart, a.periodEnd].filter(Boolean).join('–') || a.era || a.category} · {a.origin || a.geography || 'Aesthetic Atlas'}
        </p>
        {tagline && <p className="mt-1.5 text-xs italic leading-relaxed" style={{ color: rgba(p.ink, 0.65), fontFamily: bf }}>{tagline}</p>}
      </div>
    </div>
  )
}

/* ------------------------------ template: event poster ------------------------------ */

function PosterDemo({ a, p, df, bf, tex, motion, shadow, overlay }: DemoProps) {
  const texStyle = tex ? texturePattern(tex, p) : null
  const h = hashStr(`${a.slug}:poster`)
  const line = (a.visualDNA.line ?? '').toLowerCase()
  const curvy = /whiplash|curv|organic|flowing|sinuous|florid|scroll|rococo|nouveau/.test(line)
  const angular = /angular|sharp|rectilinear|geometric|hard-edge|diagonal|constructiv/.test(line)
  const radius = curvy ? '30px' : angular ? '0px' : '16px'
  const innerRadius = curvy ? '22px' : angular ? '0px' : '10px'
  const blobRadius = curvy ? '44% 56% 58% 42% / 52% 44% 56% 48%' : angular ? '2px' : '12px'

  const dateLine = [a.periodStart, a.periodEnd].filter(Boolean).join('–') || a.era
  const venueLine = a.origin || a.geography || ''
  const chips = a.tags.slice(0, 5)

  return (
    <div className="overflow-hidden border shadow-lg" style={{ borderColor: rgba(p.ink, 0.2), borderRadius: radius, boxShadow: shadow, background: p.bg }}>
      <div className="relative m-2 overflow-hidden border" style={{ borderColor: rgba(p.ink, 0.16), borderRadius: innerRadius }}>
        {texStyle && <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: texStyle.backgroundImage, backgroundSize: texStyle.backgroundSize }} aria-hidden="true" />}
        {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
        <div className="relative px-5 py-6 sm:px-7 sm:py-8">
          {/* eyebrow row */}
          <div className="flex items-baseline justify-between gap-3 border-b pb-2.5" style={{ borderColor: rgba(p.ink, 0.18) }}>
            <p className="text-[10px] uppercase" style={{ letterSpacing: '0.3em', color: p.accent, fontFamily: bf }}>
              The Atlas presents
            </p>
            <p className="text-[10px] uppercase" style={{ letterSpacing: '0.2em', color: rgba(p.ink, 0.5), fontFamily: MONO }}>
              Nº {String((h % 89) + 1)}
            </p>
          </div>

          {/* huge display type */}
          <h4 className="mt-4 leading-[0.95]" style={{ fontFamily: df.stack, color: p.ink, fontSize: 'clamp(2.1rem, 6vw, 3.4rem)', textTransform: df.transform, letterSpacing: df.tracking, fontWeight: df.weight }}>
            {a.name}
          </h4>
          <p className="mt-1.5 text-[10px] uppercase" style={{ letterSpacing: '0.22em', color: rgba(p.ink, 0.55), fontFamily: bf }}>
            {a.category}
          </p>

          {/* date + venue lines */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="border-l-2 pl-3" style={{ borderColor: p.accent }}>
              <SpecLabel color={p.accent}>Dates</SpecLabel>
              <p className="text-sm" style={{ color: p.ink, fontFamily: df.stack, fontWeight: df.weight }}>
                {dateLine || <span className="italic opacity-70">To be announced — research in progress</span>}
              </p>
            </div>
            <div className="border-l-2 pl-3" style={{ borderColor: rgba(p.ink, 0.3) }}>
              <SpecLabel color={rgba(p.ink, 0.5)}>Venue</SpecLabel>
              <p className="text-sm" style={{ color: p.ink, fontFamily: df.stack, fontWeight: df.weight }}>
                {venueLine || <span className="italic opacity-70">Location under research</span>}
              </p>
            </div>
          </div>

          {/* tag chips */}
          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span key={c} className="rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.12em]" style={{ borderColor: rgba(p.ink, 0.28), color: rgba(p.ink, 0.7), fontFamily: bf }}>
                  {prettifyTag(c)}
                </span>
              ))}
            </div>
          )}

          {/* big accent block + ticket */}
          <div className="mt-5 grid gap-2.5 sm:grid-cols-[1fr_auto]">
            <div className="relative flex min-h-24 items-end overflow-hidden p-3.5" style={{ borderRadius: blobRadius, background: `linear-gradient(140deg, ${p.accent}, ${mix(p.accent, p.ink, 0.55)} 85%)` }}>
              {texStyle && <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay" style={{ backgroundImage: texStyle.backgroundImage, backgroundSize: texStyle.backgroundSize }} aria-hidden="true" />}
              {motion === 'float' && (
                <span className="aa-motion-float absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px]" style={{ background: rgba(p.bg, 0.85), color: p.ink }} aria-hidden="true">
                  ✦
                </span>
              )}
              {motion === 'flicker' && (
                <span className="aa-motion-flicker absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px]" style={{ background: rgba(p.bg, 0.85), color: p.ink }} aria-hidden="true">
                  ▮
                </span>
              )}
              <div className="relative">
                <p className="text-[9px] uppercase" style={{ letterSpacing: '0.24em', color: rgba(p.bg, 0.85), fontFamily: bf }}>
                  Visual identity programme
                </p>
                <p className="text-xs" style={{ color: readableOn(p.accent), fontFamily: df.stack, fontWeight: df.weight }}>
                  {a.textures[0] ? `Surfaces of ${a.textures[0]}` : 'Surfaces under study'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-2 rounded-md border px-3 py-2.5" style={{ borderColor: rgba(p.ink, 0.25), background: p.surface }}>
              <p className="text-[9px] uppercase" style={{ letterSpacing: '0.3em', color: p.ink, fontFamily: MONO }}>
                Admit one
              </p>
              <Barcode seed={h} color={p.ink} width={72} />
            </div>
          </div>

          <p className="mt-4 border-t pt-2 text-center text-[9px] uppercase" style={{ borderColor: rgba(p.ink, 0.15), letterSpacing: '0.3em', color: rgba(p.ink, 0.45), fontFamily: bf }}>
            Aesthetic Atlas · living encyclopedia of style
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ template: UI kit ------------------------------ */

function UIKitDemo({ a, p, df, bf, tex, motion, shadow, overlay }: DemoProps) {
  const texStyle = tex ? texturePattern(tex, p) : null
  const searchLabel = a.tags[0] ?? a.objects[0] ?? a.name
  const cardSrc = a.keyExamples.length > 0 ? a.keyExamples : a.objects.length > 0 ? a.objects : a.tags
  const cards = cardSrc.slice(0, 2)
  const badges = (a.tags.length > 0 ? a.tags : [a.category]).slice(0, 4)
  const progress = Math.max(6, Math.min(100, Math.round(a.dnaAxes.minimal_maximal ?? 62)))

  return (
    <div className="overflow-hidden rounded-xl border shadow-lg" style={{ borderColor: rgba(p.ink, 0.18), boxShadow: shadow, background: p.bg }}>
      {/* toolbar */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5" style={{ borderColor: rgba(p.ink, 0.1), background: p.surface }}>
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex gap-1" aria-hidden="true">
            {[p.bg, p.surface, p.accent, p.support, p.ink].map((c, i) => (
              <span key={i} className="h-3 w-3 rounded-full border" style={{ background: c, borderColor: rgba(p.ink, 0.2) }} />
            ))}
          </span>
          <span className="truncate text-xs" style={{ fontFamily: df.stack, fontWeight: df.weight, color: p.ink }}>
            {a.name} — UI kit
          </span>
        </span>
        <span className="hidden shrink-0 text-[9px] uppercase tracking-[0.18em] sm:inline" style={{ color: rgba(p.ink, 0.45), fontFamily: MONO }}>
          {a.slug}.design
        </span>
      </div>
      <div className="relative">
        {texStyle && <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: texStyle.backgroundImage, backgroundSize: texStyle.backgroundSize }} aria-hidden="true" />}
        {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
        <div className="relative grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
          {/* controls column */}
          <div className="space-y-4">
            <div>
              <SpecLabel color={rgba(p.ink, 0.45)}>Button · primary</SpecLabel>
              <span className="inline-block cursor-default rounded-md px-3.5 py-2 text-xs" style={{ background: p.accent, color: readableOn(p.accent), fontFamily: bf, boxShadow: `0 2px 10px ${rgba(p.accent, 0.35)}` }}>
                Primary action
              </span>
            </div>
            <div>
              <SpecLabel color={rgba(p.ink, 0.45)}>Button · ghost</SpecLabel>
              <span className="inline-block cursor-default rounded-md border px-3.5 py-2 text-xs" style={{ borderColor: rgba(p.ink, 0.3), color: p.ink, fontFamily: bf }}>
                Secondary
              </span>
            </div>
            <div>
              <SpecLabel color={rgba(p.ink, 0.45)}>Input</SpecLabel>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: rgba(p.accent, 0.55), background: p.surface, boxShadow: `0 0 0 3px ${rgba(p.accent, 0.12)}` }}>
                <Search className="h-3.5 w-3.5 shrink-0" style={{ color: rgba(p.ink, 0.4) }} aria-hidden="true" />
                <span className="truncate text-xs" style={{ color: rgba(p.ink, 0.45), fontFamily: bf }}>
                  Search “{searchLabel}”…
                </span>
              </div>
            </div>
            <div>
              <SpecLabel color={rgba(p.ink, 0.45)}>Toggle</SpecLabel>
              <span className="inline-flex items-center gap-2.5">
                <span className="relative inline-flex h-5 w-9 items-center rounded-full" style={{ background: p.accent }} aria-hidden="true">
                  <span className="absolute right-0.5 h-4 w-4 rounded-full bg-surface shadow" />
                </span>
                <span className="text-xs" style={{ color: p.ink, fontFamily: bf }}>
                  Enabled
                </span>
              </span>
            </div>
            <div>
              <SpecLabel color={rgba(p.ink, 0.45)}>Progress</SpecLabel>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: rgba(p.ink, 0.12) }} role="meter" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Maximalism level">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${p.support}, ${p.accent})` }} />
              </div>
              <p className="mt-1 text-[10px]" style={{ color: rgba(p.ink, 0.5), fontFamily: bf }}>
                Maximalism axis — {progress}/100
              </p>
            </div>
          </div>

          {/* content column */}
          <div className="space-y-4">
            {cards.map((c, i) => (
              <div key={c} className="overflow-hidden rounded-lg border" style={{ borderColor: rgba(p.ink, 0.12), background: p.surface }}>
                <div className="h-10" style={{ background: `linear-gradient(120deg, ${i % 2 ? rgba(p.support, 0.7) : rgba(p.accent, 0.75)}, ${rgba(p.accent, 0.2)})` }} />
                <div className="px-2.5 py-2">
                  <p className="truncate text-[11px]" style={{ color: rgba(p.ink, 0.8), fontFamily: bf }} title={c}>
                    {c}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: rgba(p.ink, 0.4), fontFamily: bf }}>
                    {i === 0 ? 'Example card' : 'Collection card'}
                  </p>
                </div>
              </div>
            ))}
            <div>
              <SpecLabel color={rgba(p.ink, 0.45)}>Badges</SpecLabel>
              <div className="flex flex-wrap gap-1.5">
                {badges.map((b) => (
                  <span key={b} className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.1em]" style={{ background: rgba(p.accent, 0.14), color: p.ink, fontFamily: bf, border: `1px solid ${rgba(p.accent, 0.25)}` }}>
                    {prettifyTag(b)}
                  </span>
                ))}
              </div>
            </div>
            {motion !== 'none' && (
              <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] ${motion === 'float' ? 'aa-motion-float' : 'aa-motion-flicker'}`} style={{ background: rgba(p.support, 0.25), color: p.ink, fontFamily: bf }}>
                {motion === 'float' ? '✦ drifting motion' : '▮ signal flicker'}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="border-t px-4 py-2.5 text-[10px] leading-relaxed" style={{ borderColor: rgba(p.ink, 0.1), color: rgba(p.ink, 0.5), fontFamily: bf }}>
        Component styling: {tex ? `“${tex}” surfaces` : 'surfaces unspecified — research in progress'} ·{' '}
        {a.typography.body ? `body type: ${a.typography.body}` : 'type unspecified — research in progress'} · {motion === 'none' ? 'restrained motion' : `${motion} motion`}
      </p>
    </div>
  )
}

/* ------------------------------ template: seamless pattern ------------------------------ */

type PatternMotif = 'dots' | 'diamonds' | 'stripes' | 'zigzag' | 'arabesque' | 'floral'

const PATTERN_LABELS: Record<PatternMotif, string> = {
  dots: 'Dense dots',
  diamonds: 'Diamond lattice',
  stripes: 'Stripes',
  zigzag: 'Zigzag',
  arabesque: 'Arabesque curves',
  floral: 'Floral circles',
}

function motifFor(a: AestheticFull): { motif: PatternMotif; inferred: boolean } {
  const t = `${a.textures.join(' ')} ${a.visualDNA.texture ?? ''} ${a.materials.join(' ')} ${a.category}`.toLowerCase()
  if (/ikat|zigzag|chevron|bargello|flame stitch/.test(t)) return { motif: 'zigzag', inferred: false }
  if (/velvet|plush|fleece|suede|fur|boucl|chenille|polka|dotted/.test(t)) return { motif: 'dots', inferred: false }
  if (/wood|timber|plank|striped|ticking|pinstripe|stripe|linen|tweed/.test(t)) return { motif: 'stripes', inferred: false }
  if (/diamond|argyle|harlequin|quilt|lattice|trellis|check|gingham/.test(t)) return { motif: 'diamonds', inferred: false }
  if (/arabesque|damask|paisley|scroll|moresque|vine|whiplash|art nouveau/.test(t)) return { motif: 'arabesque', inferred: false }
  if (/floral|flower|rose|daisy|chintz|block print|petal|botanic/.test(t)) return { motif: 'floral', inferred: false }
  const list: PatternMotif[] = ['dots', 'diamonds', 'stripes', 'zigzag', 'arabesque', 'floral']
  return { motif: list[hashStr(`${a.slug}:pattern`) % list.length], inferred: true }
}

/** Encoded SVG data URL for one 40×40 seamless tile, tinted by the palette. */
function patternDataUrl(motif: PatternMotif, p: DemoPalette): string {
  const ink = p.ink
  const accent = p.accent
  const support = p.support
  const shapes: Record<PatternMotif, string> = {
    dots: `<circle cx="10" cy="10" r="3.2" fill="${ink}"/><circle cx="30" cy="30" r="3.2" fill="${ink}"/><circle cx="30" cy="10" r="1.8" fill="${accent}"/><circle cx="10" cy="30" r="1.8" fill="${accent}"/>`,
    diamonds: `<path d="M20 3 L37 20 L20 37 L3 20 Z" fill="none" stroke="${ink}" stroke-width="1.4"/><path d="M20 12 L28 20 L20 28 L12 20 Z" fill="${accent}" opacity="0.85"/>`,
    stripes: `<rect x="0" y="0" width="7" height="40" fill="${ink}" opacity="0.85"/><rect x="14" y="0" width="2.5" height="40" fill="${accent}"/><rect x="24" y="0" width="1.2" height="40" fill="${support}" opacity="0.9"/>`,
    zigzag: `<path d="M-2 12 L10 4 L22 12 L34 4 L46 12" fill="none" stroke="${ink}" stroke-width="2"/><path d="M-2 28 L10 20 L22 28 L34 20 L46 28" fill="none" stroke="${accent}" stroke-width="2"/><path d="M-2 36 L10 28 L22 36 L34 28 L46 36" fill="none" stroke="${support}" stroke-width="1" opacity="0.7"/>`,
    arabesque: `<path d="M-2 20 Q8 4 20 20 T42 20" fill="none" stroke="${ink}" stroke-width="1.6"/><path d="M-2 20 Q8 36 20 20 T42 20" fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.7"/><circle cx="20" cy="20" r="2.4" fill="${accent}"/>`,
    floral: `<circle cx="20" cy="14" r="4" fill="none" stroke="${ink}" stroke-width="1.3"/><circle cx="14" cy="24" r="4" fill="none" stroke="${ink}" stroke-width="1.3"/><circle cx="26" cy="24" r="4" fill="none" stroke="${ink}" stroke-width="1.3"/><circle cx="20" cy="20" r="2.6" fill="${accent}"/><circle cx="36" cy="36" r="1.6" fill="${support}"/>`,
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="${p.bg}"/>${shapes[motif]}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function PatternDemo({ a, p, bf, shadow, overlay }: DemoProps) {
  const { motif, inferred } = useMemo(() => motifFor(a), [a])
  const url = useMemo(() => patternDataUrl(motif, p), [motif, p])
  const scales = [
    { label: 'Small · 1×', size: 18 },
    { label: 'Medium · 2×', size: 36 },
    { label: 'Large · 4×', size: 72 },
  ]
  return (
    <div className="overflow-hidden rounded-xl border p-3 shadow-lg sm:p-4" style={{ borderColor: rgba(p.ink, 0.18), boxShadow: shadow, background: p.surface }}>
      <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <p className="text-[10px] uppercase" style={{ letterSpacing: '0.3em', color: p.accent, fontFamily: bf }}>
          Pattern tile — {PATTERN_LABELS[motif]}
        </p>
        <p className="text-[9px] uppercase" style={{ letterSpacing: '0.16em', color: rgba(p.ink, 0.45), fontFamily: MONO }}>
          repeat 40 × 40
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {scales.map((s) => (
          <figure key={s.label} className="min-w-0">
            <div
              className="h-20 w-full rounded-md border sm:h-24"
              style={{
                backgroundImage: url,
                backgroundSize: `${s.size}px ${s.size}px`,
                backgroundColor: p.bg,
                borderColor: rgba(p.ink, 0.15),
              }}
              role="img"
              aria-label={`Seamless ${PATTERN_LABELS[motif]} pattern at ${s.label} scale`}
            />
            <figcaption className="mt-1 truncate text-[9px] uppercase tracking-[0.12em]" style={{ color: rgba(p.ink, 0.5), fontFamily: bf }}>
              {s.label}
            </figcaption>
          </figure>
        ))}
      </div>
      {/* in-context band */}
      <div className="relative mt-3 h-24 overflow-hidden rounded-md border" style={{ borderColor: rgba(p.ink, 0.15), backgroundColor: p.bg, backgroundImage: url, backgroundSize: '48px 48px' }}>
        {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
        <div className="absolute inset-0" aria-hidden="true" style={{ background: `linear-gradient(180deg, transparent 40%, ${rgba(p.ink, 0.25)})` }} />
        <p className="absolute bottom-2 left-3 text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: rgba(p.bg, 0.92), fontFamily: bf }}>
          Applied surface
        </p>
      </div>
      <p className="mt-2.5 px-1 text-[11px] leading-relaxed" style={{ color: rgba(p.ink, 0.55), fontFamily: bf }}>
        Motif {inferred ? 'chosen from the entry seed — research in progress' : 'matched from the entry’s texture vocabulary'} · ink on{' '}
        <span style={{ color: p.bg, background: rgba(p.ink, 0.12), padding: '0 4px', borderRadius: 3 }}>{p.bg}</span> · accent {p.accent}
      </p>
    </div>
  )
}

/* ------------------------------ template: type specimen ------------------------------ */

function TypeSpecimenDemo({ a, p, df, bf, shadow }: DemoProps) {
  // Real typeface pairing from the enrichment pipeline (falls back to the
  // typography-derived system stacks when no real font is documented).
  const pairing = a.typePairing ?? {}
  const displayReal = firstFontFamily(pairing.display)
  const bodyReal = firstFontFamily(pairing.body)
  const displayWeb = displayReal ? lookupGoogleFont(displayReal) : null
  const bodyWeb = bodyReal ? lookupGoogleFont(bodyReal) : null
  const displayStack = displayWeb ? `'${displayWeb}', ${df.stack}` : df.stack
  const bodyStack = bodyWeb ? `'${bodyWeb}', ${bf}` : bf

  useEffect(() => {
    if (displayWeb) loadGoogleFont(displayWeb)
    if (bodyWeb && bodyWeb !== displayWeb) loadGoogleFont(bodyWeb)
  }, [displayWeb, bodyWeb])

  const unserved = [
    displayReal && !displayWeb ? displayReal : null,
    bodyReal && !bodyWeb ? bodyReal : null,
  ].filter((n): n is string => n !== null)

  const rows: [string, string][] = [
    ['Display', a.typography.display ?? ''],
    ['Body', a.typography.body ?? ''],
    ['Notes', a.typography.notes ?? ''],
  ]
  if (pairing.notes) rows.push(['Pairing', pairing.notes])
  const h = hashStr(`${a.slug}:type`)
  return (
    <div className="overflow-hidden rounded-xl border shadow-lg" style={{ borderColor: rgba(p.ink, 0.18), boxShadow: shadow, background: p.bg }}>
      {/* header */}
      <div className="flex items-baseline justify-between gap-3 border-b px-5 py-2.5" style={{ borderColor: rgba(p.ink, 0.14) }}>
        <p className="text-[10px] uppercase" style={{ letterSpacing: '0.3em', color: p.accent, fontFamily: bf }}>
          Type specimen
        </p>
        <p className="text-[9px] uppercase" style={{ letterSpacing: '0.16em', color: rgba(p.ink, 0.45), fontFamily: MONO }}>
          Sheet Nº {String((h % 53) + 1)}
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {/* giant Aa */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="leading-[0.85]" style={{ fontFamily: displayStack, fontWeight: df.weight }}>
            <span className="block" style={{ color: p.ink, fontSize: 'clamp(3.4rem, 9vw, 6rem)', letterSpacing: df.tracking }}>
              A
              <span style={{ color: p.accent }}>a</span>
            </span>
          </p>
          <div className="min-w-0 pb-1 text-right">
            <p className="truncate text-sm" style={{ color: p.ink, fontFamily: displayStack, fontWeight: df.weight }} title={displayReal ?? undefined}>
              {displayReal ?? stackLabel(df.stack)}
            </p>
            <p className="mt-0.5 text-[10px] uppercase" style={{ letterSpacing: '0.18em', color: rgba(p.ink, 0.5), fontFamily: bf }}>
              {a.name} display face
            </p>
            {bodyReal && (
              <p className="mt-0.5 truncate text-[10px] uppercase" style={{ letterSpacing: '0.18em', color: rgba(p.ink, 0.5), fontFamily: bodyStack }}>
                Body — {bodyReal}
              </p>
            )}
          </div>
        </div>

        {/* character rows */}
        <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: rgba(p.ink, 0.12) }}>
          {['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789 ·,&?!@#%'].map((row) => (
            <p key={row} className="break-all text-base leading-snug sm:text-lg" style={{ fontFamily: displayStack, letterSpacing: df.tracking, color: rgba(p.ink, 0.85) }} aria-label={`Character set: ${row}`}>
              {row}
            </p>
          ))}
          <p className="mt-2 break-words text-sm leading-relaxed" style={{ fontFamily: bodyStack, color: rgba(p.ink, 0.65) }}>
            Sphinx of black quartz, judge my vow — the quick brown fox jumps over the lazy dog.
          </p>
        </div>

        {/* annotations from typography + pairing data */}
        <dl className="mt-4 border-t" style={{ borderColor: rgba(p.ink, 0.12) }}>
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 border-b py-2" style={{ borderColor: rgba(p.ink, 0.08) }}>
              <dt className="shrink-0 text-[10px] uppercase" style={{ letterSpacing: '0.18em', color: p.accent, fontFamily: bf }}>
                {label}
              </dt>
              <dd className="truncate text-xs sm:max-w-[70%]" style={{ color: value ? rgba(p.ink, 0.75) : rgba(p.ink, 0.4), fontFamily: bf, fontStyle: value ? 'normal' : 'italic' }} title={value || undefined}>
                {value || '— research in progress'}
              </dd>
            </div>
          ))}
        </dl>

        {/* honesty note when a documented family cannot be web-served */}
        {unserved.length > 0 && (
          <p className="mt-3 text-[10px] italic leading-relaxed" style={{ color: rgba(p.ink, 0.45), fontFamily: bf }}>
            Typeface shown in closest available stack — {unserved.map((n) => `‘${n}’`).join(' and ')}{' '}
            {unserved.length === 1 ? 'is' : 'are'} not web-served.
          </p>
        )}

        {/* spec chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[`Weight ${df.weight}`, `Tracking ${df.tracking}`, `Case ${df.transform}`, `Stack ${stackLabel(displayStack)}`].map((chip) => (
            <span key={chip} className="rounded border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]" style={{ borderColor: rgba(p.ink, 0.2), color: rgba(p.ink, 0.6), fontFamily: MONO }}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ template: generative line art ------------------------------ */

type LineMotif = 'botanical' | 'geometric' | 'gesture'

function lineMotifFor(a: AestheticFull): { motif: LineMotif; inferred: boolean } {
  const t = `${a.visualDNA.line ?? ''} ${a.visualDNA.forms ?? ''} ${a.visualDNA.shape ?? ''} ${a.category}`.toLowerCase()
  if (/botanic|floral|leaf|vine|organic|flow|sinuous|whiplash|nouveau|plant|tree|flor|stem/.test(t)) return { motif: 'botanical', inferred: false }
  if (/geometric|angular|lattice|grid|\bstar\b|rectilinear|deco|constructiv|hard-edge/.test(t)) return { motif: 'geometric', inferred: false }
  return { motif: 'gesture', inferred: true }
}

interface LinePath {
  d: string
  w: number
  stroke: string
  opacity?: number
  transform?: string
}
interface LineDot {
  x: number
  y: number
  r: number
  fill: string
}
interface LinePoly {
  points: string
  w: number
  stroke: string
}
interface LineArtSpec {
  paths: LinePath[]
  dots: LineDot[]
  polys: LinePoly[]
}

function buildLineArt(motif: LineMotif, seed: number, hatch: number, weight: number, p: DemoPalette): LineArtSpec {
  const rand = lcg(seed)
  const ink = p.ink
  const accent = p.accent
  const spec: LineArtSpec = { paths: [], dots: [], polys: [] }

  if (motif === 'botanical') {
    const lean = (rand() - 0.5) * 70
    const topX = 210 + lean
    spec.paths.push({ d: `M 210 296 C ${175 + lean * 0.6} 225, ${245 - lean * 0.6} 120, ${topX} 40`, w: weight + 0.5, stroke: ink })
    const leaves = 5 + Math.floor(rand() * 3)
    for (let k = 0; k < leaves; k++) {
      const t = 0.14 + (k / leaves) * 0.66
      const y = 296 - t * 256
      const side = k % 2 === 0 ? 1 : -1
      const x = 210 + side * (6 + t * 36)
      const len = 28 + rand() * 26
      const ang = side * (24 + rand() * 32)
      spec.paths.push({
        d: `M 0 0 Q ${len * 0.45} ${-len * 0.3} ${len} 0 Q ${len * 0.45} ${len * 0.24} 0 0 Z`,
        w: weight,
        stroke: ink,
        transform: `translate(${x} ${y}) rotate(${ang})`,
      })
    }
    spec.dots.push({ x: topX + 10, y: 52, r: 3.4, fill: accent })
    spec.dots.push({ x: topX - 9, y: 44, r: 2.6, fill: accent })
    spec.dots.push({ x: topX + 2, y: 32, r: 2.2, fill: accent })
    spec.paths.push({ d: 'M 118 300 L 302 300', w: 0.8, stroke: ink, opacity: 0.35 })
  } else if (motif === 'geometric') {
    // faint lattice background
    for (let gx = 54; gx <= 366; gx += 39) spec.paths.push({ d: `M ${gx} 24 L ${gx} 296`, w: 0.7, stroke: ink, opacity: 0.12 })
    for (let gy = 48; gy <= 288; gy += 40) spec.paths.push({ d: `M 24 ${gy} L 396 ${gy}`, w: 0.7, stroke: ink, opacity: 0.12 })
    const n = [5, 6, 8][Math.floor(rand() * 3)]
    const rot = rand() * Math.PI
    const cx = 210
    const cy = 152
    const outer: string[] = []
    const inner: string[] = []
    for (let i = 0; i < n; i++) {
      const a1 = rot + (i * 2 * Math.PI) / n
      const a2 = rot + ((i + 0.5) * 2 * Math.PI) / n
      outer.push(`${(cx + 96 * Math.cos(a1)).toFixed(1)} ${(cy + 96 * Math.sin(a1)).toFixed(1)}`)
      inner.push(`${(cx + 52 * Math.cos(a2)).toFixed(1)} ${(cy + 52 * Math.sin(a2)).toFixed(1)}`)
    }
    spec.polys.push({ points: outer.join(', '), w: weight + 0.4, stroke: ink })
    spec.polys.push({ points: inner.join(', '), w: 1.2, stroke: accent })
    for (const pt of outer) {
      const [x, y] = pt.split(' ').map(Number)
      spec.dots.push({ x, y, r: 3, fill: ink })
    }
    spec.dots.push({ x: cx, y: cy, r: 4.5, fill: accent })
  } else {
    // gestural figure-like curves
    for (let c = 0; c < 3; c++) {
      const x0 = 30 + rand() * 70
      const y0 = 50 + rand() * 70
      const x3 = 320 + rand() * 70
      const y3 = 200 + rand() * 80
      const c1x = x0 + 80 + rand() * 70
      const c1y = y0 + (rand() - 0.5) * 170
      const c2x = x3 - 80 - rand() * 70
      const c2y = y3 + (rand() - 0.5) * 170
      spec.paths.push({
        d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x3.toFixed(1)} ${y3.toFixed(1)}`,
        w: [weight + 1.1, weight + 0.3, Math.max(0.9, weight - 0.5)][c],
        stroke: c === 1 ? accent : ink,
      })
    }
    // hatching clusters — density driven by minimal_maximal + dense_spacious axes
    for (let c = 0; c < 3; c++) {
      const bx = Math.min(30 + rand() * 90 + c * 115, 380 - hatch * 5.5)
      const by = 200 + rand() * 70
      const ang = (-32 - rand() * 14) * (Math.PI / 180)
      const dx = Math.cos(ang) * 30
      const dy = Math.sin(ang) * 30
      for (let i = 0; i < hatch; i++) {
        const off = i * 5.5
        spec.paths.push({ d: `M ${(bx + off).toFixed(1)} ${(by + off * 0.35).toFixed(1)} l ${dx.toFixed(1)} ${dy.toFixed(1)}`, w: 0.8, stroke: ink, opacity: 0.55 })
      }
    }
  }
  return spec
}

function LineArtDemo({ a, p, bf, shadow }: DemoProps) {
  const { motif, inferred } = useMemo(() => lineMotifFor(a), [a])
  const seed = hashStr(`${a.slug}:lineart`)
  const lineTxt = (a.visualDNA.line ?? '').toLowerCase()
  const weight = /thick|bold|heavy|broad/.test(lineTxt) ? 3 : /thin|fine|delicate|hairline|spidery/.test(lineTxt) ? 1.1 : 1.8
  const density = ((a.dnaAxes.minimal_maximal ?? 50) + (100 - (a.dnaAxes.dense_spacious ?? 50))) / 2
  const hatch = Math.round(4 + (density / 100) * 14)
  const art = useMemo(() => buildLineArt(motif, seed, hatch, weight, p), [motif, seed, hatch, weight, p])
  const plateNo = String((seed % 47) + 1).padStart(2, '0')
  const hatchLevel = density < 34 ? 'sparse' : density < 67 ? 'moderate' : 'dense'
  const motifLabel = motif === 'botanical' ? 'botanical stem & leaves' : motif === 'geometric' ? 'geometric star & lattice' : 'gestural figure'

  return (
    <div className="overflow-hidden rounded-xl border shadow-lg" style={{ borderColor: rgba(p.ink, 0.2), boxShadow: shadow, background: p.bg }}>
      <div className="border-b px-5 py-2.5 text-center" style={{ borderColor: rgba(p.ink, 0.12) }}>
        <p className="text-[10px] uppercase" style={{ letterSpacing: '0.3em', color: p.accent, fontFamily: bf }}>
          Plate Nº {plateNo} · line study
        </p>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <div className="overflow-hidden rounded-lg border" style={{ borderColor: rgba(p.ink, 0.15), background: p.bg }}>
          <svg viewBox="0 0 420 320" className="block h-auto w-full" role="img" aria-label={`Generative line study for ${a.name}: ${motifLabel} motif in ${p.ink} ink`}>
            <rect x="0" y="0" width="420" height="320" fill={p.bg} />
            <rect x="12" y="12" width="396" height="296" fill="none" stroke={rgba(p.ink, 0.22)} strokeWidth="1" />
            {art.paths.map((pth, i) => (
              <path
                key={i}
                d={pth.d}
                fill="none"
                stroke={pth.stroke}
                strokeWidth={pth.w}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={pth.opacity ?? 1}
                transform={pth.transform}
              />
            ))}
            {art.polys.map((pg, i) => (
              <polygon key={i} points={pg.points} fill="none" stroke={pg.stroke} strokeWidth={pg.w} strokeLinejoin="round" />
            ))}
            {art.dots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} />
            ))}
          </svg>
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: rgba(p.ink, 0.55), fontFamily: bf }}>
          {motifLabel}
          {inferred && <span className="italic"> (default — research in progress)</span>} · {weight}px ink {p.ink} · hatching {hatchLevel} ({hatch} lines/cluster)
        </p>
      </div>
    </div>
  )
}

/* ------------------------------ template: painterly canvas study ------------------------------ */

function paintStudy(ctx: CanvasRenderingContext2D, a: AestheticFull, p: DemoPalette, opts: { strokeCount: number; chaos: number; softness: 'impasto' | 'body' | 'wash' }): void {
  const W = 880
  const H = 620
  const rand = lcg(hashStr(`${a.slug}:painting`))
  const alpha = opts.softness === 'impasto' ? 0.92 : opts.softness === 'wash' ? 0.24 : 0.5
  const blur = opts.softness === 'impasto' ? 0 : opts.softness === 'wash' ? 2.6 : 1.1
  const jitter = 4 + opts.chaos * 46

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = p.bg
  ctx.fillRect(0, 0, W, H)

  // broad underwash bands
  const washes = [p.surface, mix(p.support, p.bg, 0.4), mix(p.accent, p.bg, 0.55)]
  for (let i = 0; i < washes.length; i++) {
    ctx.globalAlpha = 0.5
    ctx.fillStyle = washes[i]
    ctx.fillRect(0, (H / 3) * i + rand() * 30, W, H / 3 + 60)
  }

  ctx.globalAlpha = alpha
  if (blur > 0) ctx.filter = `blur(${blur}px)`
  const strokes = [p.accent, p.support, p.ink, mix(p.accent, p.ink, 0.45), mix(p.support, p.ink, 0.3)]
  ctx.lineCap = 'round'

  for (let i = 0; i < opts.strokeCount; i++) {
    const color = strokes[Math.floor(rand() * strokes.length)]
    ctx.fillStyle = color
    ctx.strokeStyle = color
    const kind = rand()
    if (kind < 0.52) {
      // horizontal-ish band stroke
      const w = 130 + rand() * 430
      const h = 9 + rand() * 24
      const x = rand() * Math.max(1, W - w)
      const y = rand() * H
      const rot = ((rand() - 0.5) * jitter * Math.PI) / 180
      ctx.save()
      ctx.translate(x + w / 2, y)
      ctx.rotate(rot)
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') ctx.roundRect(-w / 2, -h / 2, w, h, h / 2)
      else ctx.rect(-w / 2, -h / 2, w, h)
      ctx.fill()
      ctx.restore()
    } else if (kind < 0.8) {
      // painterly arc
      const r = 50 + rand() * 170
      const cx = rand() * W
      const cy = rand() * H
      const a0 = rand() * Math.PI * 2
      const span = 0.5 + rand() * 2.4
      ctx.lineWidth = 8 + rand() * 22
      ctx.beginPath()
      ctx.arc(cx, cy, r, a0, a0 + span)
      ctx.stroke()
    } else {
      // dab
      const rx = 18 + rand() * 46
      const ry = 8 + rand() * 16
      ctx.save()
      ctx.translate(rand() * W, rand() * H)
      ctx.rotate(((rand() - 0.5) * jitter * Math.PI) / 180)
      ctx.beginPath()
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  // one anchoring accent arc
  ctx.globalAlpha = Math.min(1, alpha + 0.25)
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.arc(W * (0.3 + rand() * 0.4), H * (0.35 + rand() * 0.3), 150 + rand() * 60, Math.PI * 0.9, Math.PI * 1.9)
  ctx.stroke()

  ctx.filter = 'none'
  ctx.globalAlpha = 0.5
  ctx.fillStyle = p.ink
  ctx.font = 'italic 15px Georgia, serif'
  ctx.textAlign = 'right'
  ctx.fillText(a.name, W - 26, H - 22)
  ctx.globalAlpha = 1
}

function PaintingDemo({ a, p, bf, shadow, overlay }: DemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const texText = `${a.visualDNA.texture ?? ''} ${a.textures.join(' ')}`.toLowerCase()
  const softness: 'impasto' | 'body' | 'wash' = /impasto|thick|knife|opaque|heavy body/.test(texText)
    ? 'impasto'
    : /wash|glaze|watercol|translucent|veil|stain|diluted|soft/.test(texText)
      ? 'wash'
      : 'body'
  const maximalism = a.dnaAxes.minimal_maximal ?? 50
  const chaos = (a.dnaAxes.orderly_chaotic ?? 50) / 100
  const strokeCount = 26 + Math.round((maximalism / 100) * 70)
  const noTextureData = !a.visualDNA.texture && a.textures.length === 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    paintStudy(ctx, a, p, { strokeCount, chaos, softness })
  }, [a, p, strokeCount, chaos, softness])

  return (
    <div className="overflow-hidden rounded-xl border p-3 shadow-lg sm:p-4" style={{ borderColor: rgba(p.ink, 0.18), boxShadow: shadow, background: p.surface }}>
      {/* gallery mat */}
      <div className="relative overflow-hidden rounded-md" style={{ border: `6px solid ${p.bg}`, outline: `1px solid ${rgba(p.ink, 0.15)}`, background: p.bg }}>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={880}
            height={620}
            role="img"
            aria-label={`Generative painting study for ${a.name}: layered brush strokes in the entry palette`}
            className="block h-auto w-full"
          />
          {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} aria-hidden="true" />}
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: rgba(p.ink, 0.55), fontFamily: bf }}>
        Painterly study — {strokeCount} strokes · {softness === 'impasto' ? 'impasto body' : softness === 'wash' ? 'washed glazes' : 'balanced body'}
        {noTextureData && <span className="italic"> · texture unspecified — research in progress</span>} · after “{a.name}”
      </p>
    </div>
  )
}

/* ------------------------------ texture swatches ------------------------------ */

export function TextureSwatches({ textures, colors }: { textures: string[]; colors: ColorEntry[] }) {
  // Texture keywords help pick a sensible preset palette when the entry's own palette is still empty.
  const p = useMemo(() => derivePalette(colors, textures.join(' ')), [colors, textures])
  if (textures.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2.5">
      {textures.slice(0, 6).map((t) => {
        const pat = texturePattern(t, p)
        return (
          <figure key={t} className="w-24 shrink-0">
            <div
              className="h-16 w-full rounded-md border"
              style={{
                backgroundImage: pat.backgroundImage,
                backgroundSize: pat.backgroundSize,
                backgroundColor: p.bg,
                borderColor: rgba(p.ink, 0.15),
              }}
              role="img"
              aria-label={`Texture sample: ${t}`}
              title={t}
            />
            <figcaption className="mt-1 truncate text-[10px] leading-tight text-fg-subtle" title={t}>
              {t}
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}

/* ------------------------------ visual gallery ------------------------------ */

function GalleryImage({ img, name, onFail }: { img: ImageEntry; name: string; onFail: () => void }) {
  return (
    <img
      src={img.url}
      alt={img.caption || `${name} visual example`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={onFail}
      className="aspect-[4/3] w-full cursor-zoom-in bg-surface-2 object-cover transition-transform duration-300 group-hover:scale-[1.04]"
    />
  )
}

export function VisualGallery({ images, name }: { images: ImageEntry[]; name: string }) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const [zoomed, setZoomed] = useState<string | null>(null)
  const visible = images.filter((i) => !failed.has(i.url))

  // Escape closes the lightbox before the enclosing sheet.
  useEffect(() => {
    if (!zoomed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        setZoomed(null)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [zoomed])
  if (visible.length === 0) return null

  return (
    <section aria-label="Visual examples">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-lg text-fg">
            <ImageIcon className="h-4 w-4 text-accent" aria-hidden="true" />
            Visual examples
          </h3>
          <p className="mt-0.5 text-xs text-fg-subtle">
            {visible.length} real example image{visible.length === 1 ? '' : 's'} sourced from the web by the research pipeline.
          </p>
        </div>
      </div>
      <div className={`grid gap-3 ${visible.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {visible.map((img) => (
          <figure key={img.url} className="group relative overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
            <GalleryImage img={img} name={name} onFail={() => setFailed((prev) => new Set(prev).add(img.url))} />
            <button
              type="button"
              className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={img.caption ? `View larger: ${img.caption}` : `View image from ${img.source || 'source'}`}
              onClick={() => setZoomed(img.url)}
            />
            {img.caption && (
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-stone-900/85 to-transparent px-2.5 pb-1.5 pt-6 text-[10px] leading-snug text-stone-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {img.caption}
              </figcaption>
            )}
            {img.source && (
              <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-stone-900/60 px-2 py-0.5 text-[9px] uppercase tracking-wide text-stone-100">
                {img.source}
              </span>
            )}
          </figure>
        ))}
      </div>

      {/* lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/85 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged example image"
          onClick={() => setZoomed(null)}
        >
          <img
            src={zoomed}
            alt={`${name} enlarged example`}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-5 top-5 rounded-full bg-surface px-3 py-1.5 text-sm text-fg shadow hover:bg-surface"
            onClick={() => setZoomed(null)}
          >
            Close ✕
          </button>
        </div>
      )}
    </section>
  )
}

/* ------------------------------ pending notice ------------------------------ */

export function PendingNotice({ a }: { a: AestheticFull }) {
  const missing: string[] = []
  if (Object.keys(a.visualDNA).length === 0) missing.push('visual DNA')
  if (Object.keys(a.typography).length === 0) missing.push('typography')
  if (Object.keys(a.lighting).length === 0) missing.push('lighting')
  if (Object.keys(a.architecture).length === 0) missing.push('architecture & applied fields')
  if (Object.keys(a.uiTranslation).length === 0) missing.push('UI translation')
  if (missing.length === 0) return null
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-700/25 bg-[#fdf6e7] px-4 py-3" role="status">
      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber-700" aria-hidden="true" />
      <div className="text-sm">
        <p className="font-medium text-amber-900">Deep decomposition in progress</p>
        <p className="mt-0.5 text-xs leading-relaxed text-amber-800/90">
          This record is at discovery depth. The research pipeline is still documenting: {missing.join(', ')}.{' '}
          {a.images.length === 0 && 'Visual examples will be attached once the image pass reaches this entry.'}
        </p>
      </div>
    </div>
  )
}
