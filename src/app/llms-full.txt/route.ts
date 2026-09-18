import { mapAestheticFull } from '@/lib/aesthetic'
import { toMarkdown } from '@/lib/formats'
import { listFullRows } from '@/lib/queries'
import { SITE_NAME } from '@/lib/site'

export const revalidate = 3600

/** /llms-full.txt — every record as Markdown in one document. */
export async function GET() {
  const rows = await listFullRows({ sort: 'name' }, 20000)
  const body = `# ${SITE_NAME} — full text\n\n${rows.length} records. Text CC BY-SA 4.0; images carry their own licenses.\n\n` + rows.map((r) => toMarkdown(mapAestheticFull(r))).join('\n\n\n')
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
}
