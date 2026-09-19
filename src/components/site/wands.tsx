// The wand designs, drawn as SVG in a 48×48 box with the tip (the cursor's hotspot) at (4, 4)
// and the handle towards the bottom right. Wood, metal and stone are each wand's own
// materials; the magic (glow, star, crystal, runes) takes the current aesthetic's accents.
import { useId } from 'react'
import type { WandId } from '@/lib/wand'

export const WAND_TIP = 4
export const WAND_BOX = 48

export type Particle = 'sparkle' | 'ember' | 'star' | 'shard' | 'firefly' | 'glyph' | 'dust'

export const WANDS: Record<WandId, { name: string; blurb: string; particle: Particle; hover: Particle }> = {
  star: { name: 'Starlight', blurb: 'Pearl shaft, five-point star; leaves stardust.', particle: 'sparkle', hover: 'star' },
  elder: { name: 'Elder', blurb: 'Carved dark wood, brass rings; drifts embers.', particle: 'ember', hover: 'ember' },
  crystal: { name: 'Crystal', blurb: 'Quartz point on a silver wrap; throws prism shards.', particle: 'shard', hover: 'shard' },
  willow: { name: 'Willow', blurb: 'Living branch with a leaf; wakes fireflies.', particle: 'firefly', hover: 'firefly' },
  rune: { name: 'Obsidian', blurb: 'Black glass inlaid with runes; sheds glyph sparks.', particle: 'glyph', hover: 'glyph' },
  moon: { name: 'Moonlit', blurb: 'Rose-gold with a crescent; falls as moon dust.', particle: 'dust', hover: 'star' },
}

