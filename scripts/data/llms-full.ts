// public/llms-full.txt — every record as Markdown in one document, rendered with the site's own
// formatter (src/lib/formats.ts) from the Parquet build. It is a static file rather than a route:
// at ~25 MB it exceeds what a serverless or prerendered (ISR) response may carry on Vercel.
//
//   node scripts/data/llms-full.ts        (run by npm run data:build, after build.ts)
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import './alias.ts'
import { ROOT } from './lib.ts'

const { query } = await import('@/lib/store')
const { mapAestheticFull } = await import('@/lib/aesthetic')
const { toMarkdown } = await import('@/lib/formats')
const { SITE_NAME } = await import('@/lib/site')

const rows = await query<any>('SELECT * FROM aesthetics ORDER BY name')
const body =
  `# ${SITE_NAME} — full text\n\n${rows.length} records. Text CC BY-SA 4.0; images carry their own licenses.\n\n` +
  rows.map((r) => toMarkdown(mapAestheticFull(r))).join('\n\n\n')
const file = path.join(ROOT, 'public', 'llms-full.txt')
writeFileSync(file, body)
console.log(`✓ llms-full.txt · ${rows.length} records · ${(Buffer.byteLength(body) / 1e6).toFixed(1)} MB`)
process.exit(0)
