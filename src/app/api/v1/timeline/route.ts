import { handle, ok, options } from '@/lib/api'
import { getTimeline } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/** GET /api/v1/timeline — every dated aesthetic ordered by start year. */
export const GET = handle('timeline', async () => ok(await getTimeline()))
