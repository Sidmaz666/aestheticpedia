'use client'

/**
 * Visual example & live-demo components for Aesthetic Atlas.
 *
 * - VisualGallery: real example imagery fetched by the research pipeline.
 * - StyleDemo: a LIVE web component that re-renders the aesthetic itself —
 *   its palette, typography, textures, lighting and motion rules — as a
 *   themed mini artifact (browser window / magazine cover / editorial plate
 *   / gallery frame, chosen by category).
 * - TextureSwatches: CSS-rendered texture chips (each texture becomes a
 *   deterministic visual pattern tinted with the entry's palette).
 * - PendingNotice: honest "decomposition queued" state for draft entries.
 *
 * Everything is derived deterministically from the entry data — no random
 * values, so SSR/CSR output always matches.
 */

import { useEffect, useMemo, useState } from 'react'
import { ImageIcon, Loader2, ScanEye } from 'lucide-react'
import { type AestheticFull, type ColorEntry, type ImageEntry } from '@/lib/aesthetic'

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
}

const FALLBACK: DemoPalette = {
  bg: '#faf8f4',
  surface: '#f0ebe0',
  ink: '#292524',
  accent: '#8a6d3b',
  support: '#a68a5b',
  warm: true,
  light: true,
}

/** Derive demo roles (bg/surface/ink/accent) from the entry palette. */
function derivePalette(colors: ColorEntry[]): DemoPalette {
  const valid = colors.filter((c) => hexToRgb(c.hex))
  if (valid.length < 2) return FALLBACK
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
  return { bg, surface, ink, accent, support, warm, light: luminance(bg) > 0.5 }
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

/* ------------------------------ hash (deterministic) ------------------------------ */

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/* ------------------------------ StyleDemo ------------------------------ */

const WEB_CATEGORIES = ['Internet Aesthetic', 'Web & UI Design', 'Game & Pixel Aesthetic', 'Technology & Retrofuturism', 'Graphic Design']
const FASHION_CATEGORIES = ['Fashion & Dress', 'Subculture Style', 'Music & Sonic Culture']
const BUILT_CATEGORIES = ['Architectural Style', 'Interior Design', 'Furniture & Product Design', 'Texture & Material Study', 'Material & Surface']

function firstSentence(text: string, max = 130): string {
  const s = text.split(/(?<=[.!?])\s/)[0] ?? text
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

export function StyleDemo({ a }: { a: AestheticFull }) {
  const p = useMemo(() => derivePalette(a.colors), [a.colors])
  const df = useMemo(() => displayFont(a), [a])
  const bf = useMemo(() => bodyFont(a), [a])
  const tex = useMemo(() => pickTexture(a.textures), [a.textures])
  const motion = motionFor(a)
  const shadow = shadowFor(a)
  const overlay = lightingOverlay(a, p)

  const isWeb = WEB_CATEGORIES.includes(a.category)
  const isFashion = FASHION_CATEGORIES.includes(a.category)
  const isBuilt = BUILT_CATEGORIES.includes(a.category)

  const tagline = firstSentence(a.summary || a.description, 150)
  const navItems = a.tags.slice(0, 4).map((t) => t.replace(/(^|-)([a-z])/g, (m) => m.toUpperCase()).replace(/-/g, ' '))
  const cardItems = (a.keyExamples.length > 0 ? a.keyExamples : a.objects).slice(0, 3)

  return (
    <section aria-label="Live style demo">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-lg text-stone-900">
            <ScanEye className="h-4 w-4 text-[#8a6d3b]" aria-hidden="true" />
            Live style demo
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            This interface is rebuilt from the entry&rsquo;s own palette, typography, textures, lighting and motion rules.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-stone-500 sm:inline-block">
          {isWeb ? 'Web template' : isFashion ? 'Cover template' : isBuilt ? 'Plate template' : 'Gallery template'}
        </span>
      </div>

      {isWeb ? (
        <BrowserDemo a={a} p={p} df={df} bf={bf} tex={tex} motion={motion} shadow={shadow} overlay={overlay} tagline={tagline} navItems={navItems} cardItems={cardItems} />
      ) : isFashion ? (
        <MagazineDemo a={a} p={p} df={df} bf={bf} tex={tex} motion={motion} shadow={shadow} overlay={overlay} tagline={tagline} />
      ) : isBuilt ? (
        <PlateDemo a={a} p={p} df={df} bf={bf} tex={tex} shadow={shadow} overlay={overlay} />
      ) : (
        <GalleryDemo a={a} p={p} df={df} bf={bf} tex={tex} shadow={shadow} overlay={overlay} tagline={tagline} />
      )}

      <p className="mt-2 text-[11px] text-stone-400">
        Rendered from: {a.colors.length} palette colors · {df.stack.split(',')[0]} display ·{' '}
        {tex ? `“${tex}” texture` : 'no texture data'} · {motion === 'none' ? 'restrained motion' : `${motion} motion`}
      </p>
    </section>
  )
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
        <div className="relative mt-5 flex h-7 items-end gap-[2px]" style={{ width: 92 }} aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ width: (h >> i) % 3 === 0 ? 3 : 1.5, height: `${55 + ((h >> i) % 45)}%`, background: p.ink, opacity: 0.8 }} />
          ))}
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

/* ------------------------------ texture swatches ------------------------------ */

export function TextureSwatches({ textures, colors }: { textures: string[]; colors: ColorEntry[] }) {
  const p = useMemo(() => derivePalette(colors), [colors])
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
            <figcaption className="mt-1 truncate text-[10px] leading-tight text-stone-500" title={t}>
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
      className="aspect-[4/3] w-full cursor-zoom-in bg-stone-100 object-cover transition-transform duration-300 group-hover:scale-[1.04]"
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
          <h3 className="flex items-center gap-2 font-serif text-lg text-stone-900">
            <ImageIcon className="h-4 w-4 text-[#8a6d3b]" aria-hidden="true" />
            Visual examples
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            {visible.length} real example image{visible.length === 1 ? '' : 's'} sourced from the web by the research pipeline.
          </p>
        </div>
      </div>
      <div className={`grid gap-3 ${visible.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {visible.map((img) => (
          <figure key={img.url} className="group relative overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <GalleryImage img={img} name={name} onFail={() => setFailed((prev) => new Set(prev).add(img.url))} />
            <button
              type="button"
              className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
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
            className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-sm text-stone-800 shadow hover:bg-white"
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
