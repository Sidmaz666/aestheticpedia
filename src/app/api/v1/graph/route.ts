import { handle, ok, options } from '@/lib/api'
import { getGraph } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/** GET /api/v1/graph — the relationship network: nodes (records with relations) and typed links. */
export const GET = handle('graph', async () => ok(await getGraph()))
