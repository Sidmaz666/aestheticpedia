// Model Context Protocol server (Streamable HTTP transport, stateless JSON responses).
// Spec: https://modelcontextprotocol.io/specification — supports protocol versions
// 2025-06-18, 2025-03-26 and 2024-11-05. Exposes the library as tools, resources and prompts.
import { DNA_AXES, EMOTION_KEYS } from '@/lib/aesthetic'
import { EXPORT_FORMATS, pageUrl, renderFormat, toMarkdown } from '@/lib/formats'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { CATEGORIES } from '@/lib/schema'
import { discover, getAesthetic, getCategoryOverview, getSimilar, listAesthetics, parseDims, randomAesthetic, suggest } from '@/lib/queries'

export const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05']
export const SERVER_INFO = { name: SITE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title: SITE_NAME, version: '1.0.0' }

type Json = Record<string, unknown>
export interface RpcRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Json
}

class RpcError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
  }
}

const TOOLS = [
  {
    name: 'search_aesthetics',
    title: 'Search aesthetics',
    description:
      `Search the ${SITE_NAME} library of world aesthetics (art movements, architectural styles, cultural traditions, internet aesthetics, subcultures, crafts…). Returns matching records with slug, category, period, origin, palette and summary.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free text, e.g. "cottagecore", "japanese ceramics", "brutalist"' },
        category: { type: 'string', enum: CATEGORIES, description: 'Optional category filter' },
        limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      },
      required: ['query'],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_aesthetic',
    title: 'Get aesthetic',
    description:
      'Get the complete record for one aesthetic by slug: description, cultural context, palette, visual grammar, typography, materials, key examples, related aesthetics, attributed images and sources. Format "markdown" (default) is best for reading; "json" for structured use; design formats (css, tailwind, tokens, svg) for building with the palette.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Record slug from search results, e.g. "art-nouveau"' },
        format: { type: 'string', enum: ['markdown', ...EXPORT_FORMATS.map((f) => f.id).filter((f) => f !== 'ase')], default: 'markdown' },
      },
      required: ['slug'],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_related',
    title: 'Related aesthetics',
    description: 'List aesthetics connected to one record (influences, variants, siblings, opposites) plus visually similar records from the same category.',
    inputSchema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'discover_by_style',
    title: 'Discover by style profile',
    description: `Find aesthetics closest to a target style profile. Each dimension is 0–100 between two poles: ${DNA_AXES.map((a) => `${a.key} (${a.left}→${a.right})`).join(', ')}; mood keys (0–100): ${EMOTION_KEYS.join(', ')}.`,
    inputSchema: {
      type: 'object',
      properties: {
        dimensions: {
          type: 'object',
          additionalProperties: { type: 'number', minimum: 0, maximum: 100 },
          description: 'e.g. { "minimal_maximal": 10, "warm_cold": 20, "quiet_loud": 15 }',
        },
        category: { type: 'string', enum: CATEGORIES },
        limit: { type: 'integer', minimum: 1, maximum: 30, default: 10 },
      },
      required: ['dimensions'],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'list_categories',
    title: 'List categories',
    description: 'List every category in the library with record counts.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'browse_category',
    title: 'Browse a category',
    description: 'Page through records in one category, most notable first.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: CATEGORIES },
        page: { type: 'integer', minimum: 1, default: 1 },
        pageSize: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
      },
      required: ['category'],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'random_aesthetic',
    title: 'Random aesthetic',
    description: 'Return a random illustrated aesthetic — useful for inspiration.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
]

const PROMPTS = [
  {
    name: 'describe_aesthetic',
    title: 'Explain an aesthetic',
    description: `Explain an aesthetic’s history, visual language and how to recognise it, grounded in its ${SITE_NAME} record.`,
    arguments: [{ name: 'slug', description: 'Aesthetic slug, e.g. "bauhaus"', required: true }],
  },
  {
    name: 'design_brief',
    title: 'Design brief from an aesthetic',
    description: 'Turn an aesthetic into a practical design brief (palette, type, materials, UI, imagery).',
    arguments: [
      { name: 'slug', description: 'Aesthetic slug', required: true },
      { name: 'project', description: 'What you are designing, e.g. "a coffee shop website"', required: false },
    ],
  },
]

const text = (t: string) => ({ content: [{ type: 'text', text: t }] })
const summaryLine = (a: { name: string; slug: string; category: string; periodStart?: string; origin?: string; summary?: string }) =>
  `- **${a.name}** (\`${a.slug}\`) — ${a.category}${a.periodStart ? `, ${a.periodStart}` : ''}${a.origin ? `, ${a.origin}` : ''}${a.summary ? `\n  ${a.summary}` : ''}`

async function callTool(name: string, args: Json) {
  const str = (k: string) => (typeof args[k] === 'string' ? (args[k] as string) : undefined)
  const int = (k: string, d: number, max: number) => Math.min(max, Math.max(1, Number(args[k]) || d))
  switch (name) {
    case 'search_aesthetics': {
      const q = str('query') ?? ''
      const limit = int('limit', 10, 50)
      const res = await listAesthetics({ q, categories: str('category') ? [str('category')!] : [], pageSize: limit, facets: false })
      const items = res.items.length ? res.items : []
      const fallback = !items.length ? await suggest(q, limit) : []
      const lines = items.length
        ? items.map(summaryLine)
        : fallback.map((s) => summaryLine({ ...s, summary: '' }))
      return {
        ...text(
          lines.length
            ? `Found ${res.total || fallback.length} aesthetic(s) for "${q}" (showing ${lines.length}). Use get_aesthetic with a slug for the full record.\n\n${lines.join('\n')}`
            : `No aesthetics match "${q}". Try a broader term or list_categories.`
        ),
        structuredContent: {
          total: res.total,
          items: items.map((i) => ({ slug: i.slug, name: i.name, category: i.category, period: i.periodStart, origin: i.origin, summary: i.summary, url: pageUrl(i.slug), image: i.image, colors: i.colors })),
        },
      }
    }
    case 'get_aesthetic': {
      const slug = str('slug')
      if (!slug) throw new RpcError(-32602, 'slug is required')
      const d = await getAesthetic(slug)
      if (!d) return { ...text(`No aesthetic with slug "${slug}". Use search_aesthetics to find the right slug.`), isError: true }
      const format = str('format') ?? 'markdown'
      if (format === 'markdown' || format === 'md') return text(toMarkdown(d.aesthetic, d.relations))
      const out = renderFormat(format, d.aesthetic, d.relations)
      if (!out || typeof out.body !== 'string') return { ...text(`Unsupported format "${format}"`), isError: true }
      return format === 'json' ? { ...text(out.body), structuredContent: d.aesthetic as unknown as Json } : text(out.body)
    }
    case 'get_related': {
      const slug = str('slug')
      if (!slug) throw new RpcError(-32602, 'slug is required')
      const d = await getAesthetic(slug)
      if (!d) return { ...text(`No aesthetic with slug "${slug}".`), isError: true }
      const similar = await getSimilar(slug, d.aesthetic.category, 8)
      const lines = [
        ...d.relations.outgoing.map((r) => `- ${r.type.replace(/_/g, ' ')} → **${r.target.name}** (\`${r.target.slug}\`)`),
        ...d.relations.incoming.map((r) => `- ${r.type.replace(/_/g, ' ')} ← **${r.source.name}** (\`${r.source.slug}\`)`),
      ]
      return text(
        `# Related to ${d.aesthetic.name}\n\n${lines.join('\n') || '_No documented relations yet._'}\n\n## Similar (${d.aesthetic.category})\n${similar.map(summaryLine).join('\n')}`
      )
    }
    case 'discover_by_style': {
      const raw = (args.dimensions ?? {}) as Record<string, unknown>
      const dims = parseDims(Object.entries(raw).map(([k, v]) => `${k}:${v}`).join(','))
      if (!dims.size) throw new RpcError(-32602, `dimensions must use known keys: ${[...DNA_AXES.map((a) => a.key), ...EMOTION_KEYS].join(', ')}`)
      const items = await discover(dims, str('category'), int('limit', 10, 30))
      return {
        ...text(items.map((i) => `- **${i.name}** (\`${i.slug}\`) — ${i.category}, distance ${i.distance}\n  ${i.summary}`).join('\n')),
        structuredContent: { items },
      }
    }
    case 'list_categories': {
      const cats = await getCategoryOverview()
      return { ...text(cats.map((c) => `- ${c.name}: ${c.count}`).join('\n')), structuredContent: { categories: cats } }
    }
    case 'browse_category': {
      const category = str('category')
      if (!category) throw new RpcError(-32602, 'category is required')
      const res = await listAesthetics({ categories: [category], page: int('page', 1, 1000), pageSize: int('pageSize', 20, 50), facets: false })
      return text(`${category}: ${res.total} records (page ${res.page})\n\n${res.items.map(summaryLine).join('\n')}`)
    }
    case 'random_aesthetic': {
      const item = await randomAesthetic('illustrated')
      if (!item) return text('Library is empty.')
      const d = await getAesthetic(item.slug)
      return text(d ? toMarkdown(d.aesthetic, d.relations) : summaryLine(item))
    }
  }
  throw new RpcError(-32602, `Unknown tool: ${name}`)
}

async function readResource(uri: string) {
  const m = /^aesthetic:\/\/([a-z0-9-]+)(?:\.(\w+))?$/.exec(uri)
  if (uri === 'aesthetic://index') {
    const res = await listAesthetics({ sort: 'name', pageSize: 5000, facets: false })
    return {
      contents: [{ uri, mimeType: 'text/markdown', text: res.items.map((a) => `- ${a.name} — aesthetic://${a.slug}`).join('\n') }],
    }
  }
  if (!m) throw new RpcError(-32002, `Resource not found: ${uri}`)
  const d = await getAesthetic(m[1])
  if (!d) throw new RpcError(-32002, `Resource not found: ${uri}`)
  if (m[2] === 'json') return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(d.aesthetic, null, 2) }] }
  return { contents: [{ uri, mimeType: 'text/markdown', text: toMarkdown(d.aesthetic, d.relations) }] }
}

