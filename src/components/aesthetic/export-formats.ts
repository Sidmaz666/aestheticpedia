// Client-safe copy of the export format list (grouped for menus).
import { EXPORT_FORMATS } from '@/lib/export-formats'

const GROUPS = ['Design', 'Code', 'Apps', 'Document', 'Data', 'Citation'] as const

export const EXPORT_GROUPS = GROUPS.map((group) => ({
  group,
  formats: EXPORT_FORMATS.filter((f) => f.group === group),
}))
