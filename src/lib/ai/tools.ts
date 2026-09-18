// Tool schemas for the on-device agent. Needle (the router model) reads the names,
// descriptions and parameter hints to decide which tools a request needs and fills their
// arguments from the visitor's words. Keep descriptions short, literal and distinct:
// one tool per action, named the way people ask for it.

export interface ToolSpec {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, { type: 'string' | 'integer'; description?: string; enum?: string[] }>
    required: string[]
  }
}

export const SITE_PAGES = ['home', 'browse', 'timeline', 'connections', 'colors', 'discover', 'blend', 'data', 'about'] as const
export const MOODS = ['warm', 'cool', 'muted', 'vivid', 'dark', 'light', 'high contrast', 'soft', 'monochrome', 'colorful'] as const

export const AGENT_TOOLS: ToolSpec[] = [
  {
    name: 'search_aesthetics',
    description: 'Search the encyclopedia for aesthetics matching keywords, a mood, a theme or a subject.',
    parameters: { type: 'object', properties: { query: { type: 'string', description: 'the words to search for' } }, required: ['query'] },
  },
  {
    name: 'describe_aesthetic',
    description: 'Tell me about, explain or describe one named aesthetic: its history, origin, colours and materials.',
    parameters: { type: 'object', properties: { name: { type: 'string', description: 'the aesthetic, e.g. Art Deco' } }, required: ['name'] },
  },
  {
    name: 'open_aesthetic',
    description: 'Open or go to the page of one named aesthetic.',
    parameters: { type: 'object', properties: { name: { type: 'string', description: 'the aesthetic to open' } }, required: ['name'] },
  },
  {
    name: 'compare_aesthetics',
    description: 'Compare two named aesthetics side by side, or say how they differ.',
    parameters: {
      type: 'object',
      properties: { first: { type: 'string', description: 'first aesthetic' }, second: { type: 'string', description: 'second aesthetic' } },
      required: ['first', 'second'],
    },
  },
  {
    name: 'blend_aesthetics',
    description: 'Mix, blend, fuse or cross two named aesthetics into a new hybrid.',
    parameters: {
      type: 'object',
      properties: { first: { type: 'string', description: 'first aesthetic' }, second: { type: 'string', description: 'second aesthetic' } },
      required: ['first', 'second'],
    },
  },
  {
    name: 'similar_aesthetics',
    description: 'Find aesthetics similar to, like, or related to one named aesthetic.',
    parameters: { type: 'object', properties: { name: { type: 'string', description: 'the aesthetic to find relatives of' } }, required: ['name'] },
  },
  {
    name: 'find_by_color',
    description: 'Find aesthetics that use one colour. Only for colour words such as teal, crimson or ochre, or #hex codes.',
    parameters: { type: 'object', properties: { color: { type: 'string', description: 'a colour name or #hex code' } }, required: ['color'] },
  },
  {
    name: 'find_by_mood',
    description: 'Find aesthetics by the feel of their palette: warm, cool, muted, vivid, dark, light, soft.',
    parameters: { type: 'object', properties: { mood: { type: 'string', enum: [...MOODS] } }, required: ['mood'] },
  },
  {
    name: 'find_by_place',
    description: 'List aesthetics that come from a country, region, city or culture.',
    parameters: { type: 'object', properties: { place: { type: 'string', description: 'a country, region, city or people' } }, required: ['place'] },
  },
  {
    name: 'find_by_era',
    description: 'List aesthetics from a century, decade or historical period.',
    parameters: { type: 'object', properties: { era: { type: 'string', description: 'e.g. 1920s, 18th century, Edo period' } }, required: ['era'] },
  },
  {
    name: 'random_aesthetic',
    description: 'Surprise me with a random aesthetic.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'go_to_page',
    description: 'Go to a section of the site.',
    parameters: { type: 'object', properties: { page: { type: 'string', enum: [...SITE_PAGES] } }, required: ['page'] },
  },
  {
    name: 'set_theme',
    description: 'Switch the site between dark and light mode.',
    parameters: { type: 'object', properties: { mode: { type: 'string', enum: ['dark', 'light', 'system'] } }, required: ['mode'] },
  },
  {
    name: 'download_data',
    description: 'Download the whole encyclopedia dataset as a file.',
    parameters: { type: 'object', properties: { format: { type: 'string', enum: ['json', 'csv', 'parquet', 'ndjson', 'duckdb'] } }, required: ['format'] },
  },
]

/** Words that refer to "the aesthetic on screen" rather than naming one. */
export const DEICTIC = /^(this|it|this one|this aesthetic|this style|the current (one|aesthetic|page)|current|here|that|that one)$/i
