'use client'

/**
 * ShaderLab — real-time 3D material study rendered with WebGL shaders.
 *
 * Each aesthetic's texture vocabulary drives a procedural GLSL material
 * (wood, marble, brushed metal, hammered metal, rust, cloth, velvet,
 * ceramic crackle, leather, gloss plastic, CRT phosphor, water, holographic
 * foil, fur, concrete, terrazzo, ice, paper, glass, neon fog) plus eight
 * world-cultural craft materials (batik wax-resist, tie-dye, block print,
 * zellige tilework, filigree, beadwork, embroidery, marquetry inlay) lit with
 * Blinn-Phong + fresnel and bump-mapped from a per-material height field.
 * Palette, seed and roughness come from the entry's own data — nothing random.
 *
 * Falls back to a static notice when WebGL is unavailable, and respects
 * prefers-reduced-motion (auto-rotation disabled; animation time frozen).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Gauge, Maximize2, Minimize2, MousePointer2, RotateCcw } from 'lucide-react'
import type { AestheticFull, ColorEntry } from '@/lib/aesthetic'

/* ----------------------------- palette utils ----------------------------- */

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function toVec(hex: string): [number, number, number] {
  const rgb = hexToRgb(hex) ?? [137, 109, 59]
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0.5
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  if (!ca || !cb) return a
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function sortByLum(colors: ColorEntry[]): ColorEntry[] {
  return [...colors].sort((a, b) => luminance(b.hex) - luminance(a.hex))
}

/** Deterministic per-entry seed. */
function seedFrom(slug: string): number {
  let h = 2166136261
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 9973
}

/* ----------------------------- material routing ----------------------------- */

export type MaterialId =
  | 'wood' | 'marble' | 'brushed' | 'hammered' | 'rust' | 'cloth' | 'velvet'
  | 'ceramic' | 'leather' | 'plastic' | 'crt' | 'water' | 'holo' | 'fur'
  | 'concrete' | 'terrazzo' | 'ice' | 'paper' | 'glass' | 'neon'
  | 'wax-resist' | 'tie-dye' | 'blockprint' | 'tilework' | 'filigree'
  | 'beadwork' | 'embroidery' | 'inlay'

export const MATERIAL_ORDER: MaterialId[] = [
  'wood', 'marble', 'brushed', 'hammered', 'rust', 'cloth', 'velvet', 'ceramic',
  'leather', 'plastic', 'crt', 'water', 'holo', 'fur', 'concrete', 'terrazzo',
  'ice', 'paper', 'glass', 'neon',
  'wax-resist', 'tie-dye', 'blockprint', 'tilework', 'filigree', 'beadwork',
  'embroidery', 'inlay',
]

const MATERIAL_LABELS: Record<MaterialId, string> = {
  wood: 'Wood grain', marble: 'Marble', brushed: 'Brushed metal', hammered: 'Hammered metal',
  rust: 'Rust & patina', cloth: 'Woven cloth', velvet: 'Velvet', ceramic: 'Ceramic glaze',
  leather: 'Leather', plastic: 'Gloss plastic', crt: 'CRT phosphor', water: 'Water',
  holo: 'Holographic', fur: 'Fur', concrete: 'Concrete', terrazzo: 'Terrazzo',
  ice: 'Ice', paper: 'Paper', glass: 'Glass', neon: 'Neon fog',
  'wax-resist': 'Wax-resist batik', 'tie-dye': 'Tie-dye', blockprint: 'Block print',
  tilework: 'Zellige tilework', filigree: 'Filigree', beadwork: 'Beadwork',
  embroidery: 'Embroidery', inlay: 'Marquetry inlay',
}

/** Map texture keywords → shader material ids (deterministic, data-driven). */
export function materialsFor(a: AestheticFull): MaterialId[] {
  const blob = [a.textures.join(' '), a.materials.join(' '), a.category, a.name, a.visualDNA.texture ?? ''].join(' ').toLowerCase()
  const found: MaterialId[] = []
  const add = (m: MaterialId, re: RegExp) => {
    if (re.test(blob) && !found.includes(m)) found.push(m)
  }
  add('wood', /wood|timber|oak|walnut|bamboo|plank|bark|driftwood|cedar|maple|shou sugi/)
  add('marble', /marble|stone|granite|travertine|onyx|alabaster|porphyry|slate|basalt/)
  add('brushed', /brushed|steel|alumin|chrome|titanium|nickel|metal|silver|stainless/)
  add('hammered', /hammer|forged|cast iron|rivet|pewter|wrought/)
  add('rust', /rust|corrode|tarnish|patina|weather|corten|verdigris|oxidiz/)
  add('cloth', /linen|weave|woven|fabric|textile|canvas|tweed|denim|ikat|burlap|herringbone|tartan|plaid|boucl/)
  add('velvet', /velvet|plush|suede|chenille|fleece|velour/)
  add('ceramic', /ceramic|porcelain|glaze|celadon|raku|delft|majolica|faience|stoneware|earthenware|lacquer/)
  add('leather', /leather|hide|cordovan|vachetta/)
  add('plastic', /plastic|vinyl|bakelite|lucite|acrylic|resin|enamel|melamine/)
  add('crt', /crt|vhs|scanline|phosphor|pixel|screen|terminal|arcade|monitor|television|video|tape|glitch|digital/)
  add('water', /water|liquid|ripple|wave|ocean|rain|river|fountain|pool/)
  add('holo', /holograph|iridescent|opalescen|nacre|pearl|foil|dichroic|oil slick|laser/)
  add('fur', /fur|wool|mohair|hair|feather|shearling|shag/)
  add('concrete', /concrete|cement|brutalis|plaster|stucco|limewash|rammed earth|adobe|brick/)
  add('terrazzo', /terrazzo|mosaic|tile|confetti|aggregate/)
  add('ice', /ice|frost|glacier|snow|crystal|icicle|permafrost/)
  add('paper', /paper|parchment|newsprint|kraft|cardboard|washi|fibrous|papyrus/)
  add('glass', /glass|crystal|transparen|translucen|vitrine|mirror/)
  add('neon', /neon|glow|fluoresc|signage|night city|cyber/)
  // world cultural / craft traditions (appended so existing chip order never regresses)
  add('wax-resist', /batik|wax[- ]?resist/)
  add('tie-dye', /tie[ &-]?dye|shibori|bandhani|plangi|tritik/)
  add('blockprint', /block[ -]?print|woodblock|stamp/)
  add('tilework', /zellige|girih|azulejo|mosaic|\btile\b|\btiled\b|\btiling\b|\btilework\b/)
  add('filigree', /filigree|filigran|wirework|twisted wire/)
  add('beadwork', /bead|seed pearl/)
  add('embroidery', /embroider|stitch|needlework|kantha|sashiko|phulkari|crewel/)
  add('inlay', /marquetry|intarsia|inlay|inlaid|parquet|veneer/)
  if (found.length === 0) {
    if (/Texture|Material|Surface/i.test(a.category)) return ['brushed', 'concrete', 'wood', 'marble', 'plastic']
    if (/Internet|Web|Game|Technology/i.test(a.category)) return ['crt', 'plastic', 'holo', 'neon', 'brushed']
    if (/Architect|Interior|Furniture/i.test(a.category)) return ['concrete', 'wood', 'marble', 'velvet', 'brushed']
    if (/Fashion|Textile|Subculture/i.test(a.category)) return ['cloth', 'leather', 'velvet', 'fur', 'denim' as MaterialId].slice(0, 5) as MaterialId[]
    return ['paper', 'velvet', 'wood', 'marble', 'cloth']
  }
  if (found.length < 2) found.push('brushed', 'velvet')
  return found.filter((m) => MATERIAL_ORDER.includes(m)).slice(0, 6)
}

/* ----------------------------- geometry ----------------------------- */

type GeoName = 'torus' | 'knot' | 'sphere'

interface GeoData {
  positions: Float32Array
  normals: Float32Array
  tangents: Float32Array
  bitangents: Float32Array
  uvs: Float32Array
  indices: Uint16Array
}

function buildGeometry(geo: GeoName): GeoData {
  const SEG = 110
  const RINGS = 52
  const positions: number[] = []
  const normals: number[] = []
  const tangents: number[] = []
  const bitangents: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const R = 1.0
  const r = geo === 'knot' ? 0.33 : 0.44
  const p = geo === 'knot' ? 2 : 1
  const q = geo === 'knot' ? 3 : 1
  const cross = (a: [number, number, number], b: [number, number, number]): [number, number, number] => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]

  // parametric centerline P(u, v), u,v in [0,1]
  const P = (u: number, v: number): [number, number, number] => {
    if (geo === 'sphere') {
      const phi = v * Math.PI
      const theta = u * Math.PI * 2
      return [Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)]
    }
    const tu = u * Math.PI * 2 * p
    if (geo === 'knot') {
      const rad = R + 0.5 * Math.cos(q * tu / p)
      return [rad * Math.cos(tu), 0.5 * Math.sin(q * tu / p), rad * Math.sin(tu)]
    }
    return [R * Math.cos(tu), 0, R * Math.sin(tu)]
  }

  const EPS = 1e-3
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG
    for (let j = 0; j <= RINGS; j++) {
      const v = j / RINGS
      const c = P(u, v)
      const pu = P(Math.min(1, u + EPS), v)
      let T: [number, number, number] = [pu[0] - c[0], pu[1] - c[1], pu[2] - c[2]]
      const tl = Math.hypot(...T) || 1
      T = [T[0] / tl, T[1] / tl, T[2] / tl]
      if (geo === 'sphere') {
        // true sphere: point, outward normal, tangent frame from theta/phi
        const n: [number, number, number] = [c[0], c[1], c[2]]
        const Bn = cross(T, n)
        positions.push(c[0], c[1], c[2])
        normals.push(n[0], n[1], n[2])
        tangents.push(T[0], T[1], T[2])
        bitangents.push(Bn[0], Bn[1], Bn[2])
        uvs.push(u * 3, v * 1.6)
        continue
      }
      // tube: offset from centerline by r * (cos v * N0 + sin v * B0)
      const tu = u * Math.PI * 2 * p
      let N0: [number, number, number]
      if (geo === 'knot') {
        N0 = [-Math.sin(tu) * 0.5, Math.cos(q * tu / p) * 0.5, Math.cos(tu) * 0.5]
      } else {
        N0 = [0, 1, 0]
      }
      const n0l = Math.hypot(...N0) || 1
      N0 = [N0[0] / n0l, N0[1] / n0l, N0[2] / n0l]
      const B0: [number, number, number] = [
        T[1] * N0[2] - T[2] * N0[1],
        T[2] * N0[0] - T[0] * N0[2],
        T[0] * N0[1] - T[1] * N0[0],
      ]
      const cosv = Math.cos(v * Math.PI * 2)
      const sinv = Math.sin(v * Math.PI * 2)
      const off: [number, number, number] = [
        c[0] + (N0[0] * cosv + B0[0] * sinv) * r,
        c[1] + (N0[1] * cosv + B0[1] * sinv) * r,
        c[2] + (N0[2] * cosv + B0[2] * sinv) * r,
      ]
      const nrm: [number, number, number] = [N0[0] * cosv + B0[0] * sinv, N0[1] * cosv + B0[1] * sinv, N0[2] * cosv + B0[2] * sinv]
      const nl = Math.hypot(...nrm) || 1
      positions.push(...off)
      normals.push(nrm[0] / nl, nrm[1] / nl, nrm[2] / nl)
      tangents.push(...T)
      bitangents.push(...B0)
      uvs.push(u * 6, v * 2)
    }
  }
  for (let i = 0; i < SEG; i++) {
    for (let j = 0; j < RINGS; j++) {
      const a = i * (RINGS + 1) + j
      const b = a + RINGS + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    bitangents: new Float32Array(bitangents),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  }
}

