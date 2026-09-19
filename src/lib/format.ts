// Counts shown to people: 4.7k+, 27.1k+, 1.2M+. Rounded down (never overstated) and marked
// with "+" when rounding dropped anything; below 1,000 the exact number is shown.
// Machine outputs (API, llms.txt, exports) keep exact numbers.
export function compact(n: number): string {
  if (!Number.isFinite(n)) return ''
  const abs = Math.abs(n)
  const [div, unit] = abs >= 1e9 ? [1e9, 'B'] : abs >= 1e6 ? [1e6, 'M'] : abs >= 1e3 ? [1e3, 'k'] : [1, '']
  if (div === 1) return String(Math.round(n))
  const scaled = abs / div
  const v = scaled >= 100 ? Math.floor(scaled) : Math.floor(scaled * 10) / 10
  const text = v.toFixed(scaled >= 100 ? 0 : 1).replace(/\.0$/, '')
  return `${n < 0 ? '-' : ''}${text}${unit}${v * div < abs ? '+' : ''}`
}

/** The exact figure, for a title/aria-label next to a compact one. */
export const exact = (n: number) => n.toLocaleString('en')
