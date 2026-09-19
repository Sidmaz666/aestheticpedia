// Build the site's icons and logos from the master logo (scripts/brand/logo-master.png).
//   node scripts/brand/make-icons.mjs
// Outputs: src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico,
//          public/brand/logo.png (original colours, for light theme),
//          public/brand/logo-on-dark.png (slate recoloured to the light text colour).
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const sharp = createRequire(import.meta.url)('sharp')
const ROOT = path.resolve(import.meta.dirname, '../..')
const MASTER = path.join(ROOT, 'scripts/brand/logo-master.png')
const CREAM = { r: 246, g: 244, b: 239, alpha: 1 } // --bg (light theme)
const ON_DARK = [243, 240, 234] // --fg (dark theme)

// Trim transparent margins, then centre on a square transparent canvas.
const trimmed = await sharp(MASTER).trim().png().toBuffer()
const meta = await sharp(trimmed).metadata()
const side = Math.max(meta.width, meta.height)
const square = await sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: trimmed, gravity: 'center' }])
  .png()
  .toBuffer()

// Dark-theme variant: slate/near-neutral pixels → light text colour; gold stays gold.
async function onDark(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const chroma = Math.max(r, g, b) - Math.min(r, g, b)
    const isGold = r > g && g > b && chroma > 40
    if (!isGold) [data[i], data[i + 1], data[i + 2]] = ON_DARK
  }
  return sharp(data, { raw: info }).png().toBuffer()
}

const plate = async (size, pad, radius) => {
  const inner = Math.round(size * (1 - pad * 2))
  const logo = await sharp(square).resize(inner, inner).png().toBuffer()
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`)
  const bg = await sharp({ create: { width: size, height: size, channels: 4, background: CREAM } }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
  return sharp(bg).composite([{ input: logo, gravity: 'center' }]).png().toBuffer()
}

mkdirSync(path.join(ROOT, 'public/brand'), { recursive: true })
await sharp(square).resize(512, 512).png({ palette: true, quality: 92, compressionLevel: 9 }).toFile(path.join(ROOT, 'src/app/icon.png'))
await sharp(await plate(180, 0.1, 0)).png({ palette: true, quality: 92, compressionLevel: 9 }).toFile(path.join(ROOT, 'src/app/apple-icon.png'))
await sharp(square).resize(256, 256).png({ palette: true, quality: 92, compressionLevel: 9 }).toFile(path.join(ROOT, 'public/brand/logo.png'))
await sharp(await onDark(await sharp(square).resize(256, 256).png().toBuffer())).png({ palette: true, quality: 92, compressionLevel: 9 }).toFile(path.join(ROOT, 'public/brand/logo-on-dark.png'))

// favicon.ico: transparent PNG-encoded 16, 32 and 48 px images (supported by every current browser).
const sizes = [16, 32, 48]
// Transparent, like the mark itself (no background plate).
const pngs = await Promise.all(sizes.map((s) => sharp(square).resize(s, s).png().toBuffer()))
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
const dir = Buffer.alloc(16 * sizes.length)
let offset = 6 + dir.length
sizes.forEach((s, i) => {
  const e = i * 16
  dir.writeUInt8(s, e)
  dir.writeUInt8(s, e + 1)
  dir.writeUInt8(0, e + 2)
  dir.writeUInt8(0, e + 3)
  dir.writeUInt16LE(1, e + 4)
  dir.writeUInt16LE(32, e + 6)
  dir.writeUInt32LE(pngs[i].length, e + 8)
  dir.writeUInt32LE(offset, e + 12)
  offset += pngs[i].length
})
writeFileSync(path.join(ROOT, 'src/app/favicon.ico'), Buffer.concat([header, dir, ...pngs]))
console.log('✓ icons and logos written')

// Theme-adaptive header logo: two alpha masks, painted with CSS (strokes = current text
// colour, aperture = brand gold), so the logo contrasts on every aesthetic's theme.
{
  const { data, info } = await sharp(square).resize(128, 128).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const strokes = Buffer.from(data)
  const gold = Buffer.from(data)
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
    const isGold = r > g && g > b && Math.max(r, g, b) - Math.min(r, g, b) > 40
    for (const [buf, keep] of [[strokes, !isGold], [gold, isGold]]) {
      buf[i] = buf[i + 1] = buf[i + 2] = 0
      buf[i + 3] = keep ? a : 0
    }
  }
  await sharp(strokes, { raw: info }).png({ compressionLevel: 9 }).toFile(path.join(ROOT, 'public/brand/logo-mask-strokes.png'))
  await sharp(gold, { raw: info }).png({ compressionLevel: 9 }).toFile(path.join(ROOT, 'public/brand/logo-mask-gold.png'))
}
console.log('✓ logo masks written')