/* ----------------------------- shaders ----------------------------- */

const VERT = `
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aUv;
uniform mat4 uProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormalMat;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec2 vUv;
void main() {
  vec4 world = uModel * vec4(aPos, 1.0);
  vPos = world.xyz;
  vNormal = normalize(uNormalMat * aNormal);
  vTangent = normalize(uNormalMat * aTangent);
  vBitangent = normalize(uNormalMat * aBitangent);
  vUv = aUv;
  gl_Position = uProj * uView * world;
}
`

const FRAG_LIB = `
precision highp float;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec2 vUv;

uniform vec3 uColors[5];
uniform float uSeed;
uniform float uTime;
uniform int uMaterial;

vec2 uv0() { return vUv; }

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23 + uSeed * 0.017);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
vec2 hash2(vec2 p) { return vec2(hash(p), hash(p + 19.19)); }

// --- material height fields (uv space), also used for bump ---
float matHeight(vec2 uv) {
  if (uMaterial == 0) { // wood
    vec2 q = uv * vec2(1.2, 14.0);
    float w = fbm(q * 0.5) * 2.4;
    float rings = sin((q.y * 0.55 + w) * 6.2831);
    return rings * 0.5 + 0.5 + fbm(q * 3.0) * 0.12;
  }
  if (uMaterial == 1) { // marble veins
    float v = fbm(uv * 2.6);
    float veins = abs(sin((uv.x * 2.4 + uv.y * 1.4 + v * 4.6) * 3.1416));
    return 1.0 - veins;
  }
  if (uMaterial == 2) { // brushed metal
    return fbm(vec2(uv.x * 2.0, uv.y * 90.0)) * 0.7 + fbm(uv * 6.0) * 0.3;
  }
  if (uMaterial == 3) { // hammered dimples
    vec2 g = uv * 14.0;
    vec2 i = floor(g); vec2 f = fract(g) - 0.5;
    float d = length(f);
    return 1.0 - smoothstep(0.15, 0.55, d) + hash(i) * 0.1;
  }
  if (uMaterial == 4) { // rust blotches
    return fbm(uv * 3.2 + uSeed) * 0.75 + fbm(vec2(uv.x * 6.0, uv.y * 0.7)) * 0.25;
  }
  if (uMaterial == 5) { // cloth weave
    vec2 g = uv * vec2(120.0, 120.0);
    return sin(g.x) * sin(g.y) * 0.5 + 0.5 + fbm(uv * 8.0) * 0.25;
  }
  if (uMaterial == 6) { return fbm(uv * 5.0); } // velvet pile
  if (uMaterial == 7) { // ceramic crackle
    vec2 g = uv * 26.0;
    float cell = 1.0;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 c = hash2(floor(g) + o);
      cell = min(cell, length(o + c - fract(g)));
    }
    return smoothstep(0.0, 0.22, cell);
  }
  if (uMaterial == 8) { // leather grain
    return fbm(uv * 9.0) * 0.8 + noise(uv * 42.0) * 0.3;
  }
  if (uMaterial == 9) { return 0.5 + fbm(uv * 2.0) * 0.08; } // gloss plastic
  if (uMaterial == 10) { // crt phosphor (animated)
    float scan = sin(uv.y * 620.0) * 0.5 + 0.5;
    float tri = sin(uv.x * 900.0) * 0.5 + 0.5;
    float band = fract(uv.y * 1.6 + uTime * 0.09);
    float roll = smoothstep(0.0, 0.18, band) * smoothstep(0.5, 0.2, band);
    return scan * 0.4 + tri * 0.2 + roll * 0.7 + fbm(uv * 30.0 + uTime * 0.4) * 0.22;
  }
  if (uMaterial == 11) { // water ripples (animated)
    return fbm(uv * 7.0 + vec2(uTime * 0.16, -uTime * 0.11)) + sin((uv.x + uv.y) * 26.0 + uTime * 1.4) * 0.06;
  }
  if (uMaterial == 12) { return fbm(uv * 3.0 + uTime * 0.05) + fbm(uv * 11.0) * 0.5; } // holo foil
  if (uMaterial == 13) { // fur streaks
    return fbm(vec2(uv.x * 70.0, uv.y * 8.0)) * 0.8 + noise(uv * 160.0) * 0.2;
  }
  if (uMaterial == 14) { // concrete pores
    return fbm(uv * 5.0) * 0.7 + noise(uv * 60.0) * 0.3;
  }
  if (uMaterial == 15) { // terrazzo chips
    vec2 g = uv * 16.0;
    float d = 1.0;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 c = hash2(floor(g) + o);
      d = min(d, length(o + c - fract(g)));
    }
    return smoothstep(0.0, 0.4, d) * 0.9 + fbm(uv * 40.0) * 0.1;
  }
  if (uMaterial == 16) { // ice cracks
    vec2 g = uv * 12.0;
    float cell = 1.0;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 c = hash2(floor(g) + o);
      cell = min(cell, length(o + c - fract(g)));
    }
    return 1.0 - smoothstep(0.0, 0.14, cell) * 0.7;
  }
  if (uMaterial == 17) { return fbm(uv * 34.0) * 0.6 + noise(uv * 90.0) * 0.4; } // paper grain
  if (uMaterial == 18) { return 0.5; } // glass — smooth, fresnel carries it
  if (uMaterial == 19) return fbm(uv * 3.0 + uTime * 0.07); // neon fog
  if (uMaterial == 20) { // batik wax-resist: crackle veining + stamped motif
    vec2 g = uv * 9.0 + vec2(fbm(uv * 3.0), fbm(uv * 3.0 + 7.7)) * 1.6;
    float cell = 1.0;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 c = hash2(floor(g) + o);
      cell = min(cell, length(o + c - fract(g)));
    }
    float cracks = 1.0 - smoothstep(0.0, 0.12, cell);
    vec2 m = uv * 3.0;
    vec2 mid = floor(m);
    vec2 mf = fract(m) - 0.5;
    float pick = hash(mid + uSeed);
    float circle = 1.0 - smoothstep(0.16, 0.2, length(mf));
    float diamond = 1.0 - smoothstep(0.14, 0.18, abs(mf.x) + abs(mf.y));
    float motif = mix(circle, diamond, step(0.5, pick));
    float stamp = motif * step(0.3, hash(mid * 1.7 + uSeed * 0.13));
    float h = 0.55 + fbm(uv * 18.0) * 0.12;
    h = mix(h, 0.2, cracks);
    h = max(h, stamp * 0.92);
    return clamp(h, 0.0, 1.0);
  }
  if (uMaterial == 21) { // tie-dye: seeded radial bleeds with banding rings
    float acc = 0.0;
    for (int k = 0; k < 5; k++) {
      float fk = float(k);
      vec2 c = hash2(vec2(fk * 3.71 + 1.3, uSeed * 0.113 + fk * 0.817));
      vec2 d = uv * 0.5 - c;
      d -= floor(d + 0.5); // wrap to the nearest repeat so bleeds tile seamlessly
      float r = length(d);
      float rings = sin(r * 26.0 + fk * 1.9) * 0.5 + 0.5;
      acc += exp(-r * 9.0) * (0.4 + 0.6 * rings);
    }
    return clamp(acc + fbm(uv * 42.0) * 0.2, 0.0, 1.0);
  }
  if (uMaterial == 22) { // blockprint: jittered stamp grid, rough ink edges
    vec2 g = uv * 4.0;
    vec2 id = floor(g);
    vec2 p = fract(g) - 0.5 - (hash2(id + uSeed) - 0.5) * 0.16;
    float pick = hash(id * 1.31 + uSeed * 0.71);
    float box = max(abs(p.x), abs(p.y));
    float dia = abs(p.x) + abs(p.y);
    float disk = length(p);
    float shape = box;
    shape = mix(shape, dia, step(0.34, pick));
    shape = mix(shape, disk, step(0.67, pick));
    float rough = (fbm(g * 5.0 + id * 0.37) - 0.5) * 0.12;
    float stamp = 1.0 - smoothstep(0.28, 0.33, shape + rough);
    float coverage = 0.62 + fbm(uv * 26.0) * 0.55;
    return clamp(stamp * coverage, 0.0, 1.0);
  }
  if (uMaterial == 23) { // zellige: 8-pointed star tiles, interlaced straps, grout
    vec2 g = uv * 5.0;
    vec2 p = fract(g) - 0.5;
    vec2 pr = vec2(p.x * 0.7071 + p.y * 0.7071, -p.x * 0.7071 + p.y * 0.7071);
    float star = min(max(abs(p.x), abs(p.y)), max(abs(pr.x), abs(pr.y)));
    float strap = 1.0 - smoothstep(0.025, 0.055, abs(fract((g.x + g.y) * 0.25) - 0.5) * 2.0);
    float grout = 1.0 - smoothstep(0.0, 0.045, 0.5 - max(abs(p.x), abs(p.y)));
    float h = 0.35 + 0.6 * (1.0 - smoothstep(0.18, 0.23, star));
    h = max(h, strap * 0.85);
    return clamp(mix(h, 0.05, grout), 0.0, 1.0);
  }
  if (uMaterial == 24) { // filigree: two twisted sine threads, phase-shifted pairs
    float tw = uSeed * 0.05 + 1.1;
    float a1 = sin(uv.x * 34.0 + sin(uv.y * 13.0 + tw) * 2.2);
    float a2 = sin(uv.x * 34.0 + sin(uv.y * 13.0 + tw + 3.1416) * 2.2 + 3.1416);
    float b1 = sin(uv.y * 34.0 + sin(uv.x * 13.0 + tw + 0.9) * 2.2);
    float b2 = sin(uv.y * 34.0 + sin(uv.x * 13.0 + tw + 0.9 + 3.1416) * 2.2 + 3.1416);
    float rope = max(max(a1, a2), max(b1, b2) * 0.9);
    return clamp(rope * 0.45 + 0.5 + fbm(uv * 44.0) * 0.12, 0.0, 1.0);
  }
  if (uMaterial == 25) { // beadwork: packed bead domes over dark ground
    vec2 g = uv * 22.0;
    vec2 id = floor(g);
    vec2 p = fract(g) - 0.5 - (hash2(id + uSeed) - 0.5) * 0.12;
    float d = length(p) / 0.32;
    float dome = sqrt(max(0.0, 1.0 - d * d));
    return clamp(dome + hash(id * 2.9 + uSeed) * 0.05, 0.0, 1.0);
  }
  if (uMaterial == 26) { // embroidery: satin-stitch bands with stitch-row wave
    float row = uv.y * 6.0;
    float bandId = floor(row);
    float fRow = fract(row);
    float ang = hash(vec2(bandId, uSeed)) * 3.1416;
    float freq = 46.0 + hash(vec2(bandId + 7.3, uSeed)) * 34.0;
    float wave = sin(uv.x * 7.0 + bandId * 1.7) * 0.05;
    float phase = (uv.x + wave * 3.0) * cos(ang) + (fRow - 0.5) * sin(ang) * 6.0;
    float threads = sin(phase * freq) * 0.5 + 0.5;
    float band = smoothstep(0.5, 0.4, abs(fRow - 0.5) + abs(wave));
    return clamp(threads * band + fbm(uv * 30.0) * 0.08, 0.0, 1.0);
  }
  if (uMaterial == 27) { // marquetry: veneer bands, stringing, diamond inlays
    float warp = fbm(uv * 2.4) * 0.6;
    float s = (uv.x + uv.y + warp) * 1.4;
    float fs = fract(s);
    float stringing = 1.0 - smoothstep(0.012, 0.032, min(fs, 1.0 - fs));
    vec2 g = uv * 3.0;
    vec2 id = floor(g);
    vec2 p = fract(g) - 0.5;
    float diamond = (1.0 - smoothstep(0.13, 0.17, abs(p.x) + abs(p.y))) * step(0.72, hash(id + uSeed));
    float bandH = 0.45 + hash(vec2(floor(s), 1.7)) * 0.35;
    float h = max(bandH, stringing * 0.95);
    h = mix(h, 0.22, diamond);
    return clamp(h + fbm(uv * 24.0) * 0.06, 0.0, 1.0);
  }
  return fbm(uv * 3.0 + uTime * 0.07);
}

float bumpScaleFor() {
  if (uMaterial == 9 || uMaterial == 18) return 0.0;
  if (uMaterial == 10) return 0.05;
  if (uMaterial == 21) return 0.08;
  if (uMaterial == 22) return 0.1;
  if (uMaterial == 5) return 0.12;
  if (uMaterial == 27) return 0.14;
  if (uMaterial == 0) return 0.16;
  if (uMaterial == 20) return 0.18;
  if (uMaterial == 26) return 0.24;
  if (uMaterial == 24) return 0.26;
  if (uMaterial == 25) return 0.3;
  return 0.22;
}

// --- material base albedo & finish ---
void matSurface(out vec3 albedo, out float spec, out float shin, out float metal, out float emissive) {
  spec = 0.35; shin = 32.0; metal = 0.0; emissive = 0.0;
  if (uMaterial == 0) {
    float heart = smoothstep(0.25, 0.85, matHeight(uv0()));
    albedo = mix(uColors[0], uColors[1], heart);
    albedo = mix(albedo, uColors[2], fbm(uv0() * 22.0) * 0.22);
    spec = 0.18; shin = 14.0;
  } else if (uMaterial == 1) {
    float vein = 1.0 - matHeight(uv0());
    albedo = mix(uColors[0], uColors[1], fbm(uv0() * 1.6) * 0.5);
    albedo = mix(albedo, uColors[2], smoothstep(0.55, 0.95, vein));
    spec = 0.7; shin = 60.0;
  } else if (uMaterial == 2) {
    albedo = mix(uColors[0], uColors[1], matHeight(uv0()));
    spec = 0.9; shin = 90.0; metal = 0.85;
  } else if (uMaterial == 3) {
    albedo = mix(uColors[0], uColors[1], matHeight(uv0()) * 0.7 + 0.15);
    spec = 0.85; shin = 70.0; metal = 0.9;
  } else if (uMaterial == 4) {
    float h = matHeight(uv0());
    albedo = mix(uColors[0], uColors[1], smoothstep(0.35, 0.75, h));
    albedo = mix(albedo, uColors[2], smoothstep(0.62, 0.9, fbm(uv0() * 5.0)));
    spec = 0.12; shin = 8.0;
  } else if (uMaterial == 5) {
    albedo = mix(uColors[0], uColors[1], matHeight(uv0()) * 0.85);
    albedo = mix(albedo, uColors[2], fbm(uv0() * 3.0) * 0.3);
    spec = 0.1; shin = 6.0;
  } else if (uMaterial == 6) {
    albedo = mix(uColors[0], uColors[1], matHeight(uv0()) * 0.6);
    spec = 0.06; shin = 4.0;
  } else if (uMaterial == 7) {
    float crack = 1.0 - matHeight(uv0());
    albedo = uColors[0];
    albedo = mix(albedo, uColors[1], smoothstep(0.1, 0.6, fbm(uv0() * 2.4)));
    albedo = mix(albedo, vec3(0.06, 0.05, 0.05), smoothstep(0.85, 1.0, crack) * 0.55);
    spec = 0.6; shin = 80.0;
  } else if (uMaterial == 8) {
    albedo = mix(uColors[0], uColors[1], matHeight(uv0()) * 0.8);
    spec = 0.28; shin = 18.0;
  } else if (uMaterial == 9) {
    albedo = mix(uColors[0], uColors[1], 0.35);
    albedo = mix(albedo, uColors[2], fbm(uv0() * 2.0) * 0.2);
    spec = 0.95; shin = 110.0;
  } else if (uMaterial == 10) {
    float glow = matHeight(uv0());
    albedo = mix(uColors[0] * 0.12, uColors[1], glow);
    emissive = glow * 0.85;
    spec = 0.7; shin = 90.0;
  } else if (uMaterial == 11) {
    albedo = mix(uColors[0], uColors[1], 0.55);
    spec = 1.1; shin = 140.0; metal = 0.25;
  } else if (uMaterial == 12) {
    albedo = uColors[0];
    spec = 1.0; shin = 120.0; metal = 0.6;
  } else if (uMaterial == 13) {
    albedo = mix(uColors[0], uColors[1], matHeight(uv0()));
    spec = 0.22; shin = 10.0;
  } else if (uMaterial == 14) {
    albedo = mix(uColors[0], uColors[1], matHeight(uv0()) * 0.7);
    albedo = mix(albedo, uColors[2], 0.25);
    spec = 0.08; shin = 6.0;
  } else if (uMaterial == 15) {
    vec2 g = uv0() * 16.0;
    vec3 chip = uColors[1];
    float d = 1.0;
    vec2 base = floor(g);
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 cc = base + o + hash2(base + o);
      float dd = length(cc - g);
      if (dd < d) { d = dd; chip = mix(uColors[1], uColors[2], hash(cc)); }
    }
    albedo = mix(chip, uColors[0], smoothstep(0.0, 0.4, d));
    spec = 0.5; shin = 46.0;
  } else if (uMaterial == 16) {
    float crack = 1.0 - matHeight(uv0());
    albedo = mix(uColors[0], uColors[1], 0.5);
    albedo = mix(albedo, uColors[2], smoothstep(0.7, 1.0, crack));
    spec = 0.9; shin = 100.0;
  } else if (uMaterial == 17) {
    albedo = uColors[0];
    albedo = mix(albedo, uColors[1], matHeight(uv0()) * 0.22);
    spec = 0.04; shin = 4.0;
  } else if (uMaterial == 18) {
    albedo = mix(uColors[0], uColors[1], 0.4);
    spec = 1.2; shin = 160.0;
  } else if (uMaterial == 20) {
    float h = matHeight(uv0());
    albedo = mix(uColors[1], uColors[2], fbm(uv0() * 2.2) * 0.75);
    albedo = mix(albedo, uColors[0], smoothstep(0.8, 0.95, h)); // wax-reserved motif stays pale
    albedo = mix(albedo, uColors[4], (1.0 - smoothstep(0.2, 0.42, h)) * 0.85); // dye-dark crack veins
    spec = 0.45; shin = 42.0;
  } else if (uMaterial == 21) {
    float h = matHeight(uv0());
    albedo = mix(uColors[0], uColors[1], smoothstep(0.12, 0.62, h));
    albedo = mix(albedo, uColors[2], smoothstep(0.55, 0.95, h) * 0.85);
    albedo = mix(albedo, uColors[0], smoothstep(0.35, 0.65, fbm(uv0() * 38.0)) * 0.22);
    spec = 0.08; shin = 8.0;
  } else if (uMaterial == 22) {
    float h = matHeight(uv0());
    albedo = mix(uColors[0], uColors[3], smoothstep(0.25, 0.85, h));
    albedo = mix(albedo, uColors[4], smoothstep(0.85, 1.0, h) * 0.7);
    spec = 0.06; shin = 6.0;
  } else if (uMaterial == 23) {
    vec2 q = uv0() * 5.0;
    vec2 id = floor(q);
    vec2 p = fract(q) - 0.5;
    vec2 pr = vec2(p.x * 0.7071 + p.y * 0.7071, -p.x * 0.7071 + p.y * 0.7071);
    float star = min(max(abs(p.x), abs(p.y)), max(abs(pr.x), abs(pr.y)));
    float grout = 1.0 - smoothstep(0.0, 0.045, 0.5 - max(abs(p.x), abs(p.y)));
    albedo = mix(uColors[1], uColors[2], hash(id + uSeed)); // per-tile hue variation
    albedo = mix(uColors[0], albedo, step(0.5, hash(id * 2.3 + uSeed)));
    albedo = mix(albedo, uColors[3], (1.0 - smoothstep(0.18, 0.23, star)) * 0.55);
    albedo = mix(albedo, uColors[4], grout);
    spec = 0.65; shin = 76.0;
  } else if (uMaterial == 24) {
    albedo = mix(uColors[1], uColors[0], matHeight(uv0()) * 0.55);
    spec = 1.1; shin = 120.0; metal = 0.95;
  } else if (uMaterial == 25) {
    vec2 id = floor(uv0() * 22.0);
    float pick = hash(id + uSeed);
    vec3 beadCol = mix(uColors[1], uColors[2], step(0.34, pick));
    beadCol = mix(beadCol, uColors[3], step(0.67, pick));
    beadCol *= 0.88 + hash(id * 2.9 + uSeed) * 0.24;
    albedo = mix(uColors[4] * 0.55, beadCol, smoothstep(0.02, 0.3, matHeight(uv0())));
    spec = 0.85; shin = 90.0;
  } else if (uMaterial == 26) {
    float h = matHeight(uv0());
    albedo = mix(uColors[0], uColors[1], smoothstep(0.12, 0.45, h));
    albedo = mix(albedo, uColors[2], smoothstep(0.55, 0.95, h) * 0.7);
    spec = 0.5; shin = 26.0;
  } else if (uMaterial == 27) {
    vec2 q = uv0();
    float warp = fbm(q * 2.4) * 0.6;
    float s = (q.x + q.y + warp) * 1.4;
    float fs = fract(s);
    float stringing = 1.0 - smoothstep(0.012, 0.032, min(fs, 1.0 - fs));
    vec2 g = q * 3.0;
    vec2 id = floor(g);
    vec2 p = fract(g) - 0.5;
    float diamond = (1.0 - smoothstep(0.13, 0.17, abs(p.x) + abs(p.y))) * step(0.72, hash(id + uSeed));
    vec3 woodA = mix(uColors[1], uColors[2], 0.45);
    vec3 woodB = mix(uColors[2], uColors[3], 0.55);
    albedo = mix(woodA, woodB, hash(vec2(floor(s), 1.7)));
    albedo = mix(albedo, uColors[3], diamond * 0.85);
    albedo = mix(albedo, uColors[0], stringing * 0.75);
    spec = mix(0.18, 0.9, stringing); // matte veneer, sheen on the stringing
    shin = mix(16.0, 80.0, stringing);
  } else {
    float glow = matHeight(uv0());
    albedo = mix(uColors[0], uColors[1], glow);
    emissive = pow(glow, 1.6) * 1.1;
    spec = 0.4; shin = 40.0;
  }
}
`

