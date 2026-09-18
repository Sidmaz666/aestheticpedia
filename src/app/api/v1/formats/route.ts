import { ok, options } from '@/lib/api'
import { EXPORT_FORMATS } from '@/lib/formats'

export const OPTIONS = options

/** GET /api/v1/formats — every per-aesthetic export format. */
export function GET() {
  return ok({ formats: EXPORT_FORMATS.map(({ id, label, ext, mime, group, description }) => ({ id, label, ext, mime, group, description, example: `/api/v1/aesthetics/bauhaus?format=${id}` })) })
}
