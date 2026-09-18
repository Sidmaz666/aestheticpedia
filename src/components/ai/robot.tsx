'use client'

// A small raymarched 3D robot, drawn in one WebGL fragment shader (no 3D library). It reads
// the page's live theme — colours from --fg / --accent / --bg and corner roundness from the
// aesthetic's --r-scale — so it takes on every aesthetic you open, and eases between them.
import { useEffect, useRef, useState } from 'react'

export type RobotMood = 'idle' | 'think' | 'happy' | 'sleep' | 'talk'
const MOOD_ID: Record<RobotMood, number> = { idle: 0, think: 1, happy: 2, sleep: 3, talk: 4 }

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uLook;uniform vec3 uBody;uniform vec3 uAccent;uniform vec3 uVisor;uniform vec3 uAccent2;
uniform float uRound;uniform float uState;uniform float uBlink;uniform float uBob;
uniform float uLean;uniform float uRoll;uniform vec2 uAnt;uniform float uHop;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdRBox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float sdCap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float sdCylX(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.yz),p.x))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
// Whole-body lean (pivot at the feet) and hop, then the head's own turn, nod and roll.
vec3 bodySpace(vec3 p){p.y-=uHop;p.y+=.85;p.xy=rot(uLean)*p.xy;p.y-=.85;return p;}
vec3 headSpace(vec3 p){p=bodySpace(p);p.y-=uBob;vec3 h=p-vec3(0.,.1,0.);h.xy=rot(uRoll)*h.xy;h.xz=rot(uLook.x*.62)*h.xz;h.yz=rot(-uLook.y*.4)*h.yz;return h;}
vec2 map(vec3 p){
  vec3 bp=bodySpace(p)-vec3(0.,-.66+uBob*.6,0.);
  vec2 r=vec2(sdRBox(bp,vec3(.32,.19,.24),min(uRound*.55+.05,.18)),1.);
  vec3 h=headSpace(p);
  float head=sdRBox(h,vec3(.56,.44,.42),uRound);if(head<r.x)r=vec2(head,1.);
  float vis=sdRBox(h-vec3(0.,-.01,.37),vec3(.45,.3,.07),clamp(uRound*.8,.04,.26));if(vis<r.x)r=vec2(vis,2.);
  float ear=sdCylX(h,.15,.65);if(ear<r.x)r=vec2(ear,4.);
  // Antenna: a spring-driven tip (uAnt) so it wobbles as the head moves.
  vec3 tip=vec3(uAnt.x,.64,uAnt.y);
  float st=sdCap(h,vec3(0.,.44,0.),tip,.024);if(st<r.x)r=vec2(st,4.);
  float bl=length(h-(tip+vec3(uAnt.x*.25,.05,uAnt.y*.25)))-.072;if(bl<r.x)r=vec2(bl,3.);
  return r;
}
vec3 nrm(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
float eye(vec2 q){
  if(uState>.5&&uState<1.5){q.x+=.045*sin(uTime*5.);vec2 d=abs(q)-vec2(.05,.018);return length(max(d,0.))-.02;}
  if(uState>1.5&&uState<2.5){float r=length(q-vec2(0.,-.045));return max(abs(r-.075)-.02,-(q.y+.02));}
  if(uState>2.5&&uState<3.5){vec2 d=abs(q-vec2(0.,-.02))-vec2(.065,.003);return length(max(d,0.))-.011;}
  float h=mix(.075,.006,uBlink);vec2 d=abs(q)-vec2(.036,h);return length(max(d,0.))-.03;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y*2.;
  vec3 ro=vec3(0.,0.,3.4),rd=normalize(vec3(uv*.34,-1.));
  float t=0.;vec2 hit=vec2(0.);
  for(int i=0;i<72;i++){vec2 m=map(ro+rd*t);if(m.x<.001){hit=vec2(t,m.y);break;}t+=m.x;if(t>6.)break;}
  if(hit.y<.5){float sc=1.-uHop*1.2;float s=exp(-pow(uv.x/(.42*sc),2.)-pow((uv.y+.93)/.055,2.))*.3*sc;gl_FragColor=vec4(0.,0.,0.,s);return;}
  vec3 p=ro+rd*hit.x,n=nrm(p),L=normalize(vec3(-.55,.8,.65));
  vec3 body=pow(uBody,vec3(2.2)),acc=pow(uAccent,vec3(2.2)),acc2=pow(uAccent2,vec3(2.2)),vis=pow(uVisor,vec3(2.2));
  float dif=max(dot(n,L),0.),amb=.5+.5*n.y,fre=pow(1.-max(dot(n,-rd),0.),3.);
  float spec=pow(max(dot(reflect(-L,n),-rd),0.),48.);
  float ao=clamp(map(p+n*.06).x/.06,0.,1.)*.4+.6;
  vec3 col;
  if(hit.y<1.5){col=body*(dif*.85+amb*.35)*ao+spec*.55+acc*fre*.55;}
  else if(hit.y<2.5){
    col=vis*(.35+.25*amb)+spec*.9+fre*.25*acc;
    vec3 h=headSpace(p);vec2 q=h.xy-vec2(0.,.02)-uLook*vec2(.1,.075);
    float d=min(eye(q-vec2(-.17,0.)),eye(q-vec2(.17,0.)));
    if(uState>3.5){float w=.03+.045*abs(sin(uTime*13.))*abs(sin(uTime*3.1));vec2 m=abs(q-vec2(0.,-.15))-vec2(w,.006);d=min(d,length(max(m,0.))-.01);}
    vec3 glow=mix(acc,vec3(1.),.35)*1.6;
    col+=glow*smoothstep(.006,-.004,d)+acc*exp(-max(d,0.)*38.)*.45;
  }
  else if(hit.y<3.5){float pulse=uState>.5&&uState<1.5?.6+.4*sin(uTime*10.):.8+.2*sin(uTime*2.);col=mix(acc,vec3(1.),.3)*(1.2*pulse)+spec;}
  else{col=acc2*(dif*.8+amb*.35)*ao+spec*.45+acc*fre*.3;}
  col=pow(col,vec3(1./2.2));
  gl_FragColor=vec4(col,1.);
}`

type Colors = { body: number[]; accent: number[]; accent2: number[]; visor: number[]; round: number }

/** Resolve CSS colour strings (any syntax, incl. color-mix/oklch) to 0–1 RGB via a 1×1 canvas. */
function makeResolver() {
  const c = document.createElement('canvas')
  c.width = c.height = 1
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  return (css: string, fallback: number[]) => {
    try {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = css
      ctx.fillRect(0, 0, 1, 1)
      const d = ctx.getImageData(0, 0, 1, 1).data
      return [d[0] / 255, d[1] / 255, d[2] / 255]
    } catch {
      return fallback
    }
  }
}

/** Read the theme that is visible right now (an open aesthetic overlay has its own). */
function readTheme(resolve: ReturnType<typeof makeResolver>): Colors {
  const scope = (document.getElementById('aesthetic-modal') ?? document.documentElement) as HTMLElement
  const probe = document.createElement('span')
  probe.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden'
  scope.appendChild(probe)
  const get = (v: string) => {
    probe.style.color = `var(${v})`
    return getComputedStyle(probe).color
  }
  const fg = resolve(get('--fg'), [0.95, 0.94, 0.92])
  const accent = resolve(get('--accent'), [0.89, 0.73, 0.43])
  const accent2 = resolve(get('--accent-2'), [0.5, 0.65, 0.79])
  const bg = resolve(get('--bg'), [0.04, 0.04, 0.05])
  const rs = parseFloat(getComputedStyle(scope).getPropertyValue('--r-scale')) || 1
  probe.remove()
  // Body: the foreground tone nudged towards the accent so it reads as "this aesthetic's" robot.
  const body = fg.map((c, i) => c * 0.86 + accent[i] * 0.14)
  const visor = bg.map((c) => c * 0.55)
  return { body, accent, accent2, visor, round: Math.max(0.06, Math.min(0.4, 0.07 + rs * 0.13)) }
}

export function Robot({ mood, className, size = 76 }: { mood: RobotMood; className?: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const moodRef = useRef(mood)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    moodRef.current = mood
  }, [mood])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false })
    if (!gl || gl.isContextLost()) {
      setFailed(true)
      return
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    const U = (n: string) => gl.getUniformLocation(prog, n)
    const u = { res: U('uRes'), time: U('uTime'), look: U('uLook'), body: U('uBody'), accent: U('uAccent'), visor: U('uVisor'), accent2: U('uAccent2'), round: U('uRound'), state: U('uState'), blink: U('uBlink'), bob: U('uBob'), lean: U('uLean'), roll: U('uRoll'), ant: U('uAnt'), hop: U('uHop') }

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const resolve = makeResolver()
    let target = readTheme(resolve)
    const cur = structuredClone(target)
    const look = { x: 0, y: 0, tx: 0, ty: 0, vx: 0 }
    const pose = { lean: 0, roll: 0 }
    // Antenna tip: a damped spring pushed by head motion.
    const ant = { x: 0, z: 0, vx: 0, vz: 0 }
    const hop = { y: 0, v: 0 }
    let blink = 0
    let nextBlink = 2 + Math.random() * 3
    let lastMove = performance.now()
    let glance = { x: 0, y: 0, until: 0 }
    let scrollLook = 0
    let lastScroll = window.scrollY
    let raf = 0
    let last = 0
    let visible = true

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      // Near the robot it looks almost straight at the pointer; far away it turns fully.
      const k = Math.min(1, d / 360)
      look.tx = (dx / d) * k
      look.ty = (-dy / d) * k
      lastMove = performance.now()
    }
    const onScroll = () => {
      const y = window.scrollY
      scrollLook = Math.max(-1, Math.min(1, scrollLook + (lastScroll - y) / 300))
      lastScroll = y
    }
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && !reduce) hop.v = 1.9
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    const themeTimer = window.setInterval(() => (target = readTheme(resolve)), 400)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)

    const lerp = (a: number[], b: number[], k: number) => a.forEach((v, i) => (a[i] = v + (b[i] - v) * k))
    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) return
      if (ms - last < 1000 / 45) return
      const dt = Math.min(0.1, (ms - last) / 1000)
      last = ms
      const t = ms / 1000
      const m = moodRef.current
      lerp(cur.body, target.body, 0.08)
      lerp(cur.accent, target.accent, 0.08)
      lerp(cur.visor, target.visor, 0.08)
      lerp(cur.accent2, target.accent2, 0.08)
      cur.round += (target.round - cur.round) * 0.08
      // Gaze: the pointer; when it has been still for a while, glance around; scrolling
      // pulls the gaze up or down; thinking looks up and aside; sleeping droops.
      const idle = ms - lastMove > 3500
      if (idle && ms > glance.until) glance = { x: (Math.random() * 2 - 1) * 0.8, y: Math.random() * 0.8 - 0.2, until: ms + 1400 + Math.random() * 2200 }
      scrollLook *= Math.pow(0.1, dt)
      let tx = idle ? glance.x : look.tx
      let ty = (idle ? glance.y : look.ty) + scrollLook * 0.7
      if (m === 'think') {
        tx = Math.sin(t * 0.8) * 0.45
        ty = 0.45
      } else if (m === 'sleep') {
        tx = 0
        ty = -0.4
      }
      const prevX = look.x
      look.x += (tx - look.x) * Math.min(1, dt * 7)
      look.y += (Math.max(-1, Math.min(1, ty)) - look.y) * Math.min(1, dt * 7)
      look.vx = (look.x - prevX) / Math.max(dt, 1e-3)
      // Body leans towards the gaze, head rolls slightly into the turn (and wobbles when happy).
      const happyWiggle = m === 'happy' ? Math.sin(t * 9) * 0.08 : 0
      pose.lean += (-look.x * 0.16 - pose.lean) * Math.min(1, dt * 4)
      pose.roll += (-look.x * 0.14 + happyWiggle - pose.roll) * Math.min(1, dt * 6)
      // Antenna spring, driven by the head's angular velocity.
      ant.vx += (-60 * ant.x - 5 * ant.vx - look.vx * 1.2) * dt
      ant.vz += (-60 * ant.z - 5 * ant.vz + (m === 'talk' ? Math.sin(t * 20) * 4 : 0)) * dt
      ant.x = Math.max(-0.14, Math.min(0.14, ant.x + ant.vx * dt))
      ant.z = Math.max(-0.14, Math.min(0.14, ant.z + ant.vz * dt))
      // Hop: simple ballistic arc on click.
      hop.v -= 12 * dt
      hop.y = Math.max(0, hop.y + hop.v * dt)
      if (hop.y === 0 && hop.v < 0) hop.v = 0
      nextBlink -= dt
      if (nextBlink < 0) {
        blink = 1
        nextBlink = 2.5 + Math.random() * 4
      }
      blink = Math.max(0, blink - dt * 7)
      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.time, t)
      gl.uniform2f(u.look, look.x, look.y)
      gl.uniform3fv(u.body, cur.body)
      gl.uniform3fv(u.accent, cur.accent)
      gl.uniform3fv(u.visor, cur.visor)
      gl.uniform3fv(u.accent2, cur.accent2)
      gl.uniform1f(u.round, cur.round)
      gl.uniform1f(u.state, MOOD_ID[m])
      gl.uniform1f(u.blink, blink > 0.5 ? 1 : blink * 2)
      gl.uniform1f(u.bob, reduce ? 0 : Math.sin(t * (m === 'sleep' ? 0.9 : 1.8)) * (m === 'sleep' ? 0.015 : 0.035))
      gl.uniform1f(u.lean, reduce ? 0 : pose.lean)
      gl.uniform1f(u.roll, reduce ? 0 : pose.roll)
      gl.uniform2f(u.ant, reduce ? 0 : ant.x, reduce ? 0 : ant.z)
      gl.uniform1f(u.hop, hop.y)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(themeTimer)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('pointerdown', onDown)
      // Free GPU objects but keep the context: React may remount on the same canvas.
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [size])

  if (failed) return <FlatRobot mood={mood} size={size} className={className} />
  return <canvas ref={ref} aria-hidden className={className} style={{ width: size, height: size }} />
}

/** Flat SVG stand-in for browsers without WebGL; same theme tokens, same moods. */
function FlatRobot({ mood, size, className }: { mood: RobotMood; size: number; className?: string }) {
  const eyes =
    mood === 'sleep' ? (
      <g stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"><path d="M33 50h10M57 50h10" /></g>
    ) : mood === 'happy' ? (
      <g stroke="var(--accent)" strokeWidth="4" fill="none" strokeLinecap="round"><path d="M32 53q6-8 12 0M56 53q6-8 12 0" /></g>
    ) : (
      <g fill="var(--accent)"><rect x="34" y="42" width="8" height="14" rx="4" /><rect x="58" y="42" width="8" height="14" rx="4" /></g>
    )
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={className}>
      <ellipse cx="50" cy="94" rx="22" ry="3" fill="black" opacity=".25" />
      <line x1="50" y1="14" x2="50" y2="24" stroke="var(--fg)" strokeWidth="2.5" />
      <circle cx="50" cy="12" r="4" fill="var(--accent)" />
      <rect x="12" y="24" width="76" height="52" rx="14" fill="var(--fg)" />
      <rect x="20" y="33" width="60" height="34" rx="10" fill="var(--bg)" />
      {eyes}
      <rect x="34" y="78" width="32" height="12" rx="5" fill="var(--fg)" opacity=".85" />
    </svg>
  )
}
