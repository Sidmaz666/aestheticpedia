// Colour words the agent understands, mapped to a representative sRGB hex. CSS named
// colours plus common design vocabulary (ochre, terracotta, sage…).
export const COLOR_WORDS: Record<string, string> = {
  black: '#000000', white: '#ffffff', grey: '#808080', gray: '#808080', silver: '#c0c0c0', charcoal: '#36454f',
  red: '#d32f2f', crimson: '#dc143c', scarlet: '#ff2400', burgundy: '#800020', maroon: '#800000', wine: '#722f37', ruby: '#9b111e',
  pink: '#ffc0cb', 'hot pink': '#ff69b4', magenta: '#ff00ff', fuchsia: '#ff00ff', blush: '#de5d83', rose: '#ff007f', salmon: '#fa8072', coral: '#ff7f50',
  orange: '#ffa500', peach: '#ffcba4', apricot: '#fbceb1', rust: '#b7410e', terracotta: '#e2725b', copper: '#b87333', amber: '#ffbf00',
  yellow: '#ffeb3b', gold: '#d4af37', golden: '#d4af37', mustard: '#e1ad01', ochre: '#cc7722', lemon: '#fff44f', cream: '#fffdd0', ivory: '#fffff0',
  beige: '#f5f5dc', tan: '#d2b48c', khaki: '#c3b091', sand: '#c2b280', camel: '#c19a6b', brown: '#8b4513', chocolate: '#7b3f00', sepia: '#704214', bronze: '#cd7f32',
  green: '#2e7d32', lime: '#32cd32', olive: '#808000', sage: '#9caf88', mint: '#98ff98', emerald: '#50c878', jade: '#00a86b', forest: '#228b22', 'forest green': '#228b22', moss: '#8a9a5b', chartreuse: '#7fff00',
  teal: '#008080', turquoise: '#40e0d0', aqua: '#00ffff', cyan: '#00ffff', aquamarine: '#7fffd4',
  blue: '#1e88e5', navy: '#000080', 'navy blue': '#000080', cobalt: '#0047ab', azure: '#007fff', 'sky blue': '#87ceeb', 'baby blue': '#89cff0', indigo: '#4b0082', sapphire: '#0f52ba', ultramarine: '#3f00ff', denim: '#1560bd', prussian: '#003153',
  purple: '#800080', violet: '#8f00ff', lavender: '#b57edc', lilac: '#c8a2c8', mauve: '#e0b0ff', plum: '#8e4585', amethyst: '#9966cc', periwinkle: '#ccccff',
  neon: '#39ff14', 'neon green': '#39ff14', 'neon pink': '#ff6ec7', pastel: '#ffd1dc',
}

/** Resolve a colour word or hex code to a 6-digit hex (without #), or null. */
export function colorToHex(s: string): string | null {
  const t = s.trim().toLowerCase()
  const hex = /#?([0-9a-f]{6}|[0-9a-f]{3})\b/.exec(t)?.[1]
  if (hex && (t.startsWith('#') || /^[0-9a-f]{6}$/.test(t))) return hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  const word = t.replace(/^(the )?colou?r /, '').replace(/ colou?r$/, '')
  if (COLOR_WORDS[word]) return COLOR_WORDS[word].slice(1)
  // "dusty rose", "deep teal": use the last colour word.
  const last = Object.keys(COLOR_WORDS)
    .filter((w) => new RegExp(`\\b${w}\\b`).test(word))
    .sort((a, b) => b.length - a.length)[0]
  return last ? COLOR_WORDS[last].slice(1) : null
}
