// OpenAPI 3.1 description of the public API (served at /api/v1/openapi.json).
import { API_VERSION } from '@/lib/api'
import { CATEGORIES, ESTABLISHMENTS, STATUSES } from '@/lib/schema'
import { EXPORT_FORMATS } from '@/lib/formats'
import { SITE_NAME, SITE_URL } from '@/lib/site'

const slug = { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'bauhaus' }
const json = (schema: object, description = 'OK') => ({ description, content: { 'application/json': { schema } } })
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })

export function openApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: `${SITE_NAME} API`,
      version: API_VERSION,
      summary: 'Open, read-only API for the encyclopedia of the world’s aesthetics.',
      description:
        'Free, no key required, CORS enabled. Text is CC BY-SA 4.0; every image carries its own license and attribution. ' +
        'Bulk downloads (JSON, NDJSON, CSV, Parquet, DuckDB) are listed at /data/manifest.json. ' +
        'An MCP server for AI assistants is available at /api/mcp.',
      license: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
      contact: { name: SITE_NAME, url: `${SITE_URL}/data` },
    },
    servers: [{ url: `${SITE_URL}/api/v1` }],
    externalDocs: { description: 'Developer guide', url: `${SITE_URL}/data` },
    tags: [
      { name: 'Aesthetics', description: 'Records, search and exports' },
      { name: 'Explore', description: 'Timeline, style-profile discovery and blends' },
      { name: 'Meta', description: 'Categories, statistics and formats' },
    ],
    paths: {
      '/aesthetics': {
        get: {
          tags: ['Aesthetics'],
          operationId: 'listAesthetics',
          summary: 'Search, filter and page through aesthetics',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Full-text match on name, aliases, tags, summary, origin' },
            { name: 'category', in: 'query', schema: { type: 'array', items: { type: 'string', enum: CATEGORIES } }, style: 'form', explode: true },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ESTABLISHMENTS } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: STATUSES } },
            { name: 'era', in: 'query', schema: { type: 'string' } },
            { name: 'region', in: 'query', schema: { type: 'string' } },
            { name: 'place', in: 'query', description: 'Free-text place matched against origin and geography', schema: { type: 'string' } },
            { name: 'from', in: 'query', description: 'Start of a year range (negative = BCE); returns records active in the range', schema: { type: 'integer' } },
            { name: 'to', in: 'query', description: 'End of a year range', schema: { type: 'integer' } },
            { name: 'tag', in: 'query', schema: { type: 'string' } },
            { name: 'images', in: 'query', schema: { type: 'boolean' }, description: 'Only records with images' },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['popular', 'name', 'recent', 'oldest', 'newest'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 24 } },
            { name: 'facets', in: 'query', schema: { type: 'boolean', default: true } },
            { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'ndjson', 'csv', 'md'], default: 'json' } },
          ],
          responses: { 200: json(ref('AestheticList')) },
        },
      },
      '/aesthetics/{slug}': {
        get: {
          tags: ['Aesthetics'],
          operationId: 'getAesthetic',
          summary: 'Get one aesthetic, optionally in an export format',
          description: 'Without `format` returns the full JSON record with relations and similar records. A file extension on the slug also selects the format, e.g. `/aesthetics/bauhaus.md`.',
          parameters: [
            slug,
            { name: 'format', in: 'query', schema: { type: 'string', enum: EXPORT_FORMATS.map((f) => f.id) } },
            { name: 'download', in: 'query', schema: { type: 'string', enum: ['1'] }, description: 'Send Content-Disposition: attachment' },
          ],
          responses: {
            200: {
              description: 'OK',
              content: Object.fromEntries([
                ['application/json', { schema: ref('AestheticDetail') }],
                ...EXPORT_FORMATS.filter((f) => !f.mime.startsWith('application/json')).map((f) => [f.mime.split(';')[0], { schema: { type: 'string' } }]),
              ]),
            },
            404: json(ref('Error'), 'Not found'),
          },
        },
      },
      '/search': {
        get: {
          tags: ['Aesthetics'],
          operationId: 'search',
          summary: 'Ranked type-ahead over names and aliases',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 50, default: 10 } },
          ],
          responses: { 200: json({ type: 'object', properties: { query: { type: 'string' }, items: { type: 'array', items: ref('Suggestion') } } }) },
        },
      },
      '/random': {
        get: {
          tags: ['Aesthetics'],
          operationId: 'random',
          summary: 'A random aesthetic',
          parameters: [{ name: 'mode', in: 'query', schema: { type: 'string', enum: ['illustrated', 'any', 'niche', 'reviewed'] } }],
          responses: { 200: json({ type: 'object', properties: { item: ref('AestheticSummary') } }) },
        },
      },
      '/timeline': {
        get: { tags: ['Explore'], operationId: 'timeline', summary: 'Every dated aesthetic ordered by start year', responses: { 200: json({ type: 'object' }) } },
      },
      '/discover': {
        get: {
          tags: ['Explore'],
          operationId: 'discover',
          summary: 'Nearest aesthetics by measured palette metrics',
          parameters: [
            { name: 'dims', in: 'query', required: true, schema: { type: 'string' }, example: 'warmth:85,saturation:30,lightness:70' },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 60 } },
          ],
          responses: { 200: json({ type: 'object' }) },
        },
      },
      '/blend': {
        get: {
          tags: ['Explore'],
          operationId: 'blend',
          summary: 'Deterministic blend of two aesthetics',
          parameters: [
            { name: 'a', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'b', in: 'query', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: json({ type: 'object' }) },
        },
      },
      '/compare': {
        get: {
          tags: ['Explore'],
          operationId: 'compare',
          summary: 'Up to four full records side by side',
          parameters: [{ name: 'slugs', in: 'query', required: true, schema: { type: 'string' }, example: 'bauhaus,art-deco' }],
          responses: { 200: json({ type: 'object' }) },
        },
      },
      '/categories': {
        get: { tags: ['Meta'], operationId: 'categories', summary: 'Categories with cover images and all filter facets', responses: { 200: json({ type: 'object' }) } },
      },
      '/stats': {
        get: { tags: ['Meta'], operationId: 'stats', summary: 'Library statistics, completeness, download manifest, link-check report', responses: { 200: json({ type: 'object' }) } },
      },
      '/formats': {
        get: { tags: ['Meta'], operationId: 'formats', summary: 'Export formats available per aesthetic', responses: { 200: json({ type: 'object' }) } },
      },
    },
    components: {
      schemas: {
        Error: { type: 'object', properties: { error: { type: 'object', properties: { status: { type: 'integer' }, message: { type: 'string' } } } } },
        Color: { type: 'object', properties: { hex: { type: 'string', pattern: '^#[0-9a-f]{6}$' }, name: { type: 'string' } } },
        Image: {
          type: 'object',
          required: ['url', 'caption', 'source'],
          properties: {
            url: { type: 'string', format: 'uri' },
            thumb: { type: 'string', format: 'uri' },
            full: { type: 'string', format: 'uri' },
            pageUrl: { type: 'string', format: 'uri' },
            caption: { type: 'string' },
            source: { type: 'string' },
            artist: { type: 'string' },
            date: { type: 'string' },
            license: { type: 'string' },
            licenseUrl: { type: 'string', format: 'uri' },
          },
        },
        Suggestion: { type: 'object', properties: { slug: { type: 'string' }, name: { type: 'string' }, category: { type: 'string' }, image: { type: ['string', 'null'] } } },
        AestheticSummary: {
          type: 'object',
          properties: {
            slug: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            establishment: { type: 'string', enum: ESTABLISHMENTS },
            status: { type: 'string', enum: STATUSES },
            summary: { type: 'string' },
            periodStart: { type: 'string' },
            startYear: { type: ['integer', 'null'] },
            origin: { type: 'string' },
            colors: { type: 'array', items: ref('Color') },
            tags: { type: 'array', items: { type: 'string' } },
            image: { type: ['string', 'null'] },
          },
        },
        AestheticList: {
          type: 'object',
          properties: {
            items: { type: 'array', items: ref('AestheticSummary') },
            total: { type: 'integer' },
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
            facets: { type: 'object' },
          },
        },
        AestheticDetail: {
          type: 'object',
          properties: {
            aesthetic: {
              allOf: [
                ref('AestheticSummary'),
                {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    culturalContext: { type: 'string' },
                    images: { type: 'array', items: ref('Image') },
                    wikidata: { type: ['string', 'null'] },
                    wikipedia: { type: ['string', 'null'] },
                  },
                },
              ],
            },
            relations: { type: 'object' },
            similar: { type: 'array', items: ref('AestheticSummary') },
          },
        },
      },
    },
  }
}
