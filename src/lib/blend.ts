// Deterministic hybridisation of two documented aesthetics — every trait is derived
// from the parents' records (no generative model), so a pair always yields the same,
// traceable result.
import type { AestheticFull, ColorEntry, HybridResult } from '@/lib/aesthetic'

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgbToHex = (rgb: number[]) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t = 0.5) => {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t))
}
const valid = (c: ColorEntry) => /^#[0-9a-f]{6}$/i.test(c.hex)

/** Interleave the two palettes and add one midpoint blend between their anchors. */
function blendPalette(a: ColorEntry[], b: ColorEntry[]): ColorEntry[] {
  const pa = a.filter(valid)
  const pb = b.filter(valid)
  const out: ColorEntry[] = []
  if (pa[0] && pb[0]) out.push({ hex: mix(pa[0].hex, pb[0].hex), name: `${pa[0].name || 'A'} × ${pb[0].name || 'B'}` })
  for (let i = 0; out.length < 5 && (i < pa.length || i < pb.length); i++) {
    if (pa[i] && out.length < 5) out.push(pa[i])
    if (pb[i] && out.length < 5) out.push(pb[i])
  }
  return out
}

const lower = (s: string) => s.toLowerCase().trim()
function interleave(a: string[], b: string[], max: number): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (let i = 0; out.length < max && (i < a.length || i < b.length); i++) {
    for (const v of [a[i], b[i]]) {
      if (v && !seen.has(lower(v)) && out.length < max) {
        seen.add(lower(v))
        out.push(v)
      }
    }
  }
  return out
}
function shared(a: string[], b: string[]): string[] {
  const words = (xs: string[]) => new Set(xs.flatMap((x) => lower(x).split(/[^a-z]+/)).filter((w) => w.length > 3))
  const wb = words(b)
  return [...words(a)].filter((w) => wb.has(w))
}
const first = (r: Record<string, string>, keys: string[]) => keys.map((k) => r[k]).find(Boolean) ?? ''
const sentence = (s: string) => s.split(/(?<=[.!?])\s/)[0] ?? s


export function synthesize(A: AestheticFull, B: AestheticFull): HybridResult {
  const agreements: string[] = []
  const conflicts: string[] = []
  for (const axis of Object.keys(A.dnaAxes)) {
    const [lo, hi] = axis.split('_')
    if (!lo || !hi) continue
    const va = A.dnaAxes[axis]
    const vb = B.dnaAxes[axis]
    if (va === undefined || vb === undefined) continue
    const side = (v: number) => (v >= 50 ? hi : lo)
    if (Math.abs(va - vb) <= 20) agreements.push(`Both lean ${side((va + vb) / 2)} (${Math.round(va)} / ${Math.round(vb)})`)
    else if (Math.abs(va - vb) >= 45)
      conflicts.push(`${A.name} is ${side(va)} where ${B.name} is ${side(vb)} — settle near ${Math.round((va + vb) / 2)} on ${lo}↔${hi}`)
  }
  const common = shared([...A.materials, ...A.textures], [...B.materials, ...B.textures])
  if (common.length) agreements.push(`Shared material vocabulary: ${common.slice(0, 4).join(', ')}`)


  return {
    name: `${A.name} × ${B.name}`,
    tagline: `${sentence(A.summary || A.description)} Recast through ${B.name.toLowerCase()}.`.slice(0, 220),
    palette: blendPalette(A.colors, B.colors),
    materials: interleave(A.materials, B.materials, 6),
    typography: {
      display: A.typePairing.display || first(A.typography, ['display', 'headline']) || B.typePairing.display || '',
      body: B.typePairing.body || first(B.typography, ['body', 'text']) || A.typePairing.body || '',
    },
    architecture: [first(A.architecture, ['forms', 'structure', 'spaces']), first(B.architecture, ['forms', 'structure', 'spaces'])]
      .filter(Boolean)
      .map(sentence)
      .join(' '),
    fashion: [first(A.fashion, ['silhouette', 'garments']), first(B.fashion, ['silhouette', 'garments'])]
      .filter(Boolean)
      .map(sentence)
      .join(' '),
    objects: interleave(A.objects, B.objects, 6),
    lighting: [first(A.lighting, ['quality', 'mood', 'sources']), first(B.lighting, ['quality', 'mood', 'sources'])]
      .filter(Boolean)
      .map(sentence)
      .join(' '),
    ui: {
      background: A.uiTranslation.background || B.uiTranslation.background,
      surface: B.uiTranslation.surface || A.uiTranslation.surface,
      components: A.uiTranslation.components || B.uiTranslation.components,
      motion: B.uiTranslation.motion || A.uiTranslation.motion,
    },
    photography: [first(A.photography, ['style', 'composition']), first(B.photography, ['style', 'composition'])]
      .filter(Boolean)
      .map(sentence)
      .join(' '),
    sharedDNA: agreements.slice(0, 4),
    conflicts: conflicts.slice(0, 3),
    synthesis: `Structure and display type come from ${A.name}; surfaces, body text and motion from ${B.name}. The palette interleaves both, anchored by a midpoint blend of their lead colours; materials and objects alternate between the two parents.`,
  }
}
