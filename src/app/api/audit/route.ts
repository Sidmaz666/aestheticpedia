import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/audit — data-completeness aggregates for the whole library.
 *
 * Powers the dashboard "record integrity" panels: how many entries are
 * missing each core field, overall completeness, and the 5,000-entry
 * milestone progress. The research pipeline's no-missing-data policy
 * (fillGaps + enrichment + image worker) closes these gaps continuously.
 */
export async function GET() {
  try {
    const total = await db.aesthetic.count()
    const [
      missingColors,
      missingPeriod,
      missingOrigin,
      missingTextures,
      missingObjects,
      missingMaterials,
      missingEra,
      missingExamples,
      missingDNA,
      missingTypography,
      missingLighting,
      missingUITranslation,
      missingRecipe,
      missingSounds,
      missingSources,
      missingImages,
      missingReferences,
      missingTypePairing,
      verified,
      researched,
      draft,
      flagged,
    ] = await Promise.all([
      db.aesthetic.count({ where: { colors: '[]' } }),
      db.aesthetic.count({ where: { periodStart: '' } }),
      db.aesthetic.count({ where: { origin: '' } }),
      db.aesthetic.count({ where: { textures: '[]' } }),
      db.aesthetic.count({ where: { objects: '[]' } }),
      db.aesthetic.count({ where: { materials: '[]' } }),
      db.aesthetic.count({ where: { era: '' } }),
      db.aesthetic.count({ where: { keyExamples: '[]' } }),
      db.aesthetic.count({ where: { visualDNA: '{}' } }),
      db.aesthetic.count({ where: { typography: '{}' } }),
      db.aesthetic.count({ where: { lighting: '{}' } }),
      db.aesthetic.count({ where: { uiTranslation: '{}' } }),
      db.aesthetic.count({ where: { recipe: '{}' } }),
      db.aesthetic.count({ where: { sounds: '[]' } }),
      db.aesthetic.count({ where: { sources: '[]' } }),
      db.aesthetic.count({ where: { images: '[]' } }),
      db.aesthetic.count({ where: { references: '[]' } }),
      db.aesthetic.count({ where: { typePairing: '{}' } }),
      db.aesthetic.count({ where: { status: 'verified' } }),
      db.aesthetic.count({ where: { status: 'researched' } }),
      db.aesthetic.count({ where: { status: 'draft' } }),
      db.aesthetic.count({ where: { status: 'flagged' } }),
    ])

    const gaps = [
      { field: 'palette', missing: missingColors },
      { field: 'period', missing: missingPeriod },
      { field: 'origin', missing: missingOrigin },
      { field: 'textures', missing: missingTextures },
      { field: 'objects', missing: missingObjects },
      { field: 'materials', missing: missingMaterials },
      { field: 'era', missing: missingEra },
      { field: 'examples', missing: missingExamples },
      { field: 'visual DNA', missing: missingDNA },
      { field: 'typography', missing: missingTypography },
      { field: 'lighting', missing: missingLighting },
      { field: 'UI translation', missing: missingUITranslation },
      { field: 'recipe', missing: missingRecipe },
      { field: 'sonic identity', missing: missingSounds },
      { field: 'sources', missing: missingSources },
      { field: 'images', missing: missingImages },
      { field: 'references', missing: missingReferences },
      { field: 'font pairing', missing: missingTypePairing },
    ].sort((a, b) => b.missing - a.missing)

    // Core identity fields are weighted separately from deep decomposition:
    // an entry without palette or origin cannot render demos or provenance.
    const coreFields = 8
    const coreMissing =
      missingColors + missingPeriod + missingOrigin + missingTextures +
      missingObjects + missingMaterials + missingEra + missingExamples
    const coreComplete = total > 0
      ? Math.round(((coreFields * total - coreMissing) / (coreFields * total)) * 100)
      : 100

    const deepFields = 10
    const deepMissing =
      missingDNA + missingTypography + missingLighting + missingUITranslation +
      missingRecipe + missingSounds + missingSources + missingImages +
      missingReferences + missingTypePairing
    const deepComplete = total > 0
      ? Math.round(((deepFields * total - deepMissing) / (deepFields * total)) * 100)
      : 100

    return NextResponse.json({
      total,
      target: 5000,
      targetProgress: Math.min(100, Math.round((total / 5000) * 1000) / 10),
      completeness: {
        core: coreComplete,
        deep: deepComplete,
        gaps,
      },
      status: { verified, researched, draft, flagged },
      generatedAt: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
