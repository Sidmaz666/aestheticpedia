import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { mapAestheticFull, safeParse, type HybridResponse } from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

function buildPrompt(
  a: { name: string; summary: string; colors: string; materials: string },
  b: { name: string; summary: string; colors: string; materials: string }
): string {
  return `You are designing a speculative hybrid aesthetic that fuses two documented visual languages.

AESTHETIC A — "${a.name}"
Summary: ${a.summary}
Palette: ${a.colors}
Materials: ${a.materials}

AESTHETIC B — "${b.name}"
Summary: ${b.summary}
Palette: ${b.palette ?? b.colors}
Materials: ${b.materials}

Task: invent a credible, evocative hybrid of A and B. It must genuinely synthesize both parents — not just list them. Where the parents conflict, make deliberate design decisions.

Respond with STRICT JSON only (no markdown fences, no commentary) matching exactly this shape:
{
  "name": "invented but evocative hybrid name",
  "tagline": "one-line poetic description",
  "palette": [{"hex": "#rrggbb", "name": "color name"} x5],
  "materials": ["material" x6],
  "typography": {"display": "...", "body": "..."},
  "architecture": "2-3 sentence description",
  "fashion": "2-3 sentence description",
  "objects": ["object" x6],
  "lighting": "2-3 sentence description",
  "ui": {"background": "...", "surface": "...", "components": "...", "motion": "..."},
  "photography": "2-3 sentence description",
  "sharedDNA": ["trait shared by both parents" x4],
  "conflicts": ["tension between the parents that the hybrid must resolve" x3],
  "synthesis": "2-3 sentences explaining how the hybrid merges its parents"
}`
}

/** Lenient JSON extraction: strips fences, grabs the outermost object. */
function parseLenient(text: string): Record<string, unknown> | null {
  let t = text.trim()
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  const slice = t.slice(start, end + 1)
  try {
    return JSON.parse(slice) as Record<string, unknown>
  } catch {
    // Second chance: remove trailing commas / stray control chars
    try {
      return JSON.parse(slice.replace(/,\s*([}\]])/g, '$1').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')) as Record<string, unknown>
    } catch {
      return null
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { a?: string; b?: string } | null
    const a = body?.a?.trim()
    const b = body?.b?.trim()
    if (!a || !b) {
      return NextResponse.json({ error: 'Body must be { a: slugA, b: slugB }' }, { status: 400 })
    }
    if (a === b) {
      return NextResponse.json({ error: 'Pick two different aesthetics to hybridize' }, { status: 400 })
    }

    const [rowA, rowB] = await Promise.all([
      db.aesthetic.findUnique({ where: { slug: a } }),
      db.aesthetic.findUnique({ where: { slug: b } }),
    ])
    if (!rowA || !rowB) {
      return NextResponse.json(
        { error: `Aesthetic not found: ${!rowA ? a : b}` },
        { status: 404 }
      )
    }

    const fullA = mapAestheticFull(rowA)
    const fullB = mapAestheticFull(rowB)

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a creative design researcher generating speculative aesthetic hybrids. Strict JSON only.',
        },
        {
          role: 'user',
          content: buildPrompt(
            {
              name: fullA.name,
              summary: fullA.summary || fullA.description,
              colors: JSON.stringify(fullA.colors),
              materials: JSON.stringify(fullA.materials),
            },
            {
              name: fullB.name,
              summary: fullB.summary || fullB.description,
              colors: JSON.stringify(fullB.colors),
              materials: JSON.stringify(fullB.materials),
            }
          ),
        },
      ],
      thinking: { type: 'disabled' },
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const parsed = parseLenient(text)
    if (!parsed) {
      return NextResponse.json(
        { error: 'The model returned unparseable JSON. Try again.', raw: text.slice(0, 400) },
        { status: 502 }
      )
    }

    const paletteRaw = Array.isArray(parsed.palette) ? parsed.palette : []
    const palette = paletteRaw
      .map((c) => {
        if (!c || typeof c !== 'object') return null
        const rec = c as Record<string, unknown>
        if (typeof rec.hex !== 'string') return null
        return { hex: rec.hex, name: typeof rec.name === 'string' ? rec.name : '' }
      })
      .filter((c): c is { hex: string; name: string } => c !== null)

    const stringArr = (v: unknown, max: number): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, max) : []

    const hybrid = {
      name: typeof parsed.name === 'string' ? parsed.name : `${fullA.name} × ${fullB.name}`,
      tagline: typeof parsed.tagline === 'string' ? parsed.tagline : '',
      palette: palette.slice(0, 5),
      materials: stringArr(parsed.materials, 6),
      typography: safeParse<{ display?: string; body?: string }>(
        JSON.stringify(parsed.typography ?? {}),
        {}
      ),
      architecture: typeof parsed.architecture === 'string' ? parsed.architecture : '',
      fashion: typeof parsed.fashion === 'string' ? parsed.fashion : '',
      objects: stringArr(parsed.objects, 6),
      lighting: typeof parsed.lighting === 'string' ? parsed.lighting : '',
      ui: safeParse<{ background?: string; surface?: string; components?: string; motion?: string }>(
        JSON.stringify(parsed.ui ?? {}),
        {}
      ),
      photography: typeof parsed.photography === 'string' ? parsed.photography : '',
      sharedDNA: stringArr(parsed.sharedDNA, 4),
      conflicts: stringArr(parsed.conflicts, 3),
      synthesis: typeof parsed.synthesis === 'string' ? parsed.synthesis : '',
    }

    const res: HybridResponse = {
      hybrid,
      parents: [
        { slug: fullA.slug, name: fullA.name, colors: fullA.colors },
        { slug: fullB.slug, name: fullB.name, colors: fullB.colors },
      ],
      label: 'EXPERIMENTAL HYBRID — AI-GENERATED, NOT A DOCUMENTED STYLE',
    }
    return NextResponse.json(res)
  } catch (err) {
    console.error('[api/hybrid] failed:', err)
    return NextResponse.json(
      { error: 'Hybrid generation failed. The model may be busy — try again.' },
      { status: 500 }
    )
  }
}
