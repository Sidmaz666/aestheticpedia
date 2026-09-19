import { describe, expect, it } from 'vitest'
import { AIC_IIIF, AIC_PATH, AIC_RELAY, absoluteUrl, isImageUrl, upstreamUrl } from '@/lib/image-url'
import { SITE_URL } from '@/lib/site'

const ID = '9af8c354-e223-256b-6aa9-71738010d4d5'

describe('image relay', () => {
  it('accepts only IIIF image paths at the sizes the records use', () => {
    expect(AIC_PATH.test(`${ID}/full/843,/0/default.jpg`)).toBe(true)
    expect(AIC_PATH.test(`${ID}/full/400,/0/default.jpg`)).toBe(true)
    expect(AIC_PATH.test(`${ID}/full/5000,/0/default.jpg`)).toBe(false)
    expect(AIC_PATH.test(`../../etc/passwd`)).toBe(false)
    expect(AIC_PATH.test(`${ID}/full/843,/0/default.jpg?x=1`)).toBe(false)
  })

  it('round-trips relayed addresses and makes them absolute for exports', () => {
    const relayed = `${AIC_RELAY}${ID}/full/843,/0/default.jpg`
    expect(isImageUrl(relayed)).toBe(true)
    expect(isImageUrl('javascript:alert(1)')).toBe(false)
    expect(upstreamUrl(relayed)).toBe(`${AIC_IIIF}${ID}/full/843,/0/default.jpg`)
    expect(absoluteUrl(relayed)).toBe(`${SITE_URL}${relayed}`)
    expect(absoluteUrl('https://upload.wikimedia.org/a.jpg')).toBe('https://upload.wikimedia.org/a.jpg')
  })
})