const FRAG_HELPERS = `
vec3 cameraPos() { return vec3(0.0, 0.0, 3.4); }
vec3 lightDir1() { return vec3(0.55, 0.7, 0.6); }
vec3 lightTint() { return vec3(1.0, 0.98, 0.94); }
vec3 fresnelTint() { return mix(uColors[1], vec3(1.0), 0.4); }
`

const FRAG_MAIN = `
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPos() - vPos);

  // bump from height field along the surface tangent frame
  float eps = 0.004;
  float h  = matHeight(vUv);
  float hx = matHeight(vUv + vec2(eps, 0.0));
  float hy = matHeight(vUv + vec2(0.0, eps));
  float bumpAmt = bumpScaleFor() * 46.0;
  N = normalize(N - (vTangent * (hx - h) + vBitangent * (hy - h)) * bumpAmt);

  vec3 albedo; float spec; float shin; float metal; float emissive;
  matSurface(albedo, spec, shin, metal, emissive);

  if (uMaterial == 12) { // thin-film iridescence
    float f = pow(1.0 - abs(dot(N, V)), 2.2);
    float band = sin((vUv.x + vUv.y) * 12.0 + f * 9.0 + uTime * 0.35);
    albedo = mix(mix(uColors[1], uColors[2], 0.5 + 0.5 * band), uColors[3], f * 0.8);
    albedo = mix(albedo, uColors[4], 0.35 * (0.5 + 0.5 * sin(f * 12.0)));
  }

  vec3 L1 = normalize(lightDir1());
  vec3 L2 = normalize(vec3(-0.6, -0.2, 0.5));
  float dif = max(dot(N, L1), 0.0);
  float dif2 = max(dot(N, L2), 0.0) * 0.28;
  vec3 H1 = normalize(L1 + V);
  float sp = pow(max(dot(N, H1), 0.0), shin) * spec * (1.0 - metal * 0.25);
  float fres = pow(1.0 - abs(dot(N, V)), 3.2);
  vec3 col = albedo * (0.34 + dif * 0.95 + dif2) + vec3(sp) * lightTint();
  if (uMaterial == 6) col += albedo * pow(1.0 - abs(dot(N, V)), 1.6) * 0.55; // velvet sheen
  if (uMaterial == 26) { // embroidery: anisotropic thread sheen along the stitch rows
    float sheen = pow(abs(sin(vUv.y * 37.7 + vUv.x * 1.4 + uSeed * 0.1)), 16.0);
    col += albedo * sheen * (0.3 + dif * 0.4);
  }
  col += fres * fresnelTint() * (0.28 + metal * 0.6);
  col += albedo * emissive;
  col = pow(clamp(col, 0.0, 1.4), vec3(0.92));
  gl_FragColor = vec4(col, 1.0);
}
`

