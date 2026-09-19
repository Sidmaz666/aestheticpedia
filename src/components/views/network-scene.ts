// The Connections network in WebGL, drawn for speed: every node is one instance of a single
// InstancedMesh and every link a segment of a single LineSegments buffer — two draw calls for
// thousands of nodes and links. Positions come precomputed from the server (no physics here).
// Frames are rendered only while something changes (orbit, damping, fly-to, auto-rotate), so the
// scene is completely still — and costs nothing — when nobody is interacting.
// Highlighting a node recolours instance and vertex colours in place: unrelated nodes and links
// fade towards the background but keep their hue; the node's own links are redrawn as fat lines.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

export type SceneNode = { slug: string; category: string; degree: number; X: number; Y: number; Z: number }
export type SceneLink = { source: string; target: string; type: string }

type Opts = {
  nodes: SceneNode[]
  links: SceneLink[]
  background: string
  nodeColor: (category: string) => string
  linkColor: (type: string) => string
  onHover: (slug: string | null) => void
  onClick: (slug: string | null) => void
}

const HOME = new THREE.Vector3(0, 0, 1500)

export class NetworkScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private mesh: THREE.InstancedMesh
  private lines: THREE.LineSegments
  private fat: LineSegments2
  private fatMat: LineMaterial
  private ro: ResizeObserver
  private raf = 0
  private running = false
  private dirty = true
  private tween: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; start: number; ms: number } | null = null
  private index = new Map<string, number>()
  private radius: number[] = []
  private base: THREE.Color[] = []
  private bg: THREE.Color
  private hidden = new Set<string>()
  private linkOff = new Set<string>()
  private active: SceneLink[] = []
  private highlighted: string | null = null
  private hovered: string | null = null
  private pointer = new THREE.Vector2()
  private pointerDirty = false
  private down: { x: number; y: number } | null = null
  private raycaster = new THREE.Raycaster()
  private linkKey: (type: string) => string = (t) => t
  private listeners: [EventTarget, string, EventListener][] = []
  private neighbours = new Map<string, Set<string>>()
  private m = new THREE.Matrix4()
  private q = new THREE.Quaternion()
  private v = new THREE.Vector3()
  private s = new THREE.Vector3()
  private c = new THREE.Color()

  constructor(
    private el: HTMLElement,
    private o: Opts
  ) {
    this.bg = new THREE.Color(o.background)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1))
    this.renderer.setClearColor(this.bg)
    el.appendChild(this.renderer.domElement)
    this.renderer.domElement.style.display = 'block'

    this.camera = new THREE.PerspectiveCamera(50, 1, 1, 20000)
    this.camera.position.copy(HOME)
    this.scene.fog = new THREE.Fog(this.bg, 1400, 4200)
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.6))
    const sun = new THREE.DirectionalLight(0xffffff, 1.4)
    sun.position.set(0.6, 1, 0.8)
    this.scene.add(sun)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.autoRotateSpeed = 0.35
    this.controls.minDistance = 40
    this.controls.maxDistance = 5000
    this.controls.addEventListener('start', () => this.cancelTween())
    this.controls.addEventListener('change', () => this.wake())

    // Nodes
    const n = o.nodes.length
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial(), n)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    o.nodes.forEach((node, i) => {
      this.index.set(node.slug, i)
      // Same sizing the previous renderer used: radius ∝ cube root of (1 + √degree · 1.6).
      this.radius.push(3.2 * Math.cbrt(1 + Math.sqrt(node.degree) * 1.6))
      this.base.push(new THREE.Color(o.nodeColor(node.category)))
    })
    this.scene.add(this.mesh)

    // Links (one buffer, sized for all links; filters shrink the draw range)
    for (const l of o.links) {
      if (!this.neighbours.has(l.source)) this.neighbours.set(l.source, new Set())
      if (!this.neighbours.has(l.target)) this.neighbours.set(l.target, new Set())
      this.neighbours.get(l.source)!.add(l.target)
      this.neighbours.get(l.target)!.add(l.source)
    }
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(o.links.length * 6), 3).setUsage(THREE.DynamicDrawUsage))
    lg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(o.links.length * 6), 3).setUsage(THREE.DynamicDrawUsage))
    this.lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false }))
    this.scene.add(this.lines)

    // Fat lines for the highlighted node's own links
    this.fatMat = new LineMaterial({ linewidth: 2.2, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })
    this.fat = new LineSegments2(new LineSegmentsGeometry(), this.fatMat)
    this.fat.visible = false
    this.scene.add(this.fat)

    this.rebuild()

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(el)
    this.resize()

    const on = (t: EventTarget, type: string, fn: EventListener) => {
      t.addEventListener(type, fn, { passive: true })
      this.listeners.push([t, type, fn])
    }
    const canvas = this.renderer.domElement
    on(canvas, 'pointermove', (e) => {
      const ev = e as PointerEvent
      const r = canvas.getBoundingClientRect()
      this.pointer.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
      // No picking while orbiting (a button is held): the scene should follow the drag only.
      if (ev.buttons === 0) {
        this.pointerDirty = true
        this.wake()
      }
    })
    on(canvas, 'pointerleave', () => this.setHovered(null))
    on(canvas, 'pointerdown', (e) => {
      const ev = e as PointerEvent
      this.down = { x: ev.clientX, y: ev.clientY }
    })
    on(canvas, 'pointerup', (e) => {
      const ev = e as PointerEvent
      if (this.down && Math.hypot(ev.clientX - this.down.x, ev.clientY - this.down.y) < 5) this.o.onClick(this.pick())
      this.down = null
    })
    on(document, 'visibilitychange', () => (document.hidden ? this.stop() : this.wake()))
    this.wake()
  }

  // ---------------------------------------------------------------- data & colours

  setFilters(hiddenCategories: Set<string>, linkOff: Set<string>, linkKey: (type: string) => string) {
    this.hidden = hiddenCategories
    this.linkOff = linkOff
    this.linkKey = linkKey
    this.rebuild()
  }

  private visible = (slug: string) => {
    const i = this.index.get(slug)
    return i !== undefined && !this.hidden.has(this.o.nodes[i].category)
  }

  private rebuild() {
    this.o.nodes.forEach((node, i) => {
      const r = this.hidden.has(node.category) ? 0 : this.radius[i] * (node.slug === this.highlighted ? 1.45 : 1)
      this.m.compose(this.v.set(node.X, node.Y, node.Z), this.q, this.s.set(r, r, r))
      this.mesh.setMatrixAt(i, this.m)
    })
    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.computeBoundingSphere()
    this.active = this.o.links.filter((l) => this.visible(l.source) && this.visible(l.target) && !this.linkOff.has(this.linkKey(l.type)))
    const pos = this.lines.geometry.getAttribute('position') as THREE.BufferAttribute
    this.active.forEach((l, k) => {
      const a = this.o.nodes[this.index.get(l.source)!]
      const b = this.o.nodes[this.index.get(l.target)!]
      pos.setXYZ(k * 2, a.X, a.Y, a.Z)
      pos.setXYZ(k * 2 + 1, b.X, b.Y, b.Z)
    })
    pos.needsUpdate = true
    this.lines.geometry.setDrawRange(0, this.active.length * 2)
    this.lines.geometry.computeBoundingSphere()
    this.recolor()
  }

  /** Highlight a node and its neighbourhood (null clears). */
  highlight(slug: string | null) {
    if (slug === this.highlighted) return
    this.highlighted = slug
    this.rebuild()
  }

  private recolor() {
    const h = this.highlighted
    const near = h ? (this.neighbours.get(h) ?? new Set<string>()) : null
    this.o.nodes.forEach((node, i) => {
      this.c.copy(this.base[i])
      // Faded, not grey: keep the hue, sink towards the background.
      if (near && node.slug !== h && !near.has(node.slug)) this.c.lerp(this.bg, 0.72)
      this.mesh.setColorAt(i, this.c)
    })
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true

    const col = this.lines.geometry.getAttribute('color') as THREE.BufferAttribute
    const fatPos: number[] = []
    const fatCol: number[] = []
    this.active.forEach((l, k) => {
      this.c.set(this.o.linkColor(l.type))
      const mine = h && (l.source === h || l.target === h)
      if (h && !mine) this.c.lerp(this.bg, 0.8)
      col.setXYZ(k * 2, this.c.r, this.c.g, this.c.b)
      col.setXYZ(k * 2 + 1, this.c.r, this.c.g, this.c.b)
      if (mine) {
        const a = this.o.nodes[this.index.get(l.source)!]
        const b = this.o.nodes[this.index.get(l.target)!]
        fatPos.push(a.X, a.Y, a.Z, b.X, b.Y, b.Z)
        fatCol.push(this.c.r, this.c.g, this.c.b, this.c.r, this.c.g, this.c.b)
      }
    })
    col.needsUpdate = true
    ;(this.lines.material as THREE.LineBasicMaterial).opacity = h ? 0.4 : 0.5
    if (fatPos.length) {
      const g = new LineSegmentsGeometry()
      g.setPositions(fatPos)
      g.setColors(fatCol)
      this.fat.geometry.dispose()
      this.fat.geometry = g
      this.fat.visible = true
    } else this.fat.visible = false
    this.dirty = true
    this.wake()
  }

  // ---------------------------------------------------------------- camera

  setAutoRotate(on: boolean) {
    this.controls.autoRotate = on
    this.wake()
  }

  /** Fly to a node, keeping it centred with a little distance. */
  focus(slug: string, ms = 1100) {
    const i = this.index.get(slug)
    if (i === undefined) return
    const n = this.o.nodes[i]
    const target = new THREE.Vector3(n.X, n.Y, n.Z)
    const dir = this.camera.position.clone().sub(this.controls.target).normalize()
    this.flyTo(target.clone().add(dir.multiplyScalar(160)), target, ms)
  }

  zoom(f: number) {
    const t = this.controls.target
    const to = this.camera.position.clone().sub(t).multiplyScalar(f).add(t)
    this.flyTo(to, t.clone(), 380)
  }

  reset() {
    this.flyTo(HOME.clone(), new THREE.Vector3(), 900)
  }

  private flyTo(to: THREE.Vector3, target: THREE.Vector3, ms: number) {
    this.tween = { from: this.camera.position.clone(), to, tFrom: this.controls.target.clone(), tTo: target, start: performance.now(), ms }
    this.wake()
  }

  private cancelTween() {
    this.tween = null
  }

  // ---------------------------------------------------------------- loop

  private wake() {
    this.dirty = true
    if (this.running || document.hidden) return
    this.running = true
    this.raf = requestAnimationFrame(this.frame)
  }

  private stop() {
    cancelAnimationFrame(this.raf)
    this.running = false
  }

  private frame = (now: number) => {
    let moving = false
    if (this.tween) {
      const t = Math.min(1, (now - this.tween.start) / this.tween.ms)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      this.camera.position.lerpVectors(this.tween.from, this.tween.to, e)
      this.controls.target.lerpVectors(this.tween.tFrom, this.tween.tTo, e)
      if (t >= 1) this.tween = null
      moving = true
    }
    // update() applies damping and auto-rotate; it reports whether the camera moved.
    if (this.controls.update()) moving = true
    if (this.pointerDirty) {
      this.pointerDirty = false
      this.setHovered(this.pick())
    }
    if (moving || this.dirty) {
      this.renderer.render(this.scene, this.camera)
      this.dirty = false
    }
    // Keep going only while something moves; the next interaction wakes the loop again.
    if (moving || this.controls.autoRotate || this.tween) this.raf = requestAnimationFrame(this.frame)
    else this.running = false
  }

  private pick(): string | null {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = this.raycaster.intersectObject(this.mesh, false)[0]
    if (!hit || hit.instanceId === undefined) return null
    const node = this.o.nodes[hit.instanceId]
    return this.hidden.has(node.category) ? null : node.slug
  }

  private setHovered(slug: string | null) {
    if (slug === this.hovered) return
    this.hovered = slug
    this.renderer.domElement.style.cursor = slug ? 'pointer' : 'grab'
    this.o.onHover(slug)
  }

  private resize() {
    const w = this.el.clientWidth
    const h = this.el.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.fatMat.resolution.set(w, h)
    this.dirty = true
    this.wake()
  }

  dispose() {
    this.stop()
    this.ro.disconnect()
    for (const [t, type, fn] of this.listeners) t.removeEventListener(type, fn)
    this.controls.dispose()
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
    this.lines.geometry.dispose()
    ;(this.lines.material as THREE.Material).dispose()
    this.fat.geometry.dispose()
    this.fatMat.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