async function getPrompt(name: string, args: Json) {
  const slug = typeof args.slug === 'string' ? args.slug : ''
  const d = slug ? await getAesthetic(slug) : null
  if (!d) throw new RpcError(-32602, `Unknown aesthetic slug "${slug}"`)
  const record = toMarkdown(d.aesthetic, d.relations)
  const ask =
    name === 'describe_aesthetic'
      ? `Using the ${SITE_NAME} record below, explain the aesthetic "${d.aesthetic.name}": where and when it emerged, what shaped it, its visual language (palette, forms, materials, typography), key examples, and how to tell it apart from related aesthetics. Cite the sources listed.`
      : name === 'design_brief'
        ? `Using the ${SITE_NAME} record below, write a practical design brief for ${typeof args.project === 'string' && args.project ? args.project : 'a new project'} in the "${d.aesthetic.name}" aesthetic: palette with hex codes and roles, type pairing, materials/textures, imagery and photography direction, UI components and motion, and pitfalls to avoid.`
        : null
  if (!ask) throw new RpcError(-32602, `Unknown prompt: ${name}`)
  return {
    description: PROMPTS.find((p) => p.name === name)?.description,
    messages: [
      { role: 'user', content: { type: 'text', text: ask } },
      { role: 'user', content: { type: 'resource', resource: { uri: `aesthetic://${slug}`, mimeType: 'text/markdown', text: record } } },
    ],
  }
}