const FRAG_FULL = FRAG_LIB + FRAG_HELPERS + FRAG_MAIN

/* ----------------------------- component ----------------------------- */

interface ShaderLabProps {
  a: AestheticFull
  className?: string
}

export function ShaderLab({ a, className }: ShaderLabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const materials = useMemo(() => materialsFor(a), [a])
  const [material, setMaterial] = useState<MaterialId>(materials[0] ?? 'brushed')
  const [geo, setGeo] = useState<GeoName>('knot')
  const [expanded, setExpanded] = useState(false)
  const [supported, setSupported] = useState(true)
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const palette = useMemo(() => {
    const valid = sortByLum(a.colors.filter((c: ColorEntry) => hexToRgb(c.hex)))
    const light = valid[0]?.hex ?? '#efe9dd'
    const dark = valid[valid.length - 1]?.hex ?? '#2f2a26'
    if (valid.length >= 5) return valid.slice(0, 5).map((c: ColorEntry) => c.hex)
    if (valid.length === 4) return [...valid.map((c: ColorEntry) => c.hex), mixHex(light, '#ffffff', 0.35)]
    if (valid.length === 3) return [...valid.map((c: ColorEntry) => c.hex), mixHex(valid[1].hex, valid[0].hex, 0.5), mixHex(valid[2].hex, light, 0.3)]
    if (valid.length === 2) return [...valid.map((c: ColorEntry) => c.hex), mixHex(light, dark, 0.5), mixHex(light, '#ffffff', 0.25), mixHex(dark, '#000000', 0.25)]
    if (valid.length === 1) return [valid[0].hex, mixHex(valid[0].hex, '#ffffff', 0.4), mixHex(valid[0].hex, '#000000', 0.35), mixHex(valid[0].hex, '#8a6d3b', 0.3), mixHex(valid[0].hex, '#ffffff', 0.7)]
    return [light, '#8a6d3b', '#5b5147', '#c9b99a', dark]
  }, [a.colors])

  const stateRef = useRef<{
    rotX: number
    rotY: number
    zoom: number
    dragging: boolean
    lastX: number
    lastY: number
    autoSpin: boolean
    raf: number
    start: number
    curMaterial: number
    curGeo: GeoName
    draw: ((geoName: GeoName) => void) | null
  }>({ rotX: -0.35, rotY: 0.6, zoom: 1, dragging: false, lastX: 0, lastY: 0, autoSpin: true, raf: 0, start: 0, curMaterial: 0, curGeo: 'knot', draw: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
    if (!gl) { setSupported(false); return }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('shader compile error:', gl.getShaderInfoLog(sh))
        return null
      }
      return sh
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_FULL)
    if (!vs || !fs) { setSupported(false); return }
    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('program link error:', gl.getProgramInfoLog(program))
      setSupported(false)
      return
    }
    gl.useProgram(program)

    const loc = (name: string) => gl.getAttribLocation(program, name)
    const uniforms = {
      uProj: gl.getUniformLocation(program, 'uProj'),
      uView: gl.getUniformLocation(program, 'uView'),
      uModel: gl.getUniformLocation(program, 'uModel'),
      uNormalMat: gl.getUniformLocation(program, 'uNormalMat'),
      uColors: gl.getUniformLocation(program, 'uColors'),
      uSeed: gl.getUniformLocation(program, 'uSeed'),
      uTime: gl.getUniformLocation(program, 'uTime'),
      uMaterial: gl.getUniformLocation(program, 'uMaterial'),
    }

    const counts = {} as Record<GeoName, number>
    const drawSetup: Record<GeoName, () => void> = {} as any
    const makeGeo = (name: GeoName) => {
      const g = buildGeometry(name)
      const bind = (data: Float32Array, attr: string, size: number) => {
        const buf = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
        const l = loc(attr)
        gl.enableVertexAttribArray(l)
        gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0)
      }
      const posBuf = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
      gl.bufferData(gl.ARRAY_BUFFER, g.positions, gl.STATIC_DRAW)
      const nrmBuf = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf)
      gl.bufferData(gl.ARRAY_BUFFER, g.normals, gl.STATIC_DRAW)
      const tanBuf = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, tanBuf)
      gl.bufferData(gl.ARRAY_BUFFER, g.tangents, gl.STATIC_DRAW)
      const bitBuf = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, bitBuf)
      gl.bufferData(gl.ARRAY_BUFFER, g.bitangents, gl.STATIC_DRAW)
      const uvBuf = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
      gl.bufferData(gl.ARRAY_BUFFER, g.uvs, gl.STATIC_DRAW)
      const idxBuf = gl.createBuffer()!
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.indices, gl.STATIC_DRAW)
      counts[name] = g.indices.length
      const lp = loc('aPos'); const ln = loc('aNormal'); const lt = loc('aTangent'); const lb = loc('aBitangent'); const lu = loc('aUv')
      drawSetup[name] = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
        gl.enableVertexAttribArray(lp)
        gl.vertexAttribPointer(lp, 3, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf)
        gl.enableVertexAttribArray(ln)
        gl.vertexAttribPointer(ln, 3, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, tanBuf)
        gl.enableVertexAttribArray(lt)
        gl.vertexAttribPointer(lt, 3, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, bitBuf)
        gl.enableVertexAttribArray(lb)
        gl.vertexAttribPointer(lb, 3, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
        gl.enableVertexAttribArray(lu)
        gl.vertexAttribPointer(lu, 2, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
      }
    }
    ;(['knot', 'torus', 'sphere'] as GeoName[]).forEach(makeGeo)

    const st = stateRef.current
    st.autoSpin = !reducedMotion
    st.start = performance.now()
    st.curMaterial = Math.max(0, MATERIAL_ORDER.indexOf(material))
    st.curGeo = geo
    st.draw = (name: GeoName) => drawSetup[name]()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(2, Math.round(rect.width * dpr))
      canvas.height = Math.max(2, Math.round(rect.height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const mat4Perspective = (fovy: number, aspect: number, near: number, far: number) => {
      const f = 1 / Math.tan(fovy / 2)
      const nf = 1 / (near - far)
      return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
    }
    const mat4LookAt = (eye: number[], center: number[], up: number[]) => {
      const z = eye.map((e, i) => e - center[i])
      const zl = Math.hypot(...z); const Z = z.map((v) => v / zl)
      const x = [up[1] * Z[2] - up[2] * Z[1], up[2] * Z[0] - up[0] * Z[2], up[0] * Z[1] - up[1] * Z[0]]
      const xl = Math.hypot(...x); const X = x.map((v) => v / xl)
      const Y = [Z[1] * X[2] - Z[2] * X[1], Z[2] * X[0] - Z[0] * X[2], Z[0] * X[1] - Z[1] * X[0]]
      return new Float32Array([X[0], Y[0], Z[0], 0, X[1], Y[1], Z[1], 0, X[2], Y[2], Z[2], 0,
        -(X[0] * eye[0] + X[1] * eye[1] + X[2] * eye[2]),
        -(Y[0] * eye[0] + Y[1] * eye[1] + Y[2] * eye[2]),
        -(Z[0] * eye[0] + Z[1] * eye[1] + Z[2] * eye[2]), 1])
    }
    const rotXYZ = (rx: number, ry: number) => {
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry)
      return new Float32Array([cy, 0, -sy, 0, sy * sx, cx, cy * sx, 0, sy * cx, -sx, cy * cx, 0, 0, 0, 0, 1])
    }
    const normalFromModel = (m: Float32Array) => new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]])

    const flat: number[] = []
    palette.forEach((hex) => flat.push(...toVec(hex)))
    while (flat.length < 15) flat.push(0.5, 0.5, 0.5)

    const render = () => {
      const t = (performance.now() - st.start) / 1000
      if (st.autoSpin && !st.dragging) st.rotY += 0.0035
      gl.clearColor(0.055, 0.05, 0.047, 1)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.DEPTH_TEST)

      const aspect = canvas.width / Math.max(1, canvas.height)
      const proj = mat4Perspective(Math.PI / 4, aspect, 0.1, 100)
      const view = mat4LookAt([0, 0, 3.4 / st.zoom], [0, 0, 0], [0, 1, 0])
      const model = rotXYZ(st.rotX, st.rotY)
      st.draw!(st.curGeo)

      gl.uniformMatrix4fv(uniforms.uProj, false, proj)
      gl.uniformMatrix4fv(uniforms.uView, false, view)
      gl.uniformMatrix4fv(uniforms.uModel, false, model)
      gl.uniformMatrix3fv(uniforms.uNormalMat, false, normalFromModel(model))
      gl.uniform3fv(uniforms.uColors, new Float32Array(flat))
      gl.uniform1f(uniforms.uSeed, seedFrom(a.slug))
      gl.uniform1f(uniforms.uTime, reducedMotion ? 2.5 : t)
      gl.uniform1i(uniforms.uMaterial, st.curMaterial)
      gl.drawElements(gl.TRIANGLES, counts[st.curGeo], gl.UNSIGNED_SHORT, 0)

      st.raf = requestAnimationFrame(render)
    }
    st.raf = requestAnimationFrame(render)

    // Pause the render loop while the canvas is scrolled out of view (the
    // detail sheet is long) — saves battery/GPU on low-end devices, resumes
    // instantly when the material lab scrolls back in.
    let inView = true
    const io = new IntersectionObserver((entries) => {
      const visible = entries.some((en) => en.isIntersecting)
      if (visible && !inView && st.raf === 0) {
        inView = true
        st.raf = requestAnimationFrame(render)
      } else if (!visible && inView) {
        inView = false
        cancelAnimationFrame(st.raf)
        st.raf = 0
      }
    })
    io.observe(canvas)

    const down = (e: PointerEvent) => {
      st.dragging = true
      st.lastX = e.clientX; st.lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!st.dragging) return
      st.rotY += (e.clientX - st.lastX) * 0.008
      st.rotX += (e.clientY - st.lastY) * 0.008
      st.rotX = Math.max(-1.4, Math.min(1.4, st.rotX))
      st.lastX = e.clientX; st.lastY = e.clientY
    }
    const up = () => { st.dragging = false }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      st.zoom = Math.max(0.6, Math.min(2.6, st.zoom * (e.deltaY > 0 ? 0.92 : 1.08)))
    }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.addEventListener('wheel', wheel, { passive: false })

    return () => {
      cancelAnimationFrame(st.raf)
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('wheel', wheel)
    }
  }, [a.slug, reducedMotion])

  useEffect(() => {
    const st = stateRef.current
    if (!st) return
    st.curMaterial = Math.max(0, MATERIAL_ORDER.indexOf(material))
    if (expanded) st.zoom = Math.max(st.zoom, 1.3)
  }, [material, expanded])

  useEffect(() => {
    const st = stateRef.current
    if (st) st.curGeo = geo
  }, [geo])

  if (!supported) {
    return (
      <div className={`flex h-48 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 px-6 text-center text-xs text-stone-500 ${className ?? ''}`} role="img" aria-label="3D material preview unavailable">
        3D shader preview needs WebGL. The material vocabulary for this entry is still documented below and in the texture swatches.
      </div>
    )
  }

  return (
    <section aria-label="3D shader material study" className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-lg text-stone-900">
            <Gauge className="h-4 w-4 text-[#8a6d3b]" aria-hidden="true" />
            3D material study
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            Procedural WebGL shaders — bump-mapped, lit, tinted by the entry&rsquo;s own palette. Drag to rotate · scroll to zoom.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setGeo((g) => (g === 'knot' ? 'torus' : g === 'torus' ? 'sphere' : 'knot'))}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-[11px] text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
            aria-label={`Switch 3D form (current: ${geo})`}
          >
            <Box className="h-3.5 w-3.5" aria-hidden="true" />
            {geo === 'knot' ? 'Torus knot' : geo === 'torus' ? 'Torus' : 'Sphere'}
          </button>
          <button
            type="button"
            onClick={() => {
              const st = stateRef.current
              if (st) { st.rotX = -0.35; st.rotY = 0.6; st.zoom = 1 }
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-[11px] text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
            aria-label="Reset camera"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-[11px] text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
            aria-expanded={expanded}
            aria-label={expanded ? 'Shrink 3D view' : 'Expand 3D view'}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />}
            {expanded ? 'Shrink' : 'Expand'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-300 bg-stone-950 shadow-lg">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Live 3D shader render of ${MATERIAL_LABELS[material]} for ${a.name}`}
          className={`block w-full cursor-grab touch-none active:cursor-grabbing ${expanded ? 'h-[430px]' : 'h-[300px]'}`}
          style={{ transition: 'height 0.3s ease' }}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Shader material selector">
        <MousePointer2 className="mr-0.5 h-3 w-3 text-stone-400" aria-hidden="true" />
        {materials.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={m === material}
            onClick={() => setMaterial(m)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
              m === material
                ? 'border-[#8a6d3b] bg-[#8a6d3b] text-white'
                : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900'
            }`}
          >
            {MATERIAL_LABELS[m] ?? m}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-stone-400">
        Shader &ldquo;{MATERIAL_LABELS[material] ?? material}&rdquo; · seed {seedFrom(a.slug)} · palette {palette.length} colors · {reducedMotion ? 'motion reduced' : 'live'}
      </p>
    </section>
  )
}