// Tapered shaft polygon along the diagonal from the tip to the handle.
function shaft(t: number, e: number, w0: number, w1: number) {
  const n = Math.SQRT1_2
  return [
    [t + w0 * n, t - w0 * n],
    [e + w1 * n, e - w1 * n],
    [e - w1 * n, e + w1 * n],
    [t - w0 * n, t + w0 * n],
  ]
    .map((p) => p.map((v) => v.toFixed(2)).join(','))
    .join(' ')
}
/** A short band across the shaft at distance d along the diagonal. */
function ring(d: number, half: number) {
  const n = Math.SQRT1_2
  return { x1: d + half * n, y1: d - half * n, x2: d - half * n, y2: d + half * n }
}
function starPath(cx: number, cy: number, r: number, inner: number, points = 5, rot = -Math.PI / 2) {
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 ? inner : r
    const a = rot + (i * Math.PI) / points
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`
  }
  return d + 'Z'
}

export function WandArt({ id, size = 44, className }: { id: WandId; size?: number; className?: string }) {
  const u = useId().replace(/:/g, '')
  const g = (name: string) => `${name}-${u}`
  const glow = (
    <filter id={g('glow')} x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="1.8" />
    </filter>
  )
  const halo = (r: number, cx = 5, cy = 5) => <circle cx={cx} cy={cy} r={r} fill="var(--accent)" opacity="0.55" filter={`url(#${g('glow')})`} />

  let art: React.ReactNode
  switch (id) {
    case 'elder':
      art = (
        <>
          <defs>
            <linearGradient id={g('wood')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7a5232" />
              <stop offset="0.55" stopColor="#4a2e1a" />
              <stop offset="1" stopColor="#24150b" />
            </linearGradient>
            {glow}
          </defs>
          {halo(5)}
          <polygon points={shaft(6.5, 43, 0.9, 3)} fill={`url(#${g('wood')})`} stroke="#1a0f07" strokeWidth="0.5" />
          <line x1="9" y1="9.6" x2="34" y2="34.6" stroke="#c89b62" strokeOpacity="0.35" strokeWidth="0.6" />
          {[29, 32.5, 36].map((d) => (
            <line key={d} {...ring(d, 3.3)} stroke="#caa24c" strokeWidth="1.2" strokeLinecap="round" />
          ))}
          <circle cx="43.5" cy="43.5" r="2.6" fill="#caa24c" stroke="#7d5f24" strokeWidth="0.6" />
          <circle cx="5.2" cy="5.2" r="1.9" fill="var(--accent)" />
          <circle cx="4.7" cy="4.7" r="0.7" fill="#fff" opacity="0.9" />
        </>
      )
      break
    case 'crystal':
      art = (
        <>
          <defs>
            <linearGradient id={g('metal')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3f4f6" />
              <stop offset="1" stopColor="#8b93a1" />
            </linearGradient>
            <linearGradient id={g('quartz')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.45" stopColor="var(--accent-2, var(--accent))" />
              <stop offset="1" stopColor="var(--accent)" />
            </linearGradient>
            {glow}
          </defs>
          {halo(6, 7, 7)}
          <polygon points={shaft(14, 43, 1.6, 2.6)} fill={`url(#${g('metal')})`} stroke="#5b6270" strokeWidth="0.5" />
          {[17, 19.5, 22, 24.5].map((d) => (
            <line key={d} {...ring(d, 2.4)} stroke="#d4d8de" strokeWidth="0.9" />
          ))}
          <circle cx="43.4" cy="43.4" r="2.3" fill={`url(#${g('metal')})`} stroke="#5b6270" strokeWidth="0.5" />
          <polygon points="3,3 9,5.2 15.4,11.6 16.2,16.2 11.6,15.4 5.2,9" fill={`url(#${g('quartz')})`} fillOpacity="0.92" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.5" />
          <line x1="3.4" y1="3.4" x2="15.5" y2="15.5" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.5" />
          <line x1="9" y1="5.2" x2="11.6" y2="15.4" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.4" />
        </>
      )
      break
    case 'willow':
      art = (
        <>
          <defs>
            <linearGradient id={g('bark')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a58456" />
              <stop offset="1" stopColor="#5b4127" />
            </linearGradient>
            {glow}
          </defs>
          {halo(5)}
          <path d="M5.5 5.5 C 12 9, 15 14, 20 19 S 30 27, 33 32 S 40 40, 43.5 43.5" fill="none" stroke="#3e2b18" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M5.5 5.5 C 12 9, 15 14, 20 19 S 30 27, 33 32 S 40 40, 43.5 43.5" fill="none" stroke={`url(#${g('bark')})`} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M26 24.5 C 28 19, 33 17.5, 36 18.5 C 34.5 22.5, 30.5 25.5, 26 24.5 Z" fill="#7da35a" stroke="#4d6b33" strokeWidth="0.5" />
          <path d="M26.4 24.2 L 34.5 19.5" stroke="#4d6b33" strokeWidth="0.45" />
          <circle cx="5.2" cy="5.2" r="1.8" fill="#e8f5a8" />
          <circle cx="5.2" cy="5.2" r="0.8" fill="#fff" />
        </>
      )
      break
    case 'rune':
      art = (
        <>
          <defs>
            <linearGradient id={g('obs')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3a3a44" />
              <stop offset="1" stopColor="#0b0b0f" />
            </linearGradient>
            {glow}
          </defs>
          {halo(4.5)}
          <polygon points={shaft(4.5, 43, 0.4, 2.8)} fill={`url(#${g('obs')})`} stroke="#8a8a99" strokeWidth="0.6" />
          <line x1="8" y1="8.9" x2="38" y2="38.9" stroke="#fff" strokeOpacity="0.28" strokeWidth="0.5" />
          <g stroke="var(--accent)" strokeWidth="0.9" strokeLinecap="round" filter={`url(#${g('glow')})`} opacity="0.9">
            <path d="M14 15 l1.6 -1.6 M15.2 16.4 l1.4 -3" />
            <path d="M21 22 l2 -0.6 M22 23.4 l0.6 -2.4" />
            <path d="M28 29 l1.8 -1.8 l0.4 1.6" />
            <path d="M34.5 35.6 l1.6 -1.2 M35.2 36.6 l1.8 -0.2" />
          </g>
          <g stroke="var(--accent)" strokeWidth="0.7" strokeLinecap="round">
            <path d="M14 15 l1.6 -1.6 M15.2 16.4 l1.4 -3" />
            <path d="M21 22 l2 -0.6 M22 23.4 l0.6 -2.4" />
            <path d="M28 29 l1.8 -1.8 l0.4 1.6" />
            <path d="M34.5 35.6 l1.6 -1.2 M35.2 36.6 l1.8 -0.2" />
          </g>
          <circle cx="43.3" cy="43.3" r="2.4" fill="#16161c" stroke="var(--accent)" strokeWidth="0.7" />
          <circle cx="4.8" cy="4.8" r="1.1" fill="#fff" />
        </>
      )
      break
    case 'moon':
      art = (
        <>
          <defs>
            <linearGradient id={g('rose')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3cdb9" />
              <stop offset="1" stopColor="#a86f5d" />
            </linearGradient>
            <mask id={g('cres')}>
              <circle cx="8.5" cy="8.5" r="6.4" fill="#fff" />
              <circle cx="11.6" cy="6.2" r="5.4" fill="#000" />
            </mask>
            {glow}
          </defs>
          {halo(6.5, 8, 8)}
          <polygon points={shaft(13, 43, 1.1, 2.3)} fill={`url(#${g('rose')})`} stroke="#8a5646" strokeWidth="0.45" />
          {[33, 36].map((d) => (
            <line key={d} {...ring(d, 2.8)} stroke="#fbe3d4" strokeWidth="0.9" />
          ))}
          <circle cx="43.3" cy="43.3" r="2.2" fill="#fbe3d4" stroke="#a86f5d" strokeWidth="0.5" />
          <circle cx="8.5" cy="8.5" r="6.4" fill="var(--accent-2, var(--accent))" mask={`url(#${g('cres')})`} />
          <path d={starPath(4.2, 3.8, 1.9, 0.7, 4, 0)} fill="#fff" />
        </>
      )
      break
    default: // star
      art = (
        <>
          <defs>
            <linearGradient id={g('pearl')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fbf8f2" />
              <stop offset="1" stopColor="#bdb3a3" />
            </linearGradient>
            <linearGradient id={g('gold')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff4c2" />
              <stop offset="0.5" stopColor="var(--accent-2, var(--accent))" />
              <stop offset="1" stopColor="var(--accent)" />
            </linearGradient>
            {glow}
          </defs>
          {halo(7, 8, 8)}
          <polygon points={shaft(12, 43, 1, 2.2)} fill={`url(#${g('pearl')})`} stroke="#9c9282" strokeWidth="0.45" />
          {[32, 34.5, 37].map((d) => (
            <line key={d} {...ring(d, 2.6)} stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" />
          ))}
          <circle cx="43.3" cy="43.3" r="2.1" fill="var(--accent)" />
          <path d={starPath(8, 8, 7.4, 3.1, 5, -Math.PI / 2 - Math.PI / 4)} fill={`url(#${g('gold')})`} stroke="#fff" strokeOpacity="0.8" strokeWidth="0.6" strokeLinejoin="round" />
          <path d={starPath(6.6, 6.6, 2, 0.6, 4, 0)} fill="#fff" opacity="0.9" />
        </>
      )
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${WAND_BOX} ${WAND_BOX}`} className={className} aria-hidden overflow="visible">
      {art}
    </svg>
  )
}
