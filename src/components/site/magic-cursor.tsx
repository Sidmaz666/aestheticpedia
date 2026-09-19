'use client'

// The wand cursor. Only for fine pointers (mouse, trackpad, pen hover); touch screens keep
// their native behaviour, text fields keep the text caret, and the system cursor is one click
// away in the header's wand menu. Everything is drawn in the current aesthetic's colours.
//
// States and what the wand does:
//   move         leans with the pointer's speed; each wand leaves its own trail
//   hover        tilts and flares over anything clickable; sparks gather at the tip
//   disabled     greys out and gives a small "no" shake
//   press / hold flicks down; holding still charges a glow that is released as a bigger spell
//   click        ring + burst; double-click a double ring and star burst; right-click a dashed ring
//   drag         draws a glowing ribbon behind the tip (pointer drags and native drag-and-drop)
//   select text  a quill-ink trail while selecting, a flourish when the selection is made
//   scroll       sparks drift against the scroll direction
//   loading      after following a link (or over aria-busy content) the wand stirs and casts
//                orbiting sparks until the new page is in
//   idle         a slow sway and the odd twinkle
// Reduced motion keeps the wand and its states but drops particles, lean, flick and sway.
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useWandPrefs } from '@/lib/wand'
import { WANDS, WAND_BOX, WAND_TIP, WandArt, type Particle } from './wands'

const SIZE = 44
const SCALE = SIZE / WAND_BOX
const INTERACTIVE =
  'a[href], button, [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="switch"], [role="radio"], [role="checkbox"], [role="option"], [role="slider"], summary, label[for], select, input[type="checkbox"], input[type="radio"], input[type="range"], input[type="submit"], input[type="button"], [data-cursor="interactive"]'
const TEXT =
  'input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="number"], input[type="password"], input[type="tel"], textarea, [contenteditable=""], [contenteditable="true"]'
const GRAB = '.cursor-grab, .cursor-grabbing, [data-cursor="grab"], canvas'

type Kind = Particle | 'ring' | 'dashed' | 'ink'
type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; kind: Kind; spin: number; rot: number; grow?: number }

// A mouse, trackpad or hovering pen: phones and tablets (coarse pointers, no hover) never get the wand.
export const WAND_MQ = '(pointer: fine) and (hover: hover)'
const fine = () => window.matchMedia(WAND_MQ).matches && !window.matchMedia('(forced-colors: active)').matches
const subscribeMq = (cb: () => void) => {
  const a = window.matchMedia(WAND_MQ)
  a.addEventListener('change', cb)
  return () => a.removeEventListener('change', cb)
}

