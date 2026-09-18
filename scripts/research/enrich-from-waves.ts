/**
 * Enrich-from-waves: for entries that already existed (waves skipped as
 * duplicates), fill ONLY empty decomposition fields from the curated wave
 * data. Never overwrites existing non-empty values; never changes identity,
 * status, or sources. Run: bun scripts/research/enrich-from-waves.ts
 */
import { readdirSync } from "node:fs";
import { dbp, validateEntry, ensureKnownNames, normalizeName } from "./lib";

function matchesTarget(target: { name: string; aliases: string }, wanted: string): boolean {
  const wn = normalizeName(wanted);
  if (!wn || wn.length < 5) return false;
  const tn = normalizeName(target.name);
  if (tn === wn) return true;
  if (tn.length >= 5 && (tn.includes(wn) || wn.includes(tn))) return true;
  try {
    const aliases = JSON.parse(target.aliases || "[]") as string[];
    return aliases.some((a) => normalizeName(a) === wn);
  } catch {
    return false;
  }
}

function isEmptyJSON(s: string): boolean {
  try {
    const v = JSON.parse(s || "null");
    if (Array.isArray(v)) return v.length === 0;
    if (v && typeof v === "object") return Object.keys(v).length === 0;
    return v === null || v === undefined;
  } catch {
    return true;
  }
}

function isAllFifty(s: string): boolean {
  try {
    const v = JSON.parse(s || "{}");
    const vals = Object.values(v) as number[];
    return vals.length > 0 && vals.every((n) => n === 50);
  } catch {
    return true;
  }
}

async function main() {
  const dir = new URL("./waves/", import.meta.url).pathname;
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts")).sort();
  await ensureKnownNames();
  let filled = 0;
  for (const f of files) {
    const mod = await import(new URL(`./waves/${f}`, import.meta.url).href);
    for (const key of Object.keys(mod)) {
      const list = mod[key];
      if (!Array.isArray(list)) continue;
      for (const raw of list) {
        const name = String(raw.n ?? "").trim();
        if (!name) continue;
        const candidates = await dbp.aesthetic.findMany({
          where: { OR: [{ name: { contains: name.slice(0, 20) } }, { name }] },
          select: { id: true, name: true, aliases: true },
        });
        const existing = candidates.find((c) => matchesTarget(c, name));
        if (!existing) continue;

        const entry = validateEntry(raw, typeof raw.cat === "string" && raw.cat ? raw.cat : "Regional & Cultural Tradition");
        if ("error" in entry) continue;

        const data: Record<string, string> = {};
        if (isEmptyJSON(existing.visualDNA)) data.visualDNA = JSON.stringify(entry.visualDNA);
        if (isEmptyJSON(existing.typography)) data.typography = JSON.stringify(entry.typography);
        if (isEmptyJSON(existing.typePairing) && Object.keys(entry.typePairing).length) data.typePairing = JSON.stringify(entry.typePairing);
        if (isEmptyJSON(existing.uiTranslation) && Object.keys(entry.uiTranslation).length) data.uiTranslation = JSON.stringify(entry.uiTranslation);
        if (isEmptyJSON(existing.recipe) && Object.keys(entry.recipe).length) data.recipe = JSON.stringify(entry.recipe);
        if (isEmptyJSON(existing.lighting) && (raw.lit ?? raw.lighting)) data.lighting = JSON.stringify(raw.lit ?? raw.lighting);
        if (isEmptyJSON(existing.photography) && (raw.pho ?? raw.photography)) data.photography = JSON.stringify(raw.pho ?? raw.photography);
        if (isEmptyJSON(existing.architecture) && (raw.arc ?? raw.architecture)) data.architecture = JSON.stringify(raw.arc ?? raw.architecture);
        if (isEmptyJSON(existing.fashion) && (raw.fash ?? raw.fashion)) data.fashion = JSON.stringify(raw.fash ?? raw.fashion);
        if (isEmptyJSON(existing.environment) && (raw.env ?? raw.environment)) data.environment = JSON.stringify(raw.env ?? raw.environment);
        if (isEmptyJSON(existing.graphicDesign) && (raw.gd ?? raw.graphicDesign)) data.graphicDesign = JSON.stringify(raw.gd ?? raw.graphicDesign);
        if (isEmptyJSON(existing.emotionProfile) || isAllFifty(existing.emotionProfile)) data.emotionProfile = JSON.stringify(entry.emotionProfile);
        if (isEmptyJSON(existing.dnaAxes) || isAllFifty(existing.dnaAxes)) data.dnaAxes = JSON.stringify(entry.dnaAxes);
        if (isEmptyJSON(existing.sounds) && (raw.snd ?? raw.sounds)) data.sounds = JSON.stringify(raw.snd ?? raw.sounds);
        if (isEmptyJSON(existing.colors) && entry.colors.length) data.colors = JSON.stringify(entry.colors);
        if (isEmptyJSON(existing.materials) && entry.materials.length) data.materials = JSON.stringify(entry.materials);
        if (isEmptyJSON(existing.textures) && entry.textures.length) data.textures = JSON.stringify(entry.textures);
        if (isEmptyJSON(existing.objects) && entry.objects.length) data.objects = JSON.stringify(entry.objects);
        if (isEmptyJSON(existing.keyExamples) && entry.keyExamples.length) data.keyExamples = JSON.stringify(entry.keyExamples);

        if (Object.keys(data).length === 0) continue;
        try {
          await dbp.aesthetic.update({ where: { id: existing.id }, data });
          filled++;
          console.log(`  ↑ ${existing.name}: +${Object.keys(data).length} fields`);
        } catch {}
      }
    }
  }
  console.log(`ENRICHED ${filled} existing entries from curated waves`);
  await dbp.$disconnect();
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
