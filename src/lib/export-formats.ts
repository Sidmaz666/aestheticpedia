// Export formats offered for every aesthetic (client-safe: no renderers here).
export interface ExportFormat {
  id: string
  label: string
  ext: string
  mime: string
  group: 'Document' | 'Data' | 'Design' | 'Code' | 'Apps' | 'Citation'
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
  { id: 'shadcn', label: 'shadcn/ui theme (CSS)', ext: 'css', mime: 'text/css; charset=utf-8', group: 'Code', description: ':root/.dark variables for globals.css' },
  { id: 'shadcn-json', label: 'shadcn/ui registry theme', ext: 'json', mime: 'application/json; charset=utf-8', group: 'Code', description: 'registry:theme item (npx shadcn add)' },
  { id: 'tailwind3', label: 'Tailwind v3 config', ext: 'js', mime: 'text/javascript; charset=utf-8', group: 'Code', description: 'tailwind.config.js theme.extend' },
  { id: 'daisyui', label: 'daisyUI theme', ext: 'css', mime: 'text/css; charset=utf-8', group: 'Code', description: 'daisyUI 5 @plugin theme' },
  { id: 'mui', label: 'MUI theme', ext: 'ts', mime: 'text/javascript; charset=utf-8', group: 'Code', description: 'Material UI createTheme()' },
  { id: 'chakra', label: 'Chakra UI system', ext: 'ts', mime: 'text/javascript; charset=utf-8', group: 'Code', description: 'Chakra v3 createSystem()' },
  { id: 'bootstrap', label: 'Bootstrap Sass', ext: 'scss', mime: 'text/x-scss; charset=utf-8', group: 'Code', description: 'Bootstrap 5 variable overrides' },
  { id: 'less', label: 'Less variables', ext: 'less', mime: 'text/plain; charset=utf-8', group: 'Code', description: 'Palette and fonts for Less' },
  { id: 'stylus', label: 'Stylus variables', ext: 'styl', mime: 'text/plain; charset=utf-8', group: 'Code', description: 'Palette and fonts for Stylus' },
  { id: 'theme-ts', label: 'TypeScript theme', ext: 'ts', mime: 'text/javascript; charset=utf-8', group: 'Code', description: 'styled-components, Emotion, React Native' },
  { id: 'style-dictionary', label: 'Style Dictionary', ext: 'json', mime: 'application/json; charset=utf-8', group: 'Design', description: 'Amazon Style Dictionary source tokens' },
  { id: 'tokens-studio', label: 'Tokens Studio (Figma)', ext: 'json', mime: 'application/json; charset=utf-8', group: 'Design', description: 'Import into Tokens Studio for Figma' },
  { id: 'colors-json', label: 'Colour values', ext: 'json', mime: 'application/json; charset=utf-8', group: 'Design', description: 'HEX, RGB, HSL, OKLCH and CMYK per colour' },
  { id: 'sketch', label: 'Sketch palette', ext: 'sketchpalette', mime: 'application/json; charset=utf-8', group: 'Design', description: 'Sketch Palettes plugin' },
  { id: 'procreate', label: 'Procreate swatches', ext: 'swatches', mime: 'application/zip', group: 'Design', description: 'Tap to import on iPad' },
  { id: 'aco', label: 'Photoshop swatches', ext: 'aco', mime: 'application/octet-stream', group: 'Design', description: 'Photoshop colour swatches (.aco)' },
  { id: 'paintnet', label: 'Paint.NET palette', ext: 'txt', mime: 'text/plain; charset=utf-8', group: 'Design', description: 'Paint.NET palette file' },
  { id: 'android', label: 'Android colors.xml', ext: 'xml', mime: 'application/xml; charset=utf-8', group: 'Apps', description: 'res/values/colors.xml' },
  { id: 'swiftui', label: 'SwiftUI colours', ext: 'swift', mime: 'text/plain; charset=utf-8', group: 'Apps', description: 'Color extension for iOS / macOS' },
  { id: 'flutter', label: 'Flutter theme', ext: 'dart', mime: 'text/plain; charset=utf-8', group: 'Apps', description: 'ThemeData + ColorScheme' },
  { id: 'compose', label: 'Jetpack Compose', ext: 'kt', mime: 'text/plain; charset=utf-8', group: 'Apps', description: 'Material 3 colour scheme' },
  { id: 'bib', label: 'BibTeX', ext: 'bib', mime: 'application/x-bibtex; charset=utf-8', group: 'Citation', description: 'Citation for LaTeX / Zotero' },
  { id: 'ris', label: 'RIS', ext: 'ris', mime: 'application/x-research-info-systems; charset=utf-8', group: 'Citation', description: 'Citation for EndNote / Mendeley' },
]
