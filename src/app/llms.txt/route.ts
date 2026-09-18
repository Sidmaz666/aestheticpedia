import { SITE_URL } from '@/lib/formats'
import { getCategoryOverview, listIndex } from '@/lib/queries'

export const revalidate = 3600

/** /llms.txt — a concise, Markdown guide to the site for language models (llmstxt.org). */
export async function GET() {
  const [index, cats] = await Promise.all([listIndex(), getCategoryOverview()])
  const byCat = new Map<string, typeof index>()
  for (const a of index) {
    if (!byCat.has(a.category)) byCat.set(a.category, [])
    byCat.get(a.category)!.push(a)
  }
  const body = `# Aestheticpedia

> The open encyclopedia of the world's aesthetics: ${index.length.toLocaleString('en')} records covering art movements, architectural styles, cultural traditions, crafts, dress, sacred art, subcultures and internet aesthetics — each with description, cultural context, palette, visual grammar, typography, materials, relations, freely licensed images (with credits) and cited sources. Text is CC BY-SA 4.0.

Every record is available as Markdown at ${SITE_URL}/api/v1/aesthetics/{slug}.md and as JSON at ${SITE_URL}/api/v1/aesthetics/{slug}.

## Machine access
- [REST API](${SITE_URL}/api/v1): search, filter and export records (OpenAPI: ${SITE_URL}/api/v1/openapi.json)
- [MCP server](${SITE_URL}/api/mcp): Streamable HTTP; tools search_aesthetics, get_aesthetic, get_related, discover_by_style
- [Full text of every record](${SITE_URL}/llms-full.txt)
- [Bulk downloads](${SITE_URL}/data/manifest.json): JSON, NDJSON, CSV, Parquet, DuckDB

## Pages
- [Browse](${SITE_URL}/aesthetics): filterable index
- [Timeline](${SITE_URL}/timeline): dated aesthetics by era
- [About & terminology](${SITE_URL}/about): methodology, status and evidence ratings

${cats
  .map(
    (c) =>
      `## ${c.name} (${c.count})\n${(byCat.get(c.name) ?? [])
        .map((a) => `- [${a.name}](${SITE_URL}/api/v1/aesthetics/${a.slug}.md)${a.summary ? `: ${a.summary.replace(/\s+/g, ' ').slice(0, 160)}` : ''}`)
        .join('\n')}`
  )
  .join('\n\n')}
`
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
}
