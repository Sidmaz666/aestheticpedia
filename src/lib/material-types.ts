// Client-safe material glossary types (the loader lives in src/lib/materials.ts).
export interface MaterialEntry {
  title: string
  url: string
  image: { thumb: string; pageUrl: string; license: string; artist?: string } | null
  extract: string
}
export interface MaterialItem {
  term: string
  entry: MaterialEntry | null
}
/** Material photos for a record's materials and textures, resolved on the server. */
export interface ResolvedMaterials {
  materials: MaterialItem[]
  textures: MaterialItem[]
}
