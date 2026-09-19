// Export renderers for a single aesthetic. Used by /api/v1/aesthetics/{slug}?format=…,
// the MCP server and the "Export" menu on every aesthetic page.
import { STATUS_LABELS, ESTABLISHMENT_LABELS, DATA_QUALITY_LABELS, labelize, type AestheticFull, type ResolvedRelations } from '@/lib/aesthetic'

import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site'
import { absoluteUrl } from '@/lib/image-url'

export { SITE_URL }
import { METRIC_AXES } from '@/lib/palette-metrics'

export { EXPORT_FORMATS, type ExportFormat } from '@/lib/export-formats'
import { EXPORT_FORMATS } from '@/lib/export-formats'
import * as D from '@/lib/formats-design'

export const pageUrl = (slug: string) => `${SITE_URL}/aesthetics/${slug}`

const kebab = (s: string, i: number) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `color-${i + 1}`

const uniqueColorKeys = (a: AestheticFull) => {
  const seen = new Map<string, number>()
  return a.colors.map((c, i) => {
    let k = kebab(c.name, i)
    const n = seen.get(k) ?? 0
    seen.set(k, n + 1)
    if (n) k = `${k}-${n + 1}`
    return { ...c, key: k }
  })
}

const recordLines = (r: Record<string, string>) =>
  Object.entries(r)
    .filter(([, v]) => v)
    .map(([k, v]) => `- **${labelize(k)}:** ${v}`)

