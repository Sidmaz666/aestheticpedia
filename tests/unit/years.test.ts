import { describe, expect, it } from 'vitest'
import { parseYear } from '../../scripts/data/years.ts'

describe('parseYear', () => {
  it.each([
    ['1920s', 'start', 1920],
    ['1920s', 'end', 1929],
    ['17th century', 'start', 1600],
    ['17th century', 'end', 1699],
    ['late 19th century', 'start', 1866],
    ['mid-19th century', 'start', 1833],
    ['mid 20th century', 'end', 1966],
    ['1st century BCE to present', 'start', -100],
    ['c. 500 BCE', 'start', -500],
    ['1982', 'start', 1982],
  ] as const)('%s (%s) → %s', (text, edge, year) => {
    expect(parseYear(text, edge)).toBe(year)
  })

  it('treats open-ended labels as no end year', () => {
    for (const t of ['present', 'Present', 'ongoing', 'today', 'contemporary']) expect(parseYear(t, 'end')).toBeNull()
  })
})
