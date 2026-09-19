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
uniform float uLean;uniform float uRoll;uniform float uHop;
// Wizard hat: mid and tip offsets of its spine (two-link spring chain) and a squash factor.
uniform vec2 uHatMid;uniform vec2 uHatTip;uniform float uHatSq;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdRBox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float sdCylX(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.yz),p.x))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
// Whole-body lean (pivot at the feet) and hop, then the head's own turn, nod and roll.
vec3 bodySpace(vec3 p){p.y-=uHop;p.y+=.85;p.xy=rot(uLean)*p.xy;p.y-=.85;return p;}
vec3 headSpace(vec3 p){p=bodySpace(p);p.y-=uBob;vec3 h=p-vec3(0.,.1,0.);h.xy=rot(uRoll)*h.xy;h.xz=rot(-uLook.x*.62)*h.xz;h.yz=rot(-uLook.y*.4)*h.yz;return h;}
vec2 map(vec3 p){
  vec3 bp=bodySpace(p)-vec3(0.,-.66+uBob*.6,0.);
  vec2 r=vec2(sdRBox(bp,vec3(.32,.19,.24),min(uRound*.55+.05,.18)),1.);
  vec3 h=headSpace(p);
  float head=sdRBox(h,vec3(.56,.44,.42),uRound);if(head<r.x)r=vec2(head,1.);
  float vis=sdRBox(h-vec3(0.,-.01,.37),vec3(.45,.3,.07),clamp(uRound*.8,.04,.26));if(vis<r.x)r=vec2(vis,2.);
  float ear=sdCylX(h,.15,.65);if(ear<r.x)r=vec2(ear,4.);
  // Wizard hat, sitting on the head: a drooping brim and a floppy cone whose spine is a
  // quadratic curve through the spring-driven mid and tip points.
  vec3 hp=h-vec3(0.,.455,0.);
  float br=length(hp.xz);
  float brimY=-.1*br*br+dot(hp.xz,uHatMid)*.25;
  vec2 bd=vec2(br-.68,abs(hp.y-brimY)-.013);
  float brim=(min(max(bd.x,bd.y),0.)+length(max(bd,0.))-.01)*.8;if(brim<r.x)r=vec2(brim,5.);
  float H=1.02*uHatSq*(1.-.55*length(uHatTip));
  float ht=clamp(hp.y/H,0.,1.);
  vec2 hc=2.*uHatMid-.5*uHatTip;
  vec2 ho=2.*(1.-ht)*ht*hc+ht*ht*uHatTip;
  float hr=mix(.36,.014,pow(ht,.72));
  float cone=max(length(hp.xz-ho)-hr,max(-hp.y,hp.y-H))*.62;if(cone<r.x)r=vec2(cone,5.);
  float band=max(length(hp.xz-ho)-(hr+.014),max(.02-hp.y,hp.y-.12))*.62;if(band<r.x)r=vec2(band,6.);
  float bob=length(hp-vec3(uHatTip.x,H,uHatTip.y))-.05;if(bob<r.x)r=vec2(bob,3.);
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
  vec3 ro=vec3(0.,.36,4.15),rd=normalize(vec3(uv*.34,-1.));
  float t=0.;vec2 hit=vec2(0.);
  for(int i=0;i<96;i++){vec2 m=map(ro+rd*t);if(m.x<.001){hit=vec2(t,m.y);break;}t+=m.x;if(t>6.)break;}
  if(hit.y<.5){float sc=1.-uHop*1.2;float s=exp(-pow(uv.x/(.35*sc),2.)-pow((uv.y+.86)/.05,2.))*.3*sc;gl_FragColor=vec4(0.,0.,0.,s);return;}
  vec3 p=ro+rd*hit.x,n=nrm(p),L=normalize(vec3(-.55,.8,.65));
  vec3 body=pow(uBody,vec3(2.2)),acc=pow(uAccent,vec3(2.2)),acc2=pow(uAccent2,vec3(2.2)),vis=pow(uVisor,vec3(2.2));
  float dif=max(dot(n,L),0.),amb=.5+.5*n.y,fre=pow(1.-max(dot(n,-rd),0.),3.);
  float spec=pow(max(dot(reflect(-L,n),-rd),0.),48.);
  float ao=clamp(map(p+n*.06).x/.06,0.,1.)*.4+.6;
  vec3 col;
  if(hit.y<1.5){col=body*(dif*.85+amb*.35)*ao+spec*.55+acc*fre*.55;}
  else if(hit.y<2.5){
    col=vis*(.35+.25*amb)+spec*.9+fre*.25*acc;
    vec3 h=headSpace(p);vec2 q=h.xy-vec2(0.,.02)-uLook*vec2(.12,.085);
    float d=min(eye(q-vec2(-.17,0.)),eye(q-vec2(.17,0.)));
    if(uState>3.5){float w=.03+.045*abs(sin(uTime*13.))*abs(sin(uTime*3.1));vec2 m=abs(q-vec2(0.,-.15))-vec2(w,.006);d=min(d,length(max(m,0.))-.01);}
    vec3 glow=mix(acc,vec3(1.),.35)*1.6;
    col+=glow*smoothstep(.006,-.004,d)+acc*exp(-max(d,0.)*38.)*.45;
  }
  else if(hit.y<3.5){float pulse=uState>.5&&uState<1.5?.6+.4*sin(uTime*10.):.8+.2*sin(uTime*2.);col=mix(acc,vec3(1.),.3)*(1.2*pulse)+spec;}
  else if(hit.y<4.5){col=acc2*(dif*.8+amb*.35)*ao+spec*.45+acc*fre*.3;}
  else if(hit.y<5.5){
    // Velvet: deep, theme-tinted cloth with a soft rim sheen and faint embroidered stars.
    vec3 cloth=mix(acc2,vec3(.05,.04,.16),.5);
    col=cloth*(dif*.75+amb*.35)*ao+mix(cloth,vec3(1.),.35)*pow(fre,.7)*.5+spec*.12;
    vec3 h=headSpace(p);vec3 hp=h-vec3(0.,.455,0.);float H=1.02*uHatSq*(1.-.55*length(uHatTip));float ht=clamp(hp.y/H,0.,1.);
    vec2 hc=2.*uHatMid-.5*uHatTip;vec2 ho=2.*(1.-ht)*ht*hc+ht*ht*uHatTip;
    vec2 g=vec2(atan(hp.z-ho.y,hp.x-ho.x)*1.3,ht*7.);vec2 id=floor(g),f=fract(g)-.5;
    float rnd=fract(sin(dot(id,vec2(12.9898,78.233)))*43758.5453);
    float star=rnd>.62&&hp.y>.13&&ht<.86?smoothstep(.12,.02,length(f*vec2(1.,1.3))):0.;
    col+=mix(acc,vec3(1.),.4)*star*(.7+.3*sin(uTime*2.+rnd*9.));
  }
  else{col=acc*(dif*.8+amb*.4)*ao+spec*.7+fre*.2;}
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
  // The shell is always the lighter of the theme's text and background tones (so it stays a
  // bright toy on light themes instead of turning black), nudged towards the accent; the visor is
  // always the darker one, so the glowing eyes keep their contrast.
  const lum = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  const [light, dark] = lum(fg) >= lum(bg) ? [fg, bg] : [bg, fg]
  const lightTheme = lum(bg) > lum(fg)
  // On a light page, a touch of grey keeps the shell from dissolving into the background.
  const body = light.map((c, i) => c * (lightTheme ? 0.8 : 0.86) + accent[i] * 0.14 - (lightTheme ? 0.02 : 0))
  const visor = dark.map((c) => c * (lightTheme ? 0.9 : 0.55))
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
    const u = { res: U('uRes'), time: U('uTime'), look: U('uLook'), body: U('uBody'), accent: U('uAccent'), visor: U('uVisor'), accent2: U('uAccent2'), round: U('uRound'), state: U('uState'), blink: U('uBlink'), bob: U('uBob'), lean: U('uLean'), roll: U('uRoll'), hop: U('uHop'), hatMid: U('uHatMid'), hatTip: U('uHatTip'), hatSq: U('uHatSq') }

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
    // Wizard hat: a two-link spring chain (mid, tip) in head space, plus a squash spring.
    // Rest shape: the tip flops back and to one side; gravity follows the head's tilt.
    const hat = { mx: 0.04, mz: -0.03, mvx: 0, mvz: 0, px: 0.3, pz: -0.14, pvx: 0, pvz: 0, sq: 1, sqv: 0 }
    let prevRoll = 0
    let prevLookY = 0
    let prevHopV = 0
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
    // Pointer left the window: look back at the viewer.
    const onLeave = () => {
      look.tx = 0
      look.ty = 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    const themeTimer = window.setInterval(() => (target = readTheme(resolve)), 400)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)

    const lerp = (a: number[], b: number[], k: number) => a.forEach((v, i) => (a[i] = v + (b[i] - v) * k))
    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) return
      if (ms - last < 1000 / 60) return
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
      const idle = ms - lastMove > 12000
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
      look.x += (tx - look.x) * Math.min(1, dt * 12)
      look.y += (Math.max(-1, Math.min(1, ty)) - look.y) * Math.min(1, dt * 12)
      look.vx = (look.x - prevX) / Math.max(dt, 1e-3)
      // Body leans towards the gaze, head rolls slightly into the turn (and wobbles when happy).
      const happyWiggle = m === 'happy' ? Math.sin(t * 9) * 0.08 : 0
      pose.lean += (-look.x * 0.16 - pose.lean) * Math.min(1, dt * 4)
      pose.roll += (-look.x * 0.14 + happyWiggle - pose.roll) * Math.min(1, dt * 6)
      // Hop: simple ballistic arc on click.
      hop.v -= 12 * dt
      hop.y = Math.max(0, hop.y + hop.v * dt)
      if (hop.y === 0 && hop.v < 0) hop.v = 0
      // Hat physics. Inertia pushes the cloth against the head's angular velocity (turn, nod,
      // roll); gravity, seen from the tilted head, pulls the rest shape sideways; the tip is a
      // second, softer spring hung from the middle, so it lags and whips.
      const rollV = (pose.roll + pose.lean - prevRoll) / Math.max(dt, 1e-3)
      const lookVY = (look.y - prevLookY) / Math.max(dt, 1e-3)
      prevRoll = pose.roll + pose.lean
      prevLookY = look.y
      const tilt = pose.roll + pose.lean
      const droop = m === 'sleep' ? 0.12 : 0
      const restMx = 0.04 + tilt * 0.35
      const restMz = -0.03 - droop * 0.4
      const restPx = 0.3 + tilt * 0.9
      const restPz = -0.14 - droop
      const fx = -look.vx * 0.22 - rollV * 0.35 + (m === 'happy' ? Math.sin(t * 9) * 0.6 : 0)
      const fz = lookVY * 0.16 + (m === 'talk' ? Math.sin(t * 17) * 0.5 : 0)
      hat.mvx += (-70 * (hat.mx - restMx) - 7 * hat.mvx + fx * 6) * dt
      hat.mvz += (-70 * (hat.mz - restMz) - 7 * hat.mvz + fz * 6) * dt
      hat.mx += hat.mvx * dt
      hat.mz += hat.mvz * dt
      const relX = hat.px - hat.mx - (restPx - restMx)
      const relZ = hat.pz - hat.mz - (restPz - restMz)
      hat.pvx += (-38 * relX - 3.2 * (hat.pvx - hat.mvx) + fx * 9) * dt
      hat.pvz += (-38 * relZ - 3.2 * (hat.pvz - hat.mvz) + fz * 9) * dt
      hat.px += hat.pvx * dt
      hat.pz += hat.pvz * dt
      const clampV = (v: number, k: number) => Math.max(-k, Math.min(k, v))
      hat.mx = clampV(hat.mx, 0.22)
      hat.mz = clampV(hat.mz, 0.22)
      hat.px = clampV(hat.px, 0.5)
      hat.pz = clampV(hat.pz, 0.5)
      // Squash on take-off, stretch in the air, a little bounce on landing.
      const hopA = (hop.v - prevHopV) / Math.max(dt, 1e-3)
      prevHopV = hop.v
      hat.sqv += (-160 * (hat.sq - 1) - 10 * hat.sqv - clampV(hopA, 60) * 0.05) * dt
      hat.sq = Math.max(0.8, Math.min(1.2, hat.sq + hat.sqv * dt))
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
      gl.uniform2f(u.hatMid, reduce ? 0.04 : hat.mx, reduce ? -0.03 : hat.mz)
      gl.uniform2f(u.hatTip, reduce ? 0.3 : hat.px, reduce ? -0.14 : hat.pz)
      gl.uniform1f(u.hatSq, reduce ? 1 : hat.sq)
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
      document.documentElement.removeEventListener('pointerleave', onLeave)
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
    <svg viewBox="0 -4 100 104" width={size} height={size} aria-hidden className={className}>
      <ellipse cx="50" cy="94" rx="22" ry="3" fill="black" opacity=".25" />
      <rect x="12" y="24" width="76" height="52" rx="14" fill="color-mix(in oklab, white 86%, var(--accent))" />
      {/* Wizard hat */}
      <path d="M30 25 Q44 10 50 3 Q58 0 66 6 Q58 8 56 12 Q60 20 70 25 Z" fill="var(--accent-2)" />
      <ellipse cx="50" cy="25" rx="31" ry="4" fill="var(--accent-2)" />
      <rect x="34" y="20" width="32" height="4" rx="2" fill="var(--accent)" />
      <circle cx="66" cy="6" r="3" fill="var(--accent)" />
      <rect x="20" y="33" width="60" height="34" rx="10" fill="#16161a" />
      {eyes}
      <rect x="34" y="78" width="32" height="12" rx="5" fill="color-mix(in oklab, white 86%, var(--accent))" />
    </svg>
  )
}