const period = (a: AestheticFull) => [a.periodStart, a.periodEnd].filter(Boolean).join(' – ')

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export function toMarkdown(a: AestheticFull, rel?: ResolvedRelations): string {
  const L: string[] = []
  const section = (title: string, lines: string[]) => {
    if (lines.length) L.push(`## ${title}`, '', ...lines, '')
  }
  L.push(`# ${a.name}`, '')
  if (a.aliases.length) L.push(`*Also known as: ${a.aliases.join(', ')}*`, '')
  L.push(
    `| | |`,
    `|---|---|`,
    `| Category | ${a.category}${a.subcategory ? ` › ${a.subcategory}` : ''} |`,
    `| Type | ${ESTABLISHMENT_LABELS[a.establishment] ?? a.establishment} |`,
    ...(period(a) ? [`| Period | ${period(a)} |`] : []),
    ...(a.origin ? [`| Origin | ${a.origin} |`] : []),
    ...(a.geography ? [`| Geography | ${a.geography} |`] : []),
    `| Status | ${STATUS_LABELS[a.status] ?? a.status} · ${DATA_QUALITY_LABELS[a.dataQuality] ?? a.dataQuality} |`,
    ...(a.wikidata ? [`| Wikidata | [${a.wikidata}](https://www.wikidata.org/wiki/${a.wikidata}) |`] : []),
    `| Source | ${pageUrl(a.slug)} |`,
    ''
  )
  if (a.summary) L.push(`> ${a.summary}`, '')
  section('Description', a.description ? [a.description] : [])
  section('Cultural context', a.culturalContext ? [a.culturalContext] : [])
  section('Palette', a.colors.map((c) => `- \`${c.hex}\` ${c.name}`))
  section('Visual grammar', recordLines(a.visualDNA))
  section(
    'Typography',
    [
      ...recordLines(a.typography),
      ...(a.typePairing.display ? [`- **Suggested pairing:** ${a.typePairing.display} / ${a.typePairing.body ?? ''}`] : []),
    ]
  )
  section('Materials', a.materials.map((m) => `- ${m}`))
  section('Textures', a.textures.map((m) => `- ${m}`))
  section('Signature objects', a.objects.map((m) => `- ${m}`))
  section('Key examples', a.keyExamples.map((m) => `- ${m}`))
  section('Lighting', recordLines(a.lighting))
  section('Photography', recordLines(a.photography))
  section('Architecture', recordLines(a.architecture))
  section('Fashion', recordLines(a.fashion))
  section('Interiors & environment', recordLines(a.environment))
  section('Graphic design', recordLines(a.graphicDesign))
  section('Interface translation', recordLines(a.uiTranslation))
  section(
    'How to evoke it',
    Object.entries(a.recipe).map(([k, v]) => `- **${labelize(k)}:** ${Array.isArray(v) ? v.join(', ') : v}`)
  )
  section('Sound', a.sounds.map((m) => `- ${m}`))
  section(
    'Palette analysis (measured from the palette, 0–100)',
    a.metrics ? METRIC_AXES.map((x) => `- ${x.left} ↔ ${x.right}: ${a.metrics![x.key]}`) : []
  )
  if (rel) {
    section('Related aesthetics', [
      ...rel.outgoing.map((r) => `- ${labelize(r.type)}: [${r.target.name}](${pageUrl(r.target.slug)})`),
      ...rel.incoming.map((r) => `- ${labelize(r.type)} (inverse): [${r.source.name}](${pageUrl(r.source.slug)})`),
    ])
  }
  section(
    'Images',
    a.images.map(
      (i) =>
        `- ![${i.caption.replace(/[[\]]/g, '')}](${absoluteUrl(i.url)}) — ${i.caption}${i.artist ? `, ${i.artist}` : ''}${i.license ? ` (${i.license})` : ''}${i.pageUrl ? ` · [source](${i.pageUrl})` : ''}`
    )
  )
  section('Sources', a.sources.map((s) => `- ${s.url ? `[${s.name}](${s.url})` : s.name}${s.tier ? ` (tier ${s.tier})` : ''}`))
  section('Further reading', a.references.map((r) => `- [${r.title}](${r.url})${r.note ? ` — ${r.note}` : ''}`))
  if (a.tags.length) L.push(`Tags: ${a.tags.map((t) => `#${t.replace(/\s+/g, '-')}`).join(' ')}`, '')
  L.push('---', `${SITE_NAME} · ${pageUrl(a.slug)} · text CC BY-SA 4.0 · updated ${a.updatedAt.slice(0, 10)}`)
  return L.join('\n')
}

export function toText(a: AestheticFull, rel?: ResolvedRelations): string {
  return toMarkdown(a, rel)
    .replace(/!\[[^\]]*]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1 <$2>')
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*|\*|`/g, '')
    .replace(/^\|.*\|$/gm, (row) => row.replace(/^\|\s*|\s*\|$/g, '').replace(/\s*\|\s*/g, ': '))
    .replace(/^---?: ---$/gm, '')
    .replace(/^> /gm, '')
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export function toHtml(a: AestheticFull, rel?: ResolvedRelations): string {
  const md = toMarkdown(a, rel)
  // Minimal Markdown → HTML for our own, known output shape.
  const body = md
    .split('\n\n')
    .map((block) => {
      const b = block.trim()
      if (!b) return ''
      if (b.startsWith('# ')) return `<h1>${esc(b.slice(2))}</h1>`
      if (b.startsWith('## ')) {
        const [h, ...rest] = b.split('\n')
        return `<h2>${esc(h.slice(3))}</h2>${rest.length ? inline(rest.join('\n')) : ''}`
      }
      return inline(b)
    })
    .join('\n')
  function inline(b: string): string {
    const fmt = (t: string) =>
      esc(t)
        .replace(/!\[([^\]]*)]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    const lines = b.split('\n')
    if (lines.every((l) => l.startsWith('- '))) return `<ul>${lines.map((l) => `<li>${fmt(l.slice(2))}</li>`).join('')}</ul>`
    if (lines.every((l) => l.startsWith('|')))
      return `<table>${lines
        .filter((l) => !/^\|[-| ]+\|$/.test(l) && l !== '| | |')
        .map((l) => `<tr>${l.replace(/^\||\|$/g, '').split('|').map((c, i) => (i === 0 ? `<th>${fmt(c.trim())}</th>` : `<td>${fmt(c.trim())}</td>`)).join('')}</tr>`)
        .join('')}</table>`
    if (b.startsWith('> ')) return `<blockquote>${fmt(b.slice(2))}</blockquote>`
    return `<p>${fmt(b).replace(/\n/g, '<br>')}</p>`
  }
  const bg = a.colors[0]?.hex ?? '#faf8f4'
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(a.name)} — ${esc(SITE_NAME)}</title>
<link rel="canonical" href="${pageUrl(a.slug)}">
<style>body{font:17px/1.65 Georgia,serif;max-width:46rem;margin:3rem auto;padding:0 1.25rem;color:#1c1917}h1{font-size:2.6rem;line-height:1.1;margin:0 0 .5rem;border-bottom:6px solid ${bg}}h2{font:600 .8rem/1.2 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;margin-top:2.5rem;color:#57534e}img{max-width:100%;height:auto;display:block;margin:.5rem 0}table{border-collapse:collapse;font:14px system-ui,sans-serif}th,td{padding:.35rem .75rem;border-bottom:1px solid #e7e5e4;text-align:left}blockquote{margin:1.5rem 0;padding-left:1rem;border-left:3px solid ${bg};font-size:1.15rem}code{font-size:.9em}a{color:inherit}</style>
</head><body>
${body}
</body></html>`
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export function toJsonLd(a: AestheticFull) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': pageUrl(a.slug),
    url: pageUrl(a.slug),
    name: a.name,
    alternateName: a.aliases.length ? a.aliases : undefined,
    description: a.summary || a.description.slice(0, 300),
    termCode: a.slug,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': `${SITE_URL}/aesthetics`,
      name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    },
    keywords: [a.category, ...a.tags].join(', '),
    temporalCoverage: period(a) || undefined,
    spatialCoverage: a.origin || a.geography || undefined,
    sameAs: [
      a.wikipedia ? `https://en.wikipedia.org/wiki/${encodeURIComponent(a.wikipedia.replace(/ /g, '_'))}` : null,
      a.wikidata ? `https://www.wikidata.org/wiki/${a.wikidata}` : null,
    ].filter(Boolean),
    image: a.images.slice(0, 6).map((i) => ({
      '@type': 'ImageObject',
      contentUrl: absoluteUrl(i.url),
      thumbnailUrl: i.thumb && absoluteUrl(i.thumb),
      caption: i.caption,
      creator: i.artist ? { '@type': 'Person', name: i.artist } : undefined,
      license: i.licenseUrl,
      acquireLicensePage: i.pageUrl,
      creditText: [i.artist, i.license, i.source].filter(Boolean).join(' · '),
    })),
    citation: a.sources.filter((s) => s.url).map((s) => s.url),
    dateModified: a.updatedAt,
    license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    isAccessibleForFree: true,
  }
}

