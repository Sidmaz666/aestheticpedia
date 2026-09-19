/** The site's loading mark: the brand aperture with an orbiting ring, over a soft shimmer. */
export function VaultLoader({ label = 'Opening the vault…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-5">
      <span className="relative grid size-20 place-items-center" aria-hidden>
        <span className="vault-orbit absolute inset-0 rounded-full border border-line" />
        <span className="vault-orbit absolute inset-0 rounded-full border-2 border-transparent border-t-accent" />
        <span className="relative size-10 animate-pulse">
          <span className="absolute inset-0 bg-fg [mask:url(/brand/logo-mask-strokes.png)_center/contain_no-repeat]" />
          <span className="absolute inset-0 bg-[#b08d3c] [mask:url(/brand/logo-mask-gold.png)_center/contain_no-repeat]" />
        </span>
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">{label}</span>
    </div>
  )
}
