'use client'

import { useEffect } from 'react'
import { firstFontFamily, loadGoogleFont, lookupGoogleFont } from './fonts'

/**
 * Applies an aesthetic's own typefaces while its page is on screen. Colours are
 * applied server-side (see themeCss); fonts need the browser to fetch them.
 * `target` = 'root' themes the whole site (full page); 'self' only the overlay.
 */
export function AestheticFonts({
  display,
  body,
  targetId,
}: {
  display?: string
  body?: string
  targetId?: string
}) {
  useEffect(() => {
    const el = targetId ? document.getElementById(targetId) : document.documentElement
    if (!el) return
    const d = firstFontFamily(display)
    const b = firstFontFamily(body)
    const dName = d ? lookupGoogleFont(d) : null
    const bName = b ? lookupGoogleFont(b) : null
    if (dName) {
      loadGoogleFont(dName)
      el.style.setProperty('--ae-display', `"${dName}"`)
    }
    if (bName) {
      loadGoogleFont(bName)
      el.style.setProperty('--ae-body', `"${bName}"`)
    }
    return () => {
      el.style.removeProperty('--ae-display')
      el.style.removeProperty('--ae-body')
    }
  }, [display, body, targetId])
  return null
}