function yamlScalar(v: unknown): string {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  const s = String(v)
  if (s === '' || /^[\s>|@`!&*%?#{}[\],:'"-]|: |\s#|\n|^(true|false|null|yes|no|~|\d[\d.e+-]*)$/i.test(s)) return JSON.stringify(s)
  return s
}

export function toYaml(value: unknown, indent = 0): string {
  const pad = ' '.repeat(indent)
  if (Array.isArray(value)) {
    if (!value.length) return '[]'
    return value
      .map((v) => {
        if (v && typeof v === 'object') {
          const inner = toYaml(v, indent + 2)
          return `${pad}- ${inner.trimStart()}`
        }
        return `${pad}- ${yamlScalar(v)}`
      })
      .join('\n')
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined)
    if (!entries.length) return '{}'
    return entries
      .map(([k, v]) => {
        const key = /^[a-zA-Z_][\w-]*$/.test(k) ? k : JSON.stringify(k)
        if (v && typeof v === 'object' && (Array.isArray(v) ? v.length : Object.keys(v).length))
          return `${pad}${key}:\n${toYaml(v, indent + 2)}`
        return `${pad}${key}: ${Array.isArray(v) ? '[]' : v && typeof v === 'object' ? '{}' : yamlScalar(v)}`
      })
      .join('\n')
  }
  return pad + yamlScalar(value)
}

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  return [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\r\n') + '\r\n'
}

// ---------------------------------------------------------------------------
// Design
// ---------------------------------------------------------------------------

const fontStack = (name: string | undefined, fallback: string) => (name ? `"${name.replace(/"/g, '')}", ${fallback}` : fallback)

export function toCss(a: AestheticFull): string {
  const colors = uniqueColorKeys(a)
  return `/* ${a.name} — ${SITE_NAME} palette · ${pageUrl(a.slug)} */
:root {
${colors.map((c) => `  --${a.slug}-${c.key}: ${c.hex}; /* ${c.name} */`).join('\n')}
${colors.map((c, i) => `  --palette-${i + 1}: var(--${a.slug}-${c.key});`).join('\n')}
  --font-display: ${fontStack(a.typePairing.display, 'Georgia, serif')};
  --font-body: ${fontStack(a.typePairing.body, 'system-ui, sans-serif')};
}
`
}

export function toScss(a: AestheticFull): string {
  const colors = uniqueColorKeys(a)
  return `// ${a.name} — ${SITE_NAME} palette · ${pageUrl(a.slug)}
${colors.map((c) => `$${a.slug}-${c.key}: ${c.hex}; // ${c.name}`).join('\n')}

$${a.slug}-palette: (
${colors.map((c) => `  "${c.key}": $${a.slug}-${c.key},`).join('\n')}
);

$font-display: ${fontStack(a.typePairing.display, 'Georgia, serif')};
$font-body: ${fontStack(a.typePairing.body, 'system-ui, sans-serif')};
`
}

export function toTailwind(a: AestheticFull): string {
  const colors = uniqueColorKeys(a)
  return `/* ${a.name} — Tailwind CSS v4 theme · ${pageUrl(a.slug)}
   @import this after "tailwindcss"; use e.g. bg-${a.slug}-${colors[0]?.key ?? 'color-1'} */
@theme {
${colors.map((c) => `  --color-${a.slug}-${c.key}: ${c.hex};`).join('\n')}
  --font-${a.slug}-display: ${fontStack(a.typePairing.display, 'Georgia, serif')};
  --font-${a.slug}-body: ${fontStack(a.typePairing.body, 'system-ui, sans-serif')};
}
`
}

export function toTokens(a: AestheticFull) {
  const colors = uniqueColorKeys(a)
  return {
    $description: `${a.name} — ${SITE_NAME} design tokens (${pageUrl(a.slug)})`,
    [a.slug]: {
      color: Object.fromEntries(colors.map((c) => [c.key, { $type: 'color', $value: c.hex, $description: c.name }])),
      font: {
        display: { $type: 'fontFamily', $value: [a.typePairing.display ?? 'Georgia', 'serif'] },
        body: { $type: 'fontFamily', $value: [a.typePairing.body ?? 'system-ui', 'sans-serif'] },
      },
    },
  }
}

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
}

export function toGpl(a: AestheticFull): string {
  return `GIMP Palette
Name: ${a.name}
Columns: ${Math.min(8, Math.max(1, a.colors.length))}
# ${pageUrl(a.slug)}
${a.colors
  .map((c) => {
    const [r, g, b] = rgb(c.hex)
    return `${String(r).padStart(3)} ${String(g).padStart(3)} ${String(b).padStart(3)}\t${c.name || c.hex}`
  })
  .join('\n')}
`
}

/** Adobe Swatch Exchange (ASE) binary: one group with RGB global swatches. */
export function toAse(a: AestheticFull): Uint8Array {
  const chunks: number[] = []
  const u16 = (n: number) => chunks.push((n >> 8) & 255, n & 255)
  const u32 = (n: number) => chunks.push((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255)
  const f32 = (n: number) => {
    const b = new Uint8Array(new Float32Array([n]).buffer)
    chunks.push(b[3], b[2], b[1], b[0])
  }
  const utf16 = (s: string) => {
    const str = s.slice(0, 120)
    u16(str.length + 1)
    for (const ch of str) u16(ch.charCodeAt(0))
    u16(0)
  }
  const block = (type: number, body: () => void) => {
    u16(type)
    const lenPos = chunks.length
    u32(0)
    const start = chunks.length
    body()
    const len = chunks.length - start
    chunks[lenPos] = (len >>> 24) & 255
    chunks[lenPos + 1] = (len >>> 16) & 255
    chunks[lenPos + 2] = (len >>> 8) & 255
    chunks[lenPos + 3] = len & 255
  }
  chunks.push(0x41, 0x53, 0x45, 0x46) // "ASEF"
  u16(1)
  u16(0)
  u32(a.colors.length + 2)
  block(0xc001, () => utf16(a.name))
  for (const c of a.colors) {
    block(0x0001, () => {
      utf16(c.name || c.hex)
      chunks.push(0x52, 0x47, 0x42, 0x20) // "RGB "
      const [r, g, b] = rgb(c.hex)
      f32(r / 255)
      f32(g / 255)
      f32(b / 255)
      u16(0) // global
    })
  }
  block(0xc002, () => {})
  return new Uint8Array(chunks)
}

export function toSvg(a: AestheticFull): string {
  const w = 640
  const sw = a.colors.length ? w / a.colors.length : w
  const lum = (hex: string) => {
    const [r, g, b] = rgb(hex).map((v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="300" viewBox="0 0 ${w} 300" font-family="system-ui, sans-serif">
  <title>${esc(a.name)} palette</title>
  <rect width="${w}" height="300" fill="#fafaf9"/>
${a.colors
  .map((c, i) => {
    const ink = lum(c.hex) > 0.4 ? '#1c1917' : '#fafaf9'
    const x = i * sw
    return `  <rect x="${x.toFixed(1)}" y="0" width="${sw.toFixed(1)}" height="240" fill="${c.hex}"/>
  <text x="${(x + 12).toFixed(1)}" y="220" font-size="12" fill="${ink}">${esc(c.hex.toUpperCase())}</text>
  <text x="${(x + 12).toFixed(1)}" y="202" font-size="11" fill="${ink}" opacity="0.8">${esc(c.name.slice(0, Math.max(6, Math.floor(sw / 7))))}</text>`
  })
  .join('\n')}
  <text x="16" y="276" font-size="15" font-weight="600" fill="#1c1917">${esc(a.name)}</text>
  <text x="${w - 16}" y="276" font-size="11" fill="#78716c" text-anchor="end">aestheticpedia</text>
</svg>
`
}

// ---------------------------------------------------------------------------
// Citations
// ---------------------------------------------------------------------------

export function toBibtex(a: AestheticFull): string {
  const d = new Date(a.updatedAt)
  return `@misc{aestheticpedia:${a.slug},
  title        = {{${a.name}}},
  author       = {{${SITE_NAME} contributors}},
  howpublished = {\\url{${pageUrl(a.slug)}}},
  year         = {${d.getUTCFullYear()}},
  note         = {${SITE_NAME}, ${SITE_TAGLINE.toLowerCase()}. Accessed ${new Date().toISOString().slice(0, 10)}},
  keywords     = {${[a.category, ...a.tags.slice(0, 8)].join(', ')}}
}
`
}

export function toRis(a: AestheticFull): string {
  const d = new Date(a.updatedAt)
  return [
    'TY  - ELEC',
    `TI  - ${a.name}`,
    `AU  - ${SITE_NAME} contributors`,
    `PY  - ${d.getUTCFullYear()}`,
    `UR  - ${pageUrl(a.slug)}`,
    `AB  - ${a.summary}`,
    `PB  - ${SITE_NAME}`,
    ...[a.category, ...a.tags.slice(0, 8)].map((k) => `KW  - ${k}`),
    `Y2  - ${new Date().toISOString().slice(0, 10)}`,
    'ER  - ',
    '',
  ].join('\r\n')
}

/** Render any supported format. Returns body + content type. */
export function renderFormat(
  format: string,
  a: AestheticFull,
  rel?: ResolvedRelations
): { body: string | Uint8Array; mime: string; ext: string } | null {
  const f = EXPORT_FORMATS.find((x) => x.id === format)
  if (!f) return null
  const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n'
  const body = (() => {
    switch (f.id) {
      case 'md':
        return toMarkdown(a, rel)
      case 'txt':
        return toText(a, rel)
      case 'html':
        return toHtml(a, rel)
      case 'json':
        return json(rel ? { ...a, relations: rel } : a)
      case 'jsonld':
        return json(toJsonLd(a))
      case 'yaml':
        return `# ${a.name} — ${pageUrl(a.slug)}\n` + toYaml(a) + '\n'
      case 'csv':
        return toCsv([a as unknown as Record<string, unknown>])
      case 'css':
        return toCss(a)
      case 'scss':
        return toScss(a)
      case 'tailwind':
        return toTailwind(a)
      case 'tokens':
        return json(toTokens(a))
      case 'gpl':
        return toGpl(a)
      case 'ase':
        return toAse(a)
      case 'svg':
        return toSvg(a)
      case 'bib':
        return toBibtex(a)
      case 'ris':
        return toRis(a)
      case 'shadcn':
        return D.toShadcnCss(a)
      case 'shadcn-json':
        return json(D.toShadcnRegistry(a))
      case 'tailwind3':
        return D.toTailwind3(a)
      case 'daisyui':
        return D.toDaisyUI(a)
      case 'mui':
        return D.toMui(a)
      case 'chakra':
        return D.toChakra(a)
      case 'bootstrap':
        return D.toBootstrap(a)
      case 'less':
        return D.toLess(a)
      case 'stylus':
        return D.toStylus(a)
      case 'theme-ts':
        return D.toThemeTs(a)
      case 'style-dictionary':
        return json(D.toStyleDictionary(a))
      case 'tokens-studio':
        return json(D.toTokensStudio(a))
      case 'colors-json':
        return json(D.toColorValues(a))
      case 'sketch':
        return json(D.toSketchPalette(a))
      case 'procreate':
        return D.toProcreate(a)
      case 'aco':
        return D.toAco(a)
      case 'paintnet':
        return D.toPaintNet(a)
      case 'android':
        return D.toAndroidXml(a)
      case 'swiftui':
        return D.toSwiftUI(a)
      case 'flutter':
        return D.toFlutter(a)
      case 'compose':
        return D.toCompose(a)
    }
    return ''
  })()
  return { body, mime: f.mime, ext: f.ext }
}