/** Handle one JSON-RPC message. Returns null for notifications. */
export async function handleRpc(msg: RpcRequest): Promise<Json | null> {
  const isNotification = msg.id === undefined || msg.id === null
  try {
    if (msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') throw new RpcError(-32600, 'Invalid Request')
    const p = (msg.params ?? {}) as Json
    let result: unknown
    switch (msg.method) {
      case 'initialize': {
        const requested = typeof p.protocolVersion === 'string' ? p.protocolVersion : SUPPORTED_VERSIONS[0]
        result = {
          protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0],
          capabilities: { tools: { listChanged: false }, resources: { listChanged: false, subscribe: false }, prompts: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions:
            `${SITE_NAME} is an open encyclopedia of the world’s aesthetics. Use search_aesthetics to find records, then get_aesthetic with the slug for the full, sourced record (markdown). Images include licenses and attribution — credit them when you use them. Web pages: ${SITE_URL}/aesthetics/{slug}`,
        }
        break
      }
      case 'ping':
        result = {}
        break
      case 'tools/list':
        result = { tools: TOOLS }
        break
      case 'tools/call':
        result = await callTool(String(p.name ?? ''), (p.arguments ?? {}) as Json)
        break
      case 'resources/list':
        result = {
          resources: [
            { uri: 'aesthetic://index', name: 'index', title: 'Index of all aesthetics', mimeType: 'text/markdown' },
          ],
        }
        break
      case 'resources/templates/list':
        result = {
          resourceTemplates: [
            { uriTemplate: 'aesthetic://{slug}', name: 'aesthetic', title: 'Aesthetic record (Markdown)', mimeType: 'text/markdown' },
            { uriTemplate: 'aesthetic://{slug}.json', name: 'aesthetic-json', title: 'Aesthetic record (JSON)', mimeType: 'application/json' },
          ],
        }
        break
      case 'resources/read':
        result = await readResource(String(p.uri ?? ''))
        break
      case 'prompts/list':
        result = { prompts: PROMPTS }
        break
      case 'prompts/get':
        result = await getPrompt(String(p.name ?? ''), (p.arguments ?? {}) as Json)
        break
      case 'completion/complete': {
        const value = String((p.argument as Json | undefined)?.value ?? '')
        const hits = await suggest(value, 20)
        result = { completion: { values: hits.map((h) => h.slug), total: hits.length, hasMore: false } }
        break
      }
      case 'logging/setLevel':
        result = {}
        break
      default:
        if (msg.method.startsWith('notifications/')) return null
        throw new RpcError(-32601, `Method not found: ${msg.method}`)
    }
    return isNotification ? null : { jsonrpc: '2.0', id: msg.id, result }
  } catch (e) {
    if (isNotification) return null
    const err = e instanceof RpcError ? e : new RpcError(-32603, 'Internal error')
    if (!(e instanceof RpcError)) console.error('[mcp]', e)
    return { jsonrpc: '2.0', id: msg.id ?? null, error: { code: err.code, message: err.message, ...(err.data ? { data: err.data } : {}) } }
  }
}