export function MagicCursor() {
  const prefs = useWandPrefs()
  const capable = useSyncExternalStore(subscribeMq, fine, () => false)
  const on = capable && prefs.wand !== 'system'
  const wandRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = document.documentElement
    if (!on) return
    root.classList.add('wand-cursor')
    return () => root.classList.remove('wand-cursor')
  }, [on])

  useEffect(() => {
    if (!on || prefs.wand === 'system') return
    const wand = wandRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const spec = WANDS[prefs.wand]
    const fx = !reduce // particles and physics
    const trail = prefs.trail && fx && prefs.intensity > 0
    // Trail strength: 15% (the default) is subtle, 40% the original density, 100% lavish.
    const k = prefs.intensity * 2.5
    /** Emit on average `expected` particles (fractions become a probability). */
    const sprinkle = (kind: Kind, expected: number, opts?: Parameters<typeof emit>[2]) => {
      const n = Math.floor(expected) + (Math.random() < expected % 1 ? 1 : 0)
      if (n > 0) emit(kind, n, opts)
    }
    /** Click/drag feedback scales too, but never disappears. */
    const burst = (n: number) => Math.max(3, Math.round(n * (0.45 + prefs.intensity)))

    // Pointer and pose
    let x = -100
    let y = -100
    let lastX = x
    let lastY = y
    let vx = 0
    let vy = 0
    let lean = 0
    let flick = 0
    let hoverAmt = 0
    let visible = false
    // What is under the wand
    let hovering = false
    let disabled = false
    let overText = false
    let overGrab = false
    let busy = false
    // Gestures
    let pressed = false
    let pressAt = 0
    let downX = 0
    let downY = 0
    let pressOnInteractive = false
    let dragging = false
    let selecting = false
    let nativeDrag = false
    let charge = 0
    let shake = 0
    let lastMove = performance.now()
    let loadingFrom: string | null = null
    let loadingSince = 0
    let loadAmt = 0
    const ribbon: { x: number; y: number; t: number }[] = []

    let colors = ['#fff', '#fff', '#fff']
    let colorTarget: Element | null = null
    const parts: P[] = []
    let raf = 0

    const readColors = (el: Element) => {
      if (el === colorTarget) return
      colorTarget = el
      const cs = getComputedStyle(el)
      const accent = cs.getPropertyValue('--accent').trim() || '#d4a24c'
      colors = [accent, cs.getPropertyValue('--accent-2').trim() || accent, cs.getPropertyValue('--fg').trim() || '#fff']
    }

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(innerWidth * dpr)
      canvas.height = Math.round(innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
    const emit = (kind: Kind, n: number, opts: { burst?: number; at?: [number, number]; color?: string; max?: number } = {}) => {
      if (!fx) return
      const [ex, ey] = opts.at ?? [x, y]
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = opts.burst ? opts.burst * (0.5 + Math.random()) : 0.2 + Math.random() * 0.8
        const p: P = {
          x: ex + (Math.random() - 0.5) * 4,
          y: ey + (Math.random() - 0.5) * 4,
          vx: Math.cos(a) * sp - (opts.burst ? 0 : vx * 0.08),
          vy: Math.sin(a) * sp - (opts.burst ? 0 : vy * 0.08),
          life: 0,
          max: opts.max ?? 34 + Math.random() * 40,
          size: 1 + Math.random() * 2.2,
          color: opts.color ?? (kind === 'firefly' ? pick(['#e8f5a8', '#c8e27a', colors[0]]) : kind === 'ember' ? pick([colors[0], '#ffb561', '#ff7a3d']) : pick(colors)),
          kind,
          spin: (Math.random() - 0.5) * 0.2,
          rot: Math.random() * Math.PI,
        }
        if (kind === 'ember') p.vy -= 0.6
        if (kind === 'dust') {
          p.vy = Math.abs(p.vy) * 0.3
          p.max += 30
        }
        if (kind === 'star') p.size += 1.4
        if (kind === 'ring' || kind === 'dashed') {
          p.vx = p.vy = 0
          p.x = ex
          p.y = ey
          p.max = opts.max ?? 32
          p.grow = 34
        }
        if (kind === 'ink') {
          p.vx *= 0.2
          p.vy = Math.abs(p.vy) * 0.25
          p.size = 0.8 + Math.random() * 1.2
        }
        parts.push(p)
      }
    }
    const ring = (kind: 'ring' | 'dashed', color: string, grow = 34, max = 32, at?: [number, number]) => {
      if (!fx) return
      emit(kind, 1, { color, max, at })
      parts[parts.length - 1].grow = grow
    }

    const drawStar = (p: P, r: number) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const rr = i % 2 ? r * 0.28 : r
        const a = (i * Math.PI) / 4
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const step = (now: number) => {
      raf = 0
      // ---- state
      vx += (x - lastX - vx) * 0.35
      vy += (y - lastY - vy) * 0.35
      lastX = x
      lastY = y
      const speed = Math.hypot(vx, vy)
      if (pressed && !dragging && Math.hypot(x - downX, y - downY) > 5) {
        dragging = true
        charge = 0
      }
      if (dragging && !pressOnInteractive && !selecting) {
        const sel = document.getSelection()
        selecting = !!sel && !sel.isCollapsed && sel.toString().trim().length > 0
      }
      if (pressed && !dragging) charge = Math.min(1, (now - pressAt - 250) / 900)
      else if (!pressed) charge *= 0.8
      charge = Math.max(0, charge)
      // Page loading: until the URL changes (App Router commits the new page), capped at 10 s.
      if (loadingFrom !== null && (location.href !== loadingFrom || now - loadingSince > 10000)) {
        if (location.href !== loadingFrom) {
          ring('ring', colors[0], 46, 40)
          emit(spec.hover, burst(12), { burst: 2.4 })
        }
        loadingFrom = null
      }
      const loading = loadingFrom !== null || busy
      loadAmt += ((loading ? 1 : 0) - loadAmt) * 0.15
      const idle = now - lastMove > 2500 && !pressed && !loading
      shake *= 0.86

      // ---- pose
      const targetLean = reduce ? 0 : Math.max(-16, Math.min(16, vx * 1.1))
      lean += (targetLean - lean) * 0.18
      hoverAmt += ((hovering && !disabled ? 1 : 0) - hoverAmt) * 0.2
      flick *= 0.82
      let rot = lean - hoverAmt * 10 - flick
      if (fx) {
        if (dragging || nativeDrag) rot -= 14 // point into the drag
        if (selecting) rot += 18 // held like a quill
        if (overGrab && !dragging) rot -= 6
        if (loadAmt > 0.01) rot += Math.sin(now / 90) * 16 * loadAmt // stirring
        if (idle) rot += Math.sin(now / 700) * 5
        if (shake > 0.05) rot += Math.sin(now / 22) * 9 * shake
        rot -= charge * 12 + Math.sin(now / 40) * 2 * charge
      }
      const scale = 1 + hoverAmt * 0.08 - (pressed ? 0.06 : 0) + charge * 0.1
      wand.style.transform = `translate3d(${x - WAND_TIP * SCALE}px, ${y - WAND_TIP * SCALE}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`
      wand.style.opacity = visible && !overText ? '1' : '0'
      wand.style.setProperty('--flare', Math.min(1.6, hoverAmt + charge * 1.2 + loadAmt * 0.6).toFixed(3))
      wand.style.filter = disabled ? 'grayscale(1) opacity(0.6)' : ''

      // ---- emit
      const show = visible && !overText
      if (trail && show && !disabled) {
        if (selecting) {
          if (speed > 0.3) sprinkle('ink', k, { color: colors[0], max: 60 })
        } else if (speed > 0.6) sprinkle(hovering ? spec.hover : spec.particle, Math.min(3, speed / 9) * k)
        if (hovering) sprinkle(spec.hover, 0.18 * k)
        if (charge > 0.05 && Math.random() < charge * 0.9 * Math.max(0.35, k)) {
          // Sparks drawn in towards the tip while charging.
          const a = Math.random() * Math.PI * 2
          const r = 26 + Math.random() * 14
          emit(spec.hover, 1, { at: [x + Math.cos(a) * r, y + Math.sin(a) * r], max: 22 })
          const p = parts[parts.length - 1]
          p.vx = -Math.cos(a) * 1.3
          p.vy = -Math.sin(a) * 1.3
        }
        if (idle) sprinkle('sparkle', 0.02 * k, { max: 40 })
      }
      if ((dragging && !selecting) || nativeDrag) {
        ribbon.push({ x, y, t: now })
        if (ribbon.length > 40) ribbon.shift()
      }
      while (ribbon.length && now - ribbon[0].t > 380) ribbon.shift()

      // ---- draw
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      if (ribbon.length > 1 && fx) {
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        for (let i = 1; i < ribbon.length; i++) {
          const f = i / ribbon.length
          ctx.globalAlpha = f * 0.8
          ctx.strokeStyle = i % 2 ? colors[0] : colors[1]
          ctx.shadowColor = colors[0]
          ctx.shadowBlur = 12
          ctx.lineWidth = 1 + f * 4
          ctx.beginPath()
          ctx.moveTo(ribbon[i - 1].x, ribbon[i - 1].y)
          ctx.lineTo(ribbon[i].x, ribbon[i].y)
          ctx.stroke()
        }
      }
      if (loadAmt > 0.01 && show) {
        // Casting: three orbiting sparks and a thin arc.
        const t = now / 260
        ctx.shadowColor = colors[0]
        ctx.shadowBlur = 10
        for (let i = 0; i < 3; i++) {
          const a = t + (i * Math.PI * 2) / 3
          ctx.globalAlpha = loadAmt
          ctx.fillStyle = colors[i % 2]
          ctx.beginPath()
          ctx.arc(x + Math.cos(a) * 15, y + Math.sin(a) * 15, 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = loadAmt * 0.6
        ctx.strokeStyle = colors[0]
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(x, y, 15, t * 1.4, t * 1.4 + Math.PI * 0.7)
        ctx.stroke()
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.life++
        if (p.life >= p.max) {
          parts.splice(i, 1)
          continue
        }
        const t = p.life / p.max
        if (p.kind === 'ring' || p.kind === 'dashed') {
          ctx.globalAlpha = (1 - t) * 0.75
          ctx.strokeStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 6
          ctx.lineWidth = 1.6 * (1 - t) + 0.4
          if (p.kind === 'dashed') ctx.setLineDash([3, 4])
          ctx.beginPath()
          ctx.arc(p.x, p.y, 4 + (1 - (1 - t) ** 2) * (p.grow ?? 34), 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
          continue
        }
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy =
          p.vy * 0.96 +
          (p.kind === 'ember' ? -0.03 : p.kind === 'dust' ? 0.015 : p.kind === 'ink' ? 0.01 : p.kind === 'firefly' ? Math.sin(p.life * 0.2) * 0.04 : 0.035)
        p.rot += p.spin
        const twinkle = p.kind === 'firefly' ? 0.5 + 0.5 * Math.sin(p.life * 0.35 + p.rot * 5) : 1
        ctx.globalAlpha = Math.max(0, (1 - t) * twinkle)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.kind === 'glyph' || p.kind === 'ink' ? 3 : 8
        const s = p.size * (1 - t * 0.5)
        switch (p.kind) {
          case 'star':
            drawStar(p, s * 2.2)
            break
          case 'sparkle':
            drawStar(p, s * 1.6)
            break
          case 'shard':
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rot)
            ctx.fillRect(-s * 0.5, -s * 1.6, s, s * 3.2)
            ctx.restore()
            break
          case 'glyph':
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(Math.round(p.rot / (Math.PI / 4)) * (Math.PI / 4))
            ctx.fillRect(-s, -0.5, s * 2, 1)
            ctx.fillRect(-0.5, -s, 1, s * (p.rot > 1.5 ? 2 : 1))
            ctx.restore()
            break
          default:
            ctx.beginPath()
            ctx.arc(p.x, p.y, s, 0, Math.PI * 2)
            ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      // Keep going while anything is moving, glowing, loading or alive; otherwise sleep.
      const busyFrame =
        parts.length > 0 ||
        ribbon.length > 0 ||
        speed > 0.05 ||
        Math.abs(lean - targetLean) > 0.05 ||
        Math.abs(hoverAmt - (hovering && !disabled ? 1 : 0)) > 0.01 ||
        flick > 0.05 ||
        shake > 0.05 ||
        charge > 0.01 ||
        pressed ||
        loadAmt > 0.01 ||
        loading ||
        (idle && fx && visible)
      if (busyFrame) schedule()
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(step)
    }

    // Scrollbars: the wand steps aside (the OS arrow shows there) and a press that starts on a
    // scrollbar is a scroll-drag, not a spell.
    let onScrollbar = false
    let scrollDrag = false
    const isOnScrollbar = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null
      if (!el) return false
      if (el === document.documentElement || el === document.body) {
        const root = document.documentElement
        return e.clientX >= root.clientWidth || e.clientY >= root.clientHeight
      }
      const r = el.getBoundingClientRect()
      return (
        (el.scrollHeight > el.clientHeight && e.clientX > r.left + el.clientLeft + el.clientWidth) ||
        (el.scrollWidth > el.clientWidth && e.clientY > r.top + el.clientTop + el.clientHeight)
      )
    }

    const place = (cx: number, cy: number) => {
      x = cx
      y = cy
      if (!visible) {
        lastX = x
        lastY = y
      }
      visible = true
      lastMove = performance.now()
      schedule()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        visible = false
        schedule()
        return
      }
      onScrollbar = isOnScrollbar(e)
      if (onScrollbar || scrollDrag) {
        visible = false
        schedule()
        return
      }
      place(e.clientX, e.clientY)
    }
    const onOver = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null
      if (!el) return
      overText = !!el.closest(TEXT)
      const hit = el.closest(INTERACTIVE)
      disabled = !!hit && hit.matches(':disabled, [aria-disabled="true"]')
      hovering = !!hit
      overGrab = !hit && !!el.closest(GRAB)
      busy = !!el.closest('[aria-busy="true"]')
      readColors(el)
      schedule()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      if (isOnScrollbar(e)) {
        scrollDrag = true
        visible = false
        schedule()
        return
      }
      pressed = true
      pressAt = performance.now()
      downX = e.clientX
      downY = e.clientY
      dragging = false
      selecting = false
      const el = e.target instanceof Element ? e.target : null
      pressOnInteractive = !!el?.closest(`${INTERACTIVE}, ${TEXT}`)
      if (disabled) shake = 1
      else if (fx) flick = 22
      schedule()
    }
    const onUp = () => {
      if (scrollDrag) {
        scrollDrag = false
        return
      }
      if (selecting) {
        // A flourish where the selection ends.
        ring('ring', colors[1], 22, 26)
        emit('sparkle', burst(10), { burst: 1.6 })
      } else if (charge > 0.35 && !disabled) {
        // Released a charged spell.
        ring('ring', colors[0], 70, 44)
        ring('ring', colors[1], 44, 36)
        emit(spec.hover, burst(14 + charge * 20), { burst: 3.6 })
      }
      pressed = false
      dragging = false
      selecting = false
      charge = 0
      schedule()
    }
    const onClick = (e: MouseEvent) => {
      if (overText || e.detail === 0 || e.detail > 1) return // keyboard clicks have detail 0; double-clicks handled below
      if (disabled) return
      const el = e.target instanceof Element ? e.target : null
      ring('ring', colors[0])
      emit(spec.hover, burst(hovering ? 16 : 10), { burst: 2.2 })
      // Following a same-origin link: show the casting state until the next page is in.
      const a = el?.closest('a[href]') as HTMLAnchorElement | null
      if (a && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && a.target !== '_blank' && !a.hasAttribute('download')) {
        const url = new URL(a.href, location.href)
        if (url.origin === location.origin && (url.pathname !== location.pathname || url.search !== location.search)) {
          loadingFrom = location.href
          loadingSince = performance.now()
        }
      }
      schedule()
    }
    const onDbl = () => {
      if (overText || disabled) return
      ring('ring', colors[0], 30, 28)
      ring('ring', colors[1], 52, 38)
      emit('star', burst(14), { burst: 2.8 })
      schedule()
    }
    const onContext = () => {
      ring('dashed', colors[1], 28, 30)
      emit('glyph', burst(6), { burst: 1.2 })
      schedule()
    }
    let lastWheel = 0
    const onWheel = (e: WheelEvent) => {
      const now = performance.now()
      if (!fx || !trail || now - lastWheel < 45 || !visible) return
      lastWheel = now
      const before = parts.length
      sprinkle(spec.particle, 2 * k, { max: 36 })
      const dir = Math.sign(e.deltaY) || 1
      for (const p of parts.slice(before)) {
        p.vy = -dir * (1 + Math.random() * 1.5)
        p.vx *= 0.3
      }
      schedule()
    }
    // Native drag-and-drop stops pointer events; follow the drag instead.
    const onDragStart = () => {
      nativeDrag = true
      schedule()
    }
    const onDragOver = (e: DragEvent) => {
      if (e.clientX || e.clientY) place(e.clientX, e.clientY)
    }
    const onDragEnd = () => {
      nativeDrag = false
      emit(spec.hover, burst(10), { burst: 2 })
      schedule()
    }
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        visible = false
        schedule()
      }
    }
    const onBlur = () => {
      visible = false
      pressed = false
      schedule()
    }
    const onPop = () => {
      // Back/forward swaps pages without a click: drop any pending casting state.
      loadingFrom = null
      schedule()
    }

    const opts = { passive: true } as const
    addEventListener('pointermove', onMove, opts)
    addEventListener('pointerover', onOver, opts)
    addEventListener('pointerdown', onDown, opts)
    addEventListener('pointerup', onUp, opts)
    addEventListener('pointercancel', onUp, opts)
    addEventListener('click', onClick, { passive: true, capture: true })
    addEventListener('dblclick', onDbl, opts)
    addEventListener('contextmenu', onContext, opts)
    addEventListener('wheel', onWheel, opts)
    addEventListener('dragstart', onDragStart, opts)
    addEventListener('dragover', onDragOver, opts)
    addEventListener('dragend', onDragEnd, opts)
    addEventListener('popstate', onPop)
    document.addEventListener('pointerout', onLeave, opts)
    addEventListener('blur', onBlur)
    addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerover', onOver)
      removeEventListener('pointerdown', onDown)
      removeEventListener('pointerup', onUp)
      removeEventListener('pointercancel', onUp)
      removeEventListener('click', onClick, { capture: true })
      removeEventListener('dblclick', onDbl)
      removeEventListener('contextmenu', onContext)
      removeEventListener('wheel', onWheel)
      removeEventListener('dragstart', onDragStart)
      removeEventListener('dragover', onDragOver)
      removeEventListener('dragend', onDragEnd)
      removeEventListener('popstate', onPop)
      document.removeEventListener('pointerout', onLeave)
      removeEventListener('blur', onBlur)
      removeEventListener('resize', resize)
    }
  }, [on, prefs.wand, prefs.trail, prefs.intensity])

  if (!on || prefs.wand === 'system') return null
  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[2147483600] size-full" />
      <div
        ref={wandRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[2147483601] opacity-0 transition-opacity duration-150"
        style={{ width: SIZE, height: SIZE, transformOrigin: `${WAND_TIP * SCALE}px ${WAND_TIP * SCALE}px` }}
      >
        <span className="wand-tip-glow" style={{ left: WAND_TIP * SCALE, top: WAND_TIP * SCALE }} />
        <WandArt id={prefs.wand} size={SIZE} className="wand-art relative" />
      </div>
    </>
  )
}
