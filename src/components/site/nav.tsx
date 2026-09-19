// Shared by the (client) header and the (server) footer.
import { SITE_NAME } from '@/lib/site'
export const NAV = [
  { href: '/aesthetics', label: 'Browse' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/connections', label: 'Connections' },
  { href: '/colors', label: 'Colours' },
  { href: '/discover', label: 'Discover' },
  { href: '/blend', label: 'Blend' },
  { href: '/data', label: 'Data & API' },
  { href: '/about', label: 'About' },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Brand mark (public/brand, built by scripts/brand/make-icons.mjs): strokes take the current
          text colour so the mark contrasts on every aesthetic's theme; the aperture stays gold. */}
      <span className="relative size-7 shrink-0" aria-hidden>
        <span className="absolute inset-0 bg-current [mask:url(/brand/logo-mask-strokes.png)_center/contain_no-repeat]" />
        <span className="absolute inset-0 bg-[#b08d3c] [mask:url(/brand/logo-mask-gold.png)_center/contain_no-repeat]" />
      </span>
      <span className="display text-[1.3rem] leading-none tracking-tight sm:text-[1.45rem]">{SITE_NAME}</span>
    </span>
  )
}
