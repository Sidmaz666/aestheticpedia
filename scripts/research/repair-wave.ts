/**
 * Repairs a truncated wave file: keeps everything up to the last complete
 * top-level object (brace-depth balancing, string-aware), then closes the array.
 * Usage: bun scripts/research/repair-wave.ts <path>
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("usage: repair-wave.ts <file>");
  process.exit(1);
}
const src = readFileSync(path, "utf8");
const arrStart = src.indexOf("[");
if (arrStart === -1) {
  console.error("no array found");
  process.exit(1);
}

let depth = 0;
let inStr = false;
let esc = false;
let lastZero = -1; // index just after the last complete top-level object
for (let i = arrStart; i < src.length; i++) {
  const c = src[i];
  if (inStr) {
    if (esc) esc = false;
    else if (c === "\\") esc = true;
    else if (c === '"') inStr = false;
    continue;
  }
  if (c === '"') inStr = true;
  else if (c === "{") {
    depth++;
    if (depth === 1) lastZero = -1;
  } else if (c === "}") {
    depth--;
    if (depth === 0) lastZero = i + 1;
  }
}

if (depth === 0) {
  // file already balanced — check tail
  const tail = src.slice(lastZero >= 0 ? lastZero : arrStart).trim();
  if (tail === "]") {
    console.log("ALREADY-BALANCED");
    process.exit(0);
  }
}

if (lastZero <= arrStart) {
  console.error("NO-COMPLETE-ENTRIES");
  process.exit(1);
}

const kept = src.slice(0, lastZero) + ",\n];\n";
// count complete entries
let count = 0;
depth = 0;
inStr = false;
esc = false;
for (let i = arrStart; i < lastZero; i++) {
  const c = src[i];
  if (inStr) {
    if (esc) esc = false;
    else if (c === "\\") esc = true;
    else if (c === '"') inStr = false;
    continue;
  }
  if (c === '"') inStr = true;
  else if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) count++;
  }
}
writeFileSync(path, kept);
console.log("REPAIRED entries=" + count);
