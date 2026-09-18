import { ok, options } from '@/lib/api'
import { openApiSpec } from '@/lib/openapi'

export const OPTIONS = options

/** GET /api/v1/openapi.json — OpenAPI 3.1 description of this API. */
export function GET() {
  return ok(openApiSpec())
}
