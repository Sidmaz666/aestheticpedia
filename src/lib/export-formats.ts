// Export formats offered for every aesthetic (client-safe: no renderers here).
export interface ExportFormat {
  id: string
  label: string
  ext: string
  mime: string
  group: 'Document' | 'Data' | 'Design' | 'Citation'
  description: string
}

export const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'md', label: 'Markdown', ext: 'md', mime: 'text/markdown; charset=utf-8', group: 'Document', description: 'Full article for notes, wikis and LLM context' },
  { id: 'txt', label: 'Plain text', ext: 'txt', mime: 'text/plain; charset=utf-8', group: 'Document', description: 'Unformatted article text' },
  { id: 'html', label: 'HTML', ext: 'html', mime: 'text/html; charset=utf-8', group: 'Document', description: 'Standalone, printable HTML page' },
  { id: 'json', label: 'JSON', ext: 'json', mime: 'application/json; charset=utf-8', group: 'Data', description: 'Complete record in the canonical schema' },
  { id: 'jsonld', label: 'JSON-LD', ext: 'jsonld', mime: 'application/ld+json; charset=utf-8', group: 'Data', description: 'schema.org linked data' },
  { id: 'yaml', label: 'YAML', ext: 'yaml', mime: 'application/yaml; charset=utf-8', group: 'Data', description: 'Complete record as YAML' },
  { id: 'csv', label: 'CSV', ext: 'csv', mime: 'text/csv; charset=utf-8', group: 'Data', description: 'One-row table, nested fields as JSON' },
  { id: 'css', label: 'CSS variables', ext: 'css', mime: 'text/css; charset=utf-8', group: 'Design', description: 'Palette + fonts as custom properties' },
  { id: 'scss', label: 'SCSS', ext: 'scss', mime: 'text/x-scss; charset=utf-8', group: 'Design', description: 'Sass variables and palette map' },
  { id: 'tailwind', label: 'Tailwind theme', ext: 'css', mime: 'text/css; charset=utf-8', group: 'Design', description: 'Tailwind v4 @theme block' },
  { id: 'tokens', label: 'Design tokens', ext: 'tokens.json', mime: 'application/json; charset=utf-8', group: 'Design', description: 'W3C Design Tokens (Figma, Style Dictionary)' },
  { id: 'gpl', label: 'GIMP / Inkscape palette', ext: 'gpl', mime: 'text/plain; charset=utf-8', group: 'Design', description: 'GIMP, Inkscape, Krita palette' },
  { id: 'ase', label: 'Adobe swatches', ext: 'ase', mime: 'application/octet-stream', group: 'Design', description: 'Photoshop / Illustrator swatch exchange' },
  { id: 'svg', label: 'Palette SVG', ext: 'svg', mime: 'image/svg+xml; charset=utf-8', group: 'Design', description: 'Labelled swatch card' },
  { id: 'bib', label: 'BibTeX', ext: 'bib', mime: 'application/x-bibtex; charset=utf-8', group: 'Citation', description: 'Citation for LaTeX / Zotero' },
  { id: 'ris', label: 'RIS', ext: 'ris', mime: 'application/x-research-info-systems; charset=utf-8', group: 'Citation', description: 'Citation for EndNote / Mendeley' },
]
