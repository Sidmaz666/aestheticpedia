// Materials & textures with real photographs from the matched Wikipedia article (server component).
import { lookupMaterials } from '@/lib/materials'

export function MaterialGallery({ title, terms }: { title: string; terms: string[] }) {
  if (!terms.length) return null
  const items = lookupMaterials(terms)
  const withPhoto = items.filter((i) => i.entry?.image)
  const rest = items.filter((i) => !i.entry?.image)
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      {withPhoto.length > 0 && (
        <ul data-reveal-group className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {withPhoto.map(({ term, entry }) => (
            <li key={term}>
              <a href={entry!.url} target="_blank" rel="noopener noreferrer" className="group block" title={entry!.extract}>
                <span className="block aspect-square overflow-hidden rounded-xl bg-surface-2 ring-1 ring-inset ring-line">
                  <img
                    src={entry!.image!.thumb}
                    alt={entry!.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </span>
                <span className="mt-1.5 block text-sm capitalize leading-tight text-fg group-hover:text-accent">{term}</span>
                {entry!.title.toLowerCase() !== term.toLowerCase() && (
                  <span className="block text-[11px] text-fg-subtle">Shown: {entry!.title}</span>
                )}
                <span className="block truncate text-[10px] text-fg-subtle/80">
                  {[entry!.image!.artist, entry!.image!.license].filter(Boolean).join(' · ')}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {rest.length > 0 && (
        <ul className={`flex flex-wrap gap-1.5 ${withPhoto.length ? 'mt-4' : ''}`}>
          {rest.map(({ term, entry }) => (
            <li key={term}>
              {entry ? (
                <a href={entry.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-line-strong px-3 py-1 text-sm text-fg-muted hover:text-fg">
                  {term}
                </a>
              ) : (
                <span className="inline-block rounded-full border border-line px-3 py-1 text-sm text-fg-muted">{term}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
