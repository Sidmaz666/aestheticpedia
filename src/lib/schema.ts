// Aesthetic Atlas — canonical record schema for data/aesthetics.json.
// Used by scripts/data/build.ts (hard gate before Parquet/CSV export) and
// scripts/data/validate.ts (full report incl. link checks).
import { z } from 'zod'

export const CATEGORIES = [
  'Architectural Style',
  'Art Movement',
  'Color & Light',
  'Drawing & Line Work',
  'Fashion & Dress',
  'Film & Cinema',
  'Furniture & Product Design',
  'Graphic Design',
  'Historical Period Style',
  'Illustration & Comics',
  'Interior Design',
  'Internet Aesthetic',
  'Material & Surface',
  'Music & Sonic Culture',
  'Painting Technique & School',
  'Photography',
  'Regional & Cultural Tradition',
  'Religious & Sacred Art',
  'Science Fiction & Fantasy',
  'Subculture Style',
  'Technology & Retrofuturism',
  'Textile & Craft',
  'Texture & Material Study',
  'Visual Effects & Phenomena',
] as const

export const ESTABLISHMENTS = [
  'historical',
  'regional_tradition',
  'community_subculture',
  'commercial_style',
  'internet_aesthetic',
  'experimental_hybrid',
] as const

export const STATUSES = ['draft', 'researched', 'verified', 'flagged'] as const
export const DATA_QUALITIES = [
  'well_documented',
  'moderately_documented',
  'emerging',
  'interpretive',
  'experimental',
] as const
export const RELATION_TYPES = [
  'parent',
  'variant_of',
  'influenced_by',
  'influenced',
  'confused_with',
  'hybrid_of',
  'sibling',
  'related',
  'reacts_against',
  'opposite',
] as const
export const REFERENCE_TYPES = ['article', 'video', 'museum', 'exhibition', 'web', 'archive', 'scholar', 'images'] as const

const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//.test(u), 'must be http(s)')

/** Result of the last link check (scripts/data/check-links.ts). */
export const LinkCheck = z.object({
  ok: z.boolean(),
  status: z.number().int().optional(),
  checkedAt: z.string(),
})

export const ColorSchema = z.object({
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'hex must be #rrggbb'),
  name: z.string(),
})

export const SourceSchema = z.object({
  name: z.string().min(1),
  url: httpUrl.optional(),
  tier: z.enum(['A', 'B', 'C', 'D']).optional(),
  check: LinkCheck.optional(),
})

export const ReferenceSchema = z.object({
  type: z.enum(REFERENCE_TYPES),
  title: z.string().min(1),
  url: httpUrl,
  note: z.string().optional(),
  check: LinkCheck.optional(),
})

export const ImageSchema = z.object({
  /** Display-size image (≈1280px wide thumbnail from the provider). */
  url: httpUrl,
  /** Small grid thumbnail (≈480px). */
  thumb: httpUrl.optional(),
  /** Original full-resolution file. */
  full: httpUrl.optional(),
  /** Human page for the object/file (Commons file page, museum object page). */
  pageUrl: httpUrl.optional(),
  caption: z.string(),
  /** Provider: "Wikimedia Commons", "The Met", "Art Institute of Chicago"… */
  source: z.string(),
  artist: z.string().optional(),
  date: z.string().optional(),
  license: z.string().optional(),
  licenseUrl: httpUrl.optional(),
  width: z.union([z.string(), z.number()]),
  height: z.union([z.string(), z.number()]),
  check: LinkCheck.optional(),
})

export const AudioSchema = z.object({
  url: httpUrl,
  title: z.string(),
  pageUrl: httpUrl,
  source: z.string(),
  mime: z.string(),
  duration: z.number().optional(),
  artist: z.string().optional(),
  license: z.string().optional(),
  licenseUrl: httpUrl.optional(),
})

const strRecord = z.record(z.string(), z.string())
const numRecord = z.record(z.string(), z.number().min(0).max(100))

export const AestheticSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case ascii'),
  name: z.string().min(2),
  aliases: z.array(z.string()),
  category: z.enum(CATEGORIES),
  subcategory: z.string(),
  establishment: z.enum(ESTABLISHMENTS),
  status: z.enum(STATUSES),
  confidence: z.number().int().min(0).max(100),
  origin: z.string(),
  geography: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  startYear: z.number().int().min(-50000).max(2100).nullable(),
  endYear: z.number().int().min(-50000).max(2100).nullable(),
  era: z.string(),
  summary: z.string(),
  description: z.string(),
  culturalContext: z.string(),
  visualDNA: strRecord,
  colors: z.array(ColorSchema),
  /** "curated" = chosen by editors; "derived" = extracted from the record's images (scripts/data/palette.ts). */
  paletteSource: z.enum(['curated', 'derived']).optional(),
  typography: strRecord,
  materials: z.array(z.string()),
  textures: z.array(z.string()),
  lighting: strRecord,
  photography: strRecord,
  architecture: strRecord,
  fashion: strRecord,
  objects: z.array(z.string()),
  environment: strRecord,
  graphicDesign: strRecord,
  uiTranslation: strRecord,
  recipe: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  emotionProfile: numRecord,
  dnaAxes: numRecord,
  keyExamples: z.array(z.string()),
  sounds: z.array(z.string()),
  sources: z.array(SourceSchema),
  images: z.array(ImageSchema),
  references: z.array(ReferenceSchema),
  /** Freely licensed recordings related to the aesthetic (music, ambience, performance). */
  audio: z.array(AudioSchema).optional(),
  typePairing: strRecord,
  tags: z.array(z.string()),
  /** Wikidata item id (e.g. "Q40415") when the aesthetic maps to one. */
  wikidata: z.string().regex(/^Q\d+$/).nullable().optional(),
  /** Canonical English Wikipedia article title, verified to exist. */
  wikipedia: z.string().nullable().optional(),
  popularity: z.number().int().min(0).max(100),
  isNiche: z.boolean(),
  dataQuality: z.enum(DATA_QUALITIES),
  verifiedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const RelationSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(RELATION_TYPES),
  note: z.string(),
})

export type AestheticRecord = z.infer<typeof AestheticSchema>
export type RelationRecord = z.infer<typeof RelationSchema>
export type ImageRecord = z.infer<typeof ImageSchema>
export type ReferenceRecord = z.infer<typeof ReferenceSchema>
export type SourceRecord = z.infer<typeof SourceSchema>

/** Fields stored as JSON strings in Parquet/CSV (nested values). */
export const NESTED_FIELDS = [
  'aliases',
  'visualDNA',
  'colors',
  'typography',
  'materials',
  'textures',
  'lighting',
  'photography',
  'architecture',
  'fashion',
  'objects',
  'environment',
  'graphicDesign',
  'uiTranslation',
  'recipe',
  'emotionProfile',
  'dnaAxes',
  'keyExamples',
  'sounds',
  'sources',
  'images',
  'references',
  'audio',
  'typePairing',
  'tags',
] as const
