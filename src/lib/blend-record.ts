// A blend of two documented aesthetics expressed as a full record, so the Blend page can use
// every section an aesthetic page has (gallery, palette, visual language, live demo, palette
// analysis, relationships, sources) and every export format. Everything comes from the two
// parents' records; the blend is labelled speculative throughout.
import type { AestheticFull, HybridResult } from '@/lib/aesthetic'
import { paletteMetrics } from '@/lib/palette-metrics'

const interleave = <T,>(a: T[], b: T[], max: number, key: (x: T) => string = (x) => String(x).toLowerCase()) => {
  const out: T[] = []
  const seen = new Set<string>()
  for (let i = 0; out.length < max && (i < a.length || i < b.length); i++) {
    for (const v of [a[i], b[i]]) if (v !== undefined && !seen.has(key(v)) && out.length < max && seen.add(key(v))) out.push(v)
  }
  return out
}
const mergeRecord = (a: Record<string, string>, b: Record<string, string>) => {
  const out: Record<string, string> = {}
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[k]
    const vb = b[k]
    out[k] = va && vb && va !== vb ? `${va} / ${vb}` : va || vb || ''
  }
  return out
}
const joinDistinct = (x: string, y: string, sep = ' · ') => [...new Set([x, y].filter(Boolean))].join(sep)

export const blendSlug = (a: string, b: string) => `blend-${a}--${b}`

export function blendRecord(A: AestheticFull, B: AestheticFull, h: HybridResult): AestheticFull {
  const colors = h.palette ?? []
  const images = interleave(
    A.images.map((i) => ({ ...i, caption: `${A.name} — ${i.caption}` })),
    B.images.map((i) => ({ ...i, caption: `${B.name} — ${i.caption}` })),
    12,
    (i) => i.url
  )
  const now = new Date().toISOString()
  return {
    slug: blendSlug(A.slug, B.slug),
    name: h.name ?? `${A.name} × ${B.name}`,
    aliases: [`${B.name} × ${A.name}`],
    category: A.category === B.category ? A.category : A.category,
    subcategory: `Speculative blend of ${A.name} and ${B.name}`,
    establishment: 'experimental_hybrid',
    status: 'draft',
    confidence: Math.min(A.confidence, B.confidence),
    era: joinDistinct(A.era, B.era, ' / '),
    origin: joinDistinct(A.origin, B.origin),
    geography: joinDistinct(A.geography, B.geography),
    periodStart: joinDistinct(A.periodStart, B.periodStart, ' / '),
    periodEnd: '',
    startYear: [A.startYear, B.startYear].filter((y): y is number => y !== null).sort((x, y) => x - y)[0] ?? null,
    endYear: null,
    summary: h.tagline ?? `${A.name} recast through ${B.name}.`,
    description: [
      h.synthesis ?? '',
      `${A.name}: ${A.summary || A.description.slice(0, 280)}`,
      `${B.name}: ${B.summary || B.description.slice(0, 280)}`,
      'This is a speculative blend derived algorithmically from the two documented records above — a design prompt, not a documented style.',
    ]
      .filter(Boolean)
      .join('\n\n'),
    culturalContext: [
      (h.sharedDNA ?? []).length ? `Where they agree: ${(h.sharedDNA ?? []).join('; ')}.` : '',
      (h.conflicts ?? []).length ? `Tensions to resolve: ${(h.conflicts ?? []).join('; ')}.` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    colors,
    metrics: paletteMetrics(colors),
    visualDNA: mergeRecord(A.visualDNA, B.visualDNA),
    typography: mergeRecord(A.typography, B.typography),
    typePairing: {
      display: h.typography?.display || A.typePairing.display || '',
      body: h.typography?.body || B.typePairing.body || '',
      notes: `Display from ${A.name}, body from ${B.name}.`,
    },
    materials: h.materials ?? interleave(A.materials, B.materials, 8),
    textures: interleave(A.textures, B.textures, 8),
    objects: h.objects ?? interleave(A.objects, B.objects, 8),
    keyExamples: interleave(A.keyExamples, B.keyExamples, 10),
    lighting: h.lighting ? { quality: h.lighting } : mergeRecord(A.lighting, B.lighting),
    photography: h.photography ? { style: h.photography } : mergeRecord(A.photography, B.photography),
    architecture: h.architecture ? { forms: h.architecture } : mergeRecord(A.architecture, B.architecture),
    fashion: h.fashion ? { silhouette: h.fashion } : mergeRecord(A.fashion, B.fashion),
    environment: mergeRecord(A.environment, B.environment),
    graphicDesign: mergeRecord(A.graphicDesign, B.graphicDesign),
    uiTranslation: Object.fromEntries(Object.entries(h.ui ?? {}).filter(([, v]) => v)) as Record<string, string>,
    recipe: {},
    emotionProfile: {},
    dnaAxes: {},
    sounds: interleave(A.sounds, B.sounds, 6),
    audio: [...A.audio, ...B.audio].slice(0, 4),
    tags: ['blend', ...interleave(A.tags, B.tags, 10)],
    images,
    image: images[0]?.thumb ?? images[0]?.url ?? null,
    imageCount: images.length,
    sources: [...A.sources.map((s) => ({ ...s, name: `${A.name}: ${s.name}` })), ...B.sources.map((s) => ({ ...s, name: `${B.name}: ${s.name}` }))],
    references: interleave(A.references, B.references, 12, (r) => r.url),
    paletteSource: 'derived',
    popularity: Math.round((A.popularity + B.popularity) / 2),
    isNiche: A.isNiche && B.isNiche,
    dataQuality: 'experimental',
    wikidata: null,
    wikipedia: null,
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}
