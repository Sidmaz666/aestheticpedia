// Shared by the (client) header and the (server) footer.
export const NAV = [
  { href: '/aesthetics', label: 'Browse' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/discover', label: 'Discover' },
  { href: '/blend', label: 'Blend' },
  { href: '/data', label: 'Data & API' },
  { href: '/about', label: 'About' },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5 translate-y-[3px] text-accent" aria-hidden>
        <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3.5 19 20H5z" fill="currentColor" opacity=".9" />
      </svg>
      <span className="display text-[1.45rem] leading-none tracking-tight">Aestheticpedia</span>
    </span>
  )
}
