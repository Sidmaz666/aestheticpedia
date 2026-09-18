import type { Metadata } from 'next'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { CopyBlock } from '@/components/site/copy-block'
import { EXPORT_FORMATS } from '@/lib/export-formats'
import { SITE_URL } from '@/lib/formats'
import { getCompleteness, getStats } from '@/lib/queries'
import type { DataManifest, ValidationReport } from '@/lib/aesthetic'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'Data & API',
  description: 'Download the full library (JSON, CSV, Parquet, DuckDB), query the free REST API, or connect AI assistants through MCP.',
  alternates: { canonical: '/data' },
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), 'public', 'data', file), 'utf8')) as T
  } catch {
    return null
  }
}

const FILE_INFO: Record<string, string> = {
  'aesthetics.json': 'Every record, nested JSON array',
  'aesthetics.ndjson': 'One record per line — streaming & LLM ingestion',
  'aesthetics.csv': 'Flat table; nested fields as JSON strings',
  'aesthetics.parquet': 'Columnar, zstd — pandas, Polars, Spark, DuckDB',
  'relations.json': 'Typed links between aesthetics',
  'relations.csv': 'Relations as a table',
  'relations.parquet': 'Relations, columnar',
  'aestheticpedia.duckdb': 'Both tables in a ready-to-query database',
}

