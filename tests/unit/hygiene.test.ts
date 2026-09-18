import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f)
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx|css|mjs)$/.test(f) ? [p] : []
  })
}

// Control characters other than tab/newline/carriage return.
const CONTROL = new RegExp('[\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f]')

describe('source hygiene', () => {
  it('contains no stray control characters (e.g. a mangled \\b in a regex)', () => {
    const bad = ['src', 'scripts', 'tests'].flatMap((d) => files(path.join(process.cwd(), d))).filter((f) => CONTROL.test(readFileSync(f, 'utf8')))
    expect(bad).toEqual([])
  })
})
