'use client'

import { useCallback, useState, type CSSProperties } from 'react'
import type { ColorEntry } from '@/lib/aesthetic'

/** Deterministic palette composition used when a record has no image (or it fails to load). */
export function paletteArt(colors: ColorEntry[], seed = 0): CSSProperties {
  const cs = colors.length ? colors.map((c) => c.hex) : ['#2a2a2e', '#3a3a40', '#1c1c1f']
  const at = (i: number) => cs[(i + seed) % cs.length]
  return {
    backgroundColor: at(0),
    backgroundImage: [
      `radial-gradient(120% 90% at ${20 + (seed % 5) * 12}% 0%, ${at(1)} 0 38%, transparent 60%)`,
      `radial-gradient(90% 80% at 100% 100%, ${at(2)} 0 30%, transparent 58%)`,
      `linear-gradient(135deg, ${at(0)}, ${at(3)})`,
    ].join(','),
  }
}

export function ArtImage({
  src,
  alt,
  colors,
  className = '',
  imgClassName = '',
  sizes,
  srcSet,
  priority = false,
  seed = 0,
}: {
  src: string | null | undefined
  alt: string
  colors: ColorEntry[]
  className?: string
  imgClassName?: string
  sizes?: string
  srcSet?: string
  priority?: boolean
  seed?: number
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  // SSR'd images can finish loading before hydration attaches onLoad — check on mount.
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [])
  return (
    <div className={`overflow-hidden ${/(absolute|fixed)/.test(className) ? '' : 'relative'} ${className}`} style={paletteArt(colors, seed)}>
      {src && !failed && (
        <img
          ref={imgRef}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`size-full object-cover transition-[opacity,transform] duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      )}
    </div>
  )
}