const fmtBytes = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`)

export default async function DataPage() {
  const [stats, completeness, manifest, validation] = await Promise.all([
    getStats(),
    getCompleteness(),
    readJson<DataManifest>('manifest.json'),
    readJson<ValidationReport>('validation.json'),
  ])
  const n = (v: number) => v.toLocaleString('en')

  const mcpConfig = JSON.stringify({ mcpServers: { aestheticpedia: { type: 'http', url: `${SITE_URL}/api/mcp` } } }, null, 2)

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <p className="eyebrow">Open data</p>
      <h1 className="display mt-2 max-w-4xl text-6xl sm:text-7xl">Data & API</h1>
      <p className="mt-4 max-w-2xl text-lg text-fg-muted">
        Aestheticpedia is open by default. Download everything, query it live, or connect it to an AI assistant. No keys,
        no rate-limit sign-up. Text is CC BY-SA 4.0; each image lists its own license.
      </p>

      <nav aria-label="On this page" className="no-scrollbar mt-8 flex gap-2 overflow-x-auto">
        {[
          ['#downloads', 'Downloads'],
          ['#api', 'REST API'],
          ['#mcp', 'MCP server'],
          ['#ai', 'For AI crawlers'],
          ['#quality', 'Data quality'],
          ['#contribute', 'Contribute'],
        ].map(([h, l]) => (
          <a key={h} href={h} className="shrink-0 rounded-full border border-line-strong px-4 py-2 text-sm text-fg-muted hover:text-fg">
            {l}
          </a>
        ))}
      </nav>

      {/* Downloads */}
      <section id="downloads" className="scroll-mt-24 pt-16">
        <h2 className="display text-5xl">Downloads</h2>
        <p className="mt-2 text-sm text-fg-subtle">
          {manifest ? `Built ${new Date(manifest.builtAt).toUTCString()} · ${n(manifest.counts.aesthetics ?? stats.total)} aesthetics · ${n(manifest.counts.relations ?? stats.relations)} relations · SHA-256 checksums in ` : 'Checksums in '}
          <a href="/data/manifest.json" className="link-underline">manifest.json</a>
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(manifest?.files ?? []).map((f) => (
            <li key={f.name}>
              <a href={f.path} download className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
                <span className="flex items-center justify-between">
                  <span className="font-mono text-sm">{f.name}</span>
                  <Download className="size-4 text-fg-subtle group-hover:text-accent" aria-hidden />
                </span>
                <span className="mt-2 flex-1 text-xs text-fg-subtle">{FILE_INFO[f.name]}</span>
                <span className="mt-4 font-mono text-[11px] text-fg-subtle">
                  {fmtBytes(f.bytes)} · {f.sha256.slice(0, 12)}…
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <CopyBlock
            label="Query the Parquet file straight from the web with DuckDB"
            code={`SELECT name, category, periodStart, origin\nFROM '${SITE_URL}/data/aesthetics.parquet'\nWHERE category = 'Art Movement'\nORDER BY startYear;`}
          />
          <CopyBlock
            label="Python (pandas)"
            code={`import pandas as pd\ndf = pd.read_parquet("${SITE_URL}/data/aesthetics.parquet")\ndf.groupby("category").size().sort_values()`}
          />
        </div>
      </section>

      {/* API */}
      <section id="api" className="scroll-mt-24 pt-20">
        <h2 className="display text-5xl">REST API</h2>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          Base URL <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">{SITE_URL}/api/v1</code> · JSON · CORS
          enabled · described by{' '}
          <a href="/api/v1/openapi.json" className="link-underline">
            OpenAPI 3.1
          </a>
          .
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs text-fg-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Endpoint</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">What it returns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                ['GET /aesthetics?q=&category=&type=&region=&sort=&page=', 'Search & filter; format=json|ndjson|csv|md'],
                ['GET /aesthetics/{slug}', 'Full record + relations + similar'],
                ['GET /aesthetics/{slug}.md', 'Any export format by extension or ?format='],
                ['GET /search?q=', 'Ranked type-ahead suggestions'],
                ['GET /discover?dims=minimal_maximal:20,warm_cold:15', 'Nearest matches to a style profile'],
                ['GET /blend?a=&b=', 'Deterministic blend of two records'],
                ['GET /timeline', 'Every dated aesthetic by start year'],
                ['GET /categories', 'Categories, cover images, filter facets'],
                ['GET /stats', 'Counts, completeness, manifest, link report'],
                ['GET /random?mode=illustrated', 'A random record'],
              ].map(([e, d]) => (
                <tr key={e}>
                  <td className="px-4 py-3">
                    <a href={`/api/v1${e.replace(/^GET /, '').replace('{slug}', 'bauhaus').replace(/\?.*$/, (m) => (m.includes('dims') ? m : ''))}`} className="font-mono text-xs text-fg hover:text-accent">
                      {e}
                    </a>
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-fg-muted">Per-aesthetic export formats:</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {EXPORT_FORMATS.map((f) => (
            <li key={f.id}>
              <a href={`/api/v1/aesthetics/bauhaus?format=${f.id}`} className="rounded-full border border-line-strong px-3 py-1 font-mono text-xs text-fg-muted hover:text-fg" title={f.description}>
                {f.id}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <CopyBlock label="curl" code={`curl "${SITE_URL}/api/v1/aesthetics?q=deco&pageSize=5"\ncurl "${SITE_URL}/api/v1/aesthetics/art-deco?format=tailwind"`} />
        </div>
      </section>

      {/* MCP */}
      <section id="mcp" className="scroll-mt-24 pt-20">
        <h2 className="display text-5xl">MCP server</h2>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          A <a href="https://modelcontextprotocol.io" className="link-underline">Model Context Protocol</a> server over Streamable HTTP at{' '}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">{SITE_URL}/api/mcp</code>. Tools:{' '}
          <span className="font-mono text-xs">search_aesthetics, get_aesthetic, get_related, discover_by_style, list_categories, browse_category, random_aesthetic</span>
          ; resources <span className="font-mono text-xs">aesthetic://{'{slug}'}</span>; prompts for explanations and design briefs.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <CopyBlock label="Claude Code" code={`claude mcp add --transport http aestheticpedia ${SITE_URL}/api/mcp`} />
          <CopyBlock label="Claude Desktop / Cursor / other clients (JSON config)" code={mcpConfig} />
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="scroll-mt-24 pt-20">
        <h2 className="display text-5xl">For AI crawlers & agents</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['/llms.txt', 'Site guide for language models'],
            ['/llms-full.txt', 'Every record as compact Markdown'],
            ['/sitemap.xml', 'Every page, with last-modified dates'],
            ['/.well-known/mcp.json', 'MCP server discovery'],
          ].map(([h, d]) => (
            <li key={h}>
              <a href={h} className="block rounded-2xl border border-line bg-surface p-5 hover:border-line-strong">
                <span className="font-mono text-sm">{h}</span>
                <span className="mt-2 block text-xs text-fg-subtle">{d}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-fg-subtle">Every aesthetic page also embeds schema.org JSON-LD and links alternate JSON and Markdown versions.</p>
      </section>

      {/* Quality */}
      <section id="quality" className="scroll-mt-24 pt-20">
        <h2 className="display text-5xl">Data quality</h2>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          Every build validates each record against the schema; every link and image is checked automatically. The numbers
          below are live.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[
            ['Records', n(stats.total)],
            ['With images', `${Math.round((stats.withImages / Math.max(1, stats.total)) * 100)}%`],
            ['Linked to Wikidata', `${Math.round((stats.withWikidata / Math.max(1, stats.total)) * 100)}%`],
            ['Core fields complete', `${completeness.core}%`],
            ['Deep fields complete', `${completeness.deep}%`],
            ['Images', n(stats.images)],
            ['Links checked', validation ? n(validation.links.total) : '—'],
            ['Broken links hidden', validation ? n(validation.links.broken + validation.images.broken) : '—'],
          ].map(([k, v]) => (
            <div key={k} className="border-t border-line pt-3">
              <dt className="eyebrow">{k}</dt>
              <dd className="display mt-1 text-4xl">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Records by status</p>
            <Bars rows={stats.byStatus.map((s) => ({ name: { draft: 'Stub', researched: 'Documented', verified: 'Reviewed', flagged: 'Needs review' }[s.name] ?? s.name, count: s.count }))} />
          </div>
          <div>
            <p className="eyebrow mb-3">Most-missing fields (records lacking each)</p>
            <Bars rows={completeness.gaps.slice(0, 8).map((g) => ({ name: g.field, count: g.missing }))} />
          </div>
        </div>
      </section>

      {/* Contribute */}
      <section id="contribute" className="scroll-mt-24 pt-20">
        <h2 className="display text-5xl">Contribute</h2>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Each aesthetic is one JSON file in <code className="font-mono text-sm">data/aesthetics/</code>. Fix a record with GitHub’s
          editor, or add a new one with <code className="font-mono text-sm">npm run data:new</code> — CI validates the schema and
          links on every pull request. See the{' '}
          <a href="https://github.com/siddmazak/aestheticpedia/blob/main/CONTRIBUTING.md" className="link-underline">
            contributing guide
          </a>{' '}
          and the <Link href="/about#terminology" className="link-underline">terminology</Link>.
        </p>
      </section>
    </main>
  )
}

function Bars({ rows }: { rows: { name: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.name}>
          <div className="flex justify-between text-sm">
            <span className="capitalize text-fg-muted">{r.name}</span>
            <span className="font-mono text-xs text-fg-subtle">{r.count.toLocaleString('en')}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(1, (r.count / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
