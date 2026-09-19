'use client'

// The "Listen" player: a themed audio deck for a record's freely licensed recordings.
// Playback and analysis come from react-audio-canvas (`useAudio`, `detectNote`); the
// visualizers, waveform scrubber, readouts and controls are drawn here in the record's palette.
import '@/lib/react-audio-canvas-shim'
import { detectNote, useAudio } from 'react-audio-canvas'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import {
  Activity,
  AudioLines,
  CircleDot,
  Download,
  ExternalLink,
  Loader2,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { AudioEntry } from '@/lib/aesthetic'

type Mode = 'spectrum' | 'radial' | 'scope'
const MODES: { id: Mode; label: string; Icon: typeof Activity }[] = [
  { id: 'spectrum', label: 'Spectrum', Icon: AudioLines },
  { id: 'radial', label: 'Radial', Icon: CircleDot },
  { id: 'scope', label: 'Oscilloscope', Icon: Activity },
]

/** Assign properties on a browser object (media element, analyser, media session) owned outside React. */
function setMedia<T extends object>(target: T, patch: Partial<T>) {
  Object.assign(target, patch)
}

export function fmtTime(s: number) {
  if (!Number.isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/** Commons also serves an MP3 transcode of every Ogg/FLAC upload — used where the browser can't decode the original. */
function playableUrl(t: AudioEntry) {
  const url = t.url.replace(/\?.*$/, '')
  const test = typeof document === 'undefined' ? null : document.createElement('audio')
  const can = (type: string) => !!test && test.canPlayType(type) !== ''
  const needsMp3 = (/ogg/.test(t.mime) && !can('audio/ogg; codecs="vorbis"')) || (/flac/.test(t.mime) && !can('audio/flac'))
  const m = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(.+\/([^/]+))$/)
  return needsMp3 && m ? `https://upload.wikimedia.org/wikipedia/commons/transcoded/${m[1]}/${m[2]}.mp3` : url
}

export function AudioDeck({ tracks, name }: { tracks: AudioEntry[]; name: string }) {
  const [index, setIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [mode, setMode] = useState<Mode>('spectrum')
  const [volume, setVolume] = useState(80)
  const [muted, setMuted] = useState(false)
  const [loop, setLoop] = useState(false)
  const [playing, setPlaying] = useState(false)
  const go = (i: number, play = true) => {
    setIndex((i + tracks.length) % tracks.length)
    setAutoPlay(play)
  }
  const track = tracks[index]
  return (
    <div className="overflow-hidden rounded-[calc(1.25rem*var(--r-scale,1))] border border-line bg-surface">
      <TrackPlayer
        key={track.url}
        track={track}
        name={name}
        position={tracks.length > 1 ? `${index + 1} / ${tracks.length}` : null}
        autoPlay={autoPlay}
        mode={mode}
        onMode={setMode}
        volume={volume}
        muted={muted}
        onVolume={(v) => {
          setVolume(v)
          setMuted(v === 0)
        }}
        onMute={() => setMuted((m) => !m)}
        loop={loop}
        onLoop={() => setLoop((l) => !l)}
        onPrev={tracks.length > 1 ? () => go(index - 1) : undefined}
        onNext={tracks.length > 1 ? () => go(index + 1) : undefined}
        onEnded={() => index < tracks.length - 1 && go(index + 1)}
        onPlayingChange={setPlaying}
      />
      {tracks.length > 1 && (
        <ol className="max-h-72 overflow-y-auto border-t border-line p-2" aria-label="Recordings">
          {tracks.map((t, i) => {
            const current = i === index
            return (
              <li key={t.url}>
                <button
                  type="button"
                  onClick={() => (current ? undefined : go(i))}
                  aria-current={current ? 'true' : undefined}
                  className={`grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-[calc(0.75rem*var(--r-scale,1))] px-3 py-2.5 text-left text-sm transition-colors ${
                    current ? 'bg-accent-soft text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                  }`}
                >
                  <span className="grid place-items-center font-mono text-xs text-fg-subtle">
                    {current && playing ? <EqBars /> : String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">{t.title}</span>
                    {t.artist && <span className="block truncate text-xs text-fg-subtle">{t.artist}</span>}
                  </span>
                  <span className="font-mono text-xs text-fg-subtle">{t.duration ? fmtTime(t.duration) : ''}</span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

function EqBars() {
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-label="Playing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="eq-bar w-[3px] rounded-full bg-accent" style={{ animationDelay: `${i * -0.28}s` }} />
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------------

type PlayerProps = {
  track: AudioEntry
  name: string
  position: string | null
  autoPlay: boolean
  mode: Mode
  onMode: (m: Mode) => void
  volume: number
  muted: boolean
  onVolume: (v: number) => void
  onMute: () => void
  loop: boolean
  onLoop: () => void
  onPrev?: () => void
  onNext?: () => void
  onEnded: () => void
  onPlayingChange: (p: boolean) => void
}

function TrackPlayer(p: PlayerProps) {
  const { track } = p
  const [blob, setBlob] = useState<Blob | null>(null)
  const [loadState, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [peaks, setPeaks] = useState<Float32Array | null>(null)
  const [duration, setDuration] = useState(track.duration ?? 0)
  const [playing, setPlaying] = useState(false)
  const [readout, setReadout] = useState<{ pitch: string; bright: string; level: number }>({ pitch: '—', bright: '—', level: 0 })
  const audio = useAudio(blob, 2048)
  const wantPlay = useRef(false)
  const live = useRef(audio)
  useEffect(() => {
    live.current = audio
  })

  // One download serves playback (as a Blob, so the analyser is never CORS-blocked) and the waveform.
  const started = useRef(false)
  const load = useCallback(async () => {
    if (started.current) return
    started.current = true
    setStatus('loading')
    try {
      const res = await fetch(playableUrl(track))
      if (!res.ok) throw new Error(String(res.status))
      const b = await res.blob()
      setBlob(b)
      try {
        const decoded = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await b.arrayBuffer())
        setDuration(decoded.duration)
        setPeaks(computePeaks(decoded, 480))
      } catch {
        /* the waveform is optional; playback still works */
      }
    } catch {
      setStatus('error')
    }
  }, [track])

  const toggle = () => {
    const a = live.current
    void a.audioContext?.resume()
    if (!a.audioNode) {
      wantPlay.current = true
      void load()
      return
    }
    if (a.audioNode.paused) a.play()
    else a.pause()
  }

  // Next/previous track: start as soon as the new recording is in.
  const autoPlay = useRef(p.autoPlay)
  useEffect(() => {
    if (!autoPlay.current) return
    wantPlay.current = true
    queueMicrotask(() => void load())
  }, [load])

  // Once the library has built the element: follow its real state, apply volume/loop, start if asked.
  const node = audio.audioNode
  const status = node ? 'ready' : loadState
  useEffect(() => {
    if (!node) return
    const on = () => setPlaying(true)
    const off = () => setPlaying(false)
    const ended = () => {
      setPlaying(false)
      p.onEnded()
    }
    const meta = () => Number.isFinite(node.duration) && setDuration(node.duration)
    node.addEventListener('playing', on)
    node.addEventListener('pause', off)
    node.addEventListener('ended', ended)
    node.addEventListener('loadedmetadata', meta)
    if (wantPlay.current) {
      wantPlay.current = false
      live.current.play()
    }
    return () => {
      node.removeEventListener('playing', on)
      node.removeEventListener('pause', off)
      node.removeEventListener('ended', ended)
      node.removeEventListener('loadedmetadata', meta)
    }
  }, [node])
  useEffect(() => {
    if (node) setMedia(node, { volume: p.muted ? 0 : p.volume / 100 })
  }, [node, p.volume, p.muted])
  useEffect(() => {
    if (node) setMedia(node, { loop: p.loop })
  }, [node, p.loop])
  const { onPlayingChange } = p
  useEffect(() => onPlayingChange(playing), [playing, onPlayingChange])
  useEffect(() => {
    if (audio.analyzer) setMedia(audio.analyzer, { smoothingTimeConstant: 0.8 })
  }, [audio.analyzer])
  // Leaving the track: stop the sound and free its audio graph.
  useEffect(
    () => () => {
      live.current.audioNode?.pause()
      void live.current.audioContext?.close().catch(() => {})
    },
    []
  )

  const seek = useCallback(
    (t: number) => {
      if (!node) return
      setMedia(node, { currentTime: Math.max(0, Math.min(t, (Number.isFinite(node.duration) ? node.duration : duration) - 0.05)) })
    },
    [node, duration]
  )

  // System media controls (lock screen, keyboard media keys, headphones).
  useEffect(() => {
    if (!('mediaSession' in navigator) || !playing) return
    const ms = navigator.mediaSession
    setMedia(ms, { metadata: new MediaMetadata({ title: track.title, artist: track.artist ?? '', album: `${p.name} — Aestheticpedia` }) })
    const set = (a: MediaSessionAction, h: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(a, h)
      } catch {
        /* unsupported action */
      }
    }
    set('play', () => live.current.play())
    set('pause', () => live.current.pause())
    set('seekbackward', () => node && seek(node.currentTime - 10))
    set('seekforward', () => node && seek(node.currentTime + 10))
    set('previoustrack', p.onPrev ?? null)
    set('nexttrack', p.onNext ?? null)
    return () => {
      for (const a of ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack'] as MediaSessionAction[]) set(a, null)
    }
  }, [playing, track, p.name, p.onPrev, p.onNext, node, seek])

  const time = audio.audioCurrentTime
  const meta = [track.artist, track.license].filter(Boolean).join(' · ')

  return (
    <div>
      {/* Visualizer — the whole stage toggles playback */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        className="group relative block h-56 w-full overflow-hidden bg-[color-mix(in_oklab,var(--bg)_70%,var(--surface))] sm:h-64"
      >
        <Visualizer analyser={audio.analyzer} sampleRate={audio.audioContext?.sampleRate ?? 44100} playing={playing} mode={p.mode} onReadout={setReadout} />
        {!playing && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-accent text-accent-fg shadow-[0_10px_40px_-8px_var(--accent)] transition-transform duration-300 group-hover:scale-105">
              {status === 'loading' ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <Play className="ml-1 size-6 fill-current" aria-hidden />}
            </span>
          </span>
        )}
        <span className="pointer-events-none absolute left-4 top-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">
          {playing && <span className="size-1.5 animate-pulse rounded-full bg-accent" />}
          {playing ? 'Live analysis' : status === 'loading' ? 'Loading…' : status === 'ready' ? 'Paused' : 'Press play to analyse'}
        </span>
      </button>

      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Now playing{p.position ? ` · ${p.position}` : ''}</p>
            <p className="display mt-1 truncate text-2xl text-fg sm:text-3xl">{track.title}</p>
            <p className="mt-1 text-xs text-fg-subtle">
              {meta && <>{meta} · </>}
              <a href={track.pageUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                {track.source}
              </a>
            </p>
          </div>
          {/* Measured from the signal as it plays */}
          <dl className="grid grid-cols-3 gap-5 font-mono text-xs">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-fg-subtle">Pitch</dt>
              <dd className="mt-1 text-fg">{playing ? readout.pitch : '—'}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-fg-subtle">Brightness</dt>
              <dd className="mt-1 text-fg">{playing ? readout.bright : '—'}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-fg-subtle">Level</dt>
              <dd className="mt-1.5 flex h-2 w-16 overflow-hidden rounded-full bg-surface-2" aria-label={`${Math.round((playing ? readout.level : 0) * 100)}%`}>
                <span className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${(playing ? readout.level : 0) * 100}%` }} />
              </dd>
            </div>
          </dl>
        </div>

        <Scrubber node={node} peaks={peaks} duration={duration} playing={playing} onSeek={seek} disabled={status !== 'ready'} />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div className="flex items-center gap-1.5">
            {p.onPrev && <IconButton label="Previous recording" onClick={p.onPrev} Icon={SkipBack} />}
            <IconButton label="Back 10 seconds" onClick={() => node && seek(node.currentTime - 10)} Icon={RotateCcw} disabled={!node} />
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              className="mx-1 grid size-12 place-items-center rounded-full bg-fg text-bg transition-transform hover:scale-105 active:scale-95"
            >
              {status === 'loading' ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : playing ? (
                <Pause className="size-5 fill-current" aria-hidden />
              ) : (
                <Play className="ml-0.5 size-5 fill-current" aria-hidden />
              )}
            </button>
            <IconButton label="Forward 10 seconds" onClick={() => node && seek(node.currentTime + 10)} Icon={RotateCw} disabled={!node} />
            {p.onNext && <IconButton label="Next recording" onClick={p.onNext} Icon={SkipForward} />}
            <span className="ml-2 font-mono text-xs tabular-nums text-fg-muted">
              {fmtTime(time)} <span className="text-fg-subtle">/ {fmtTime(duration)}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div role="radiogroup" aria-label="Visualizer" className="flex rounded-full border border-line p-0.5">
              {MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={p.mode === id}
                  aria-label={label}
                  title={label}
                  onClick={() => p.onMode(id)}
                  className={`grid size-8 place-items-center rounded-full transition-colors ${p.mode === id ? 'bg-accent text-accent-fg' : 'text-fg-muted hover:text-fg'}`}
                >
                  <Icon className="size-4" aria-hidden />
                </button>
              ))}
            </div>
            <IconButton label={p.loop ? 'Loop on' : 'Loop off'} onClick={p.onLoop} Icon={Repeat} pressed={p.loop} />
            <div className="flex items-center gap-1">
              <IconButton
                label={p.muted ? 'Unmute' : 'Mute'}
                onClick={p.onMute}
                Icon={p.muted || p.volume === 0 ? VolumeX : p.volume < 50 ? Volume1 : Volume2}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={p.muted ? 0 : p.volume}
                onChange={(e) => p.onVolume(Number(e.target.value))}
                aria-label="Volume"
                className="audio-range w-20 sm:w-24"
                style={{ ['--pct' as string]: `${p.muted ? 0 : p.volume}%` }}
              />
            </div>
            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download the original recording"
              title="Original file"
              className="grid size-9 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Download className="size-4" aria-hidden />
            </a>
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-4 rounded-[calc(0.75rem*var(--r-scale,1))] border border-line bg-surface-2 p-3 text-sm text-fg-muted">
            The analyser couldn’t load this file, so here is the browser’s own player.{' '}
            <a href={track.pageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-fg underline-offset-4 hover:underline">
              Open on Commons <ExternalLink className="size-3" aria-hidden />
            </a>
            <audio controls preload="none" src={track.url} className="mt-3 w-full" />
          </div>
        )}
      </div>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  Icon,
  disabled,
  pressed,
}: {
  label: string
  onClick: () => void
  Icon: typeof Play
  disabled?: boolean
  pressed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`grid size-9 place-items-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-35 ${
        pressed ? 'bg-accent-soft text-accent' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
      }`}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Waveform scrubber: real peaks of the decoded file; played part in the accent colour.

function computePeaks(buf: AudioBuffer, n: number) {
  const data = buf.getChannelData(0)
  const step = Math.max(1, Math.floor(data.length / n))
  const out = new Float32Array(n)
  let max = 0
  for (let i = 0; i < n; i++) {
    let peak = 0
    for (let j = i * step, end = Math.min(data.length, j + step); j < end; j += 4) peak = Math.max(peak, Math.abs(data[j]))
    out[i] = peak
    max = Math.max(max, peak)
  }
  if (max > 0) for (let i = 0; i < n; i++) out[i] /= max
  return out
}

function cssVar(el: Element, name: string, fallback: string) {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback
}

function Scrubber({
  node,
  peaks,
  duration,
  playing,
  onSeek,
  disabled,
}: {
  node: HTMLAudioElement | null
  peaks: Float32Array | null
  duration: number
  playing: boolean
  onSeek: (t: number) => void
  disabled: boolean
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const dragging = useRef(false)
  const [, force] = useState(0)

  const draw = useCallback(() => {
    const c = canvas.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    const w = c.clientWidth
    const h = c.clientHeight
    if (c.width !== Math.round(w * dpr)) c.width = Math.round(w * dpr)
    if (c.height !== Math.round(h * dpr)) c.height = Math.round(h * dpr)
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const played = node && duration ? node.currentTime / duration : 0
    const accent = cssVar(c, '--accent', '#888')
    const muted = cssVar(c, '--line-strong', '#8884')
    const gap = 2
    const bw = 2
    const count = Math.floor(w / (bw + gap))
    for (let i = 0; i < count; i++) {
      const v = peaks ? peaks[Math.floor((i / count) * peaks.length)] : 0.08
      const bh = Math.max(2, v * (h - 4))
      const x = i * (bw + gap)
      ctx.fillStyle = i / count <= played ? accent : muted
      ctx.beginPath()
      ctx.roundRect(x, (h - bh) / 2, bw, bh, 1)
      ctx.fill()
    }
    if (hover !== null) {
      ctx.fillStyle = cssVar(c, '--fg', '#fff')
      ctx.fillRect(Math.round(hover * w), 0, 1, h)
    }
  }, [node, peaks, duration, hover])

  useEffect(() => {
    draw()
    if (!playing) return
    let raf = 0
    const tick = () => {
      draw()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [draw, playing])
  useEffect(() => {
    const ro = new ResizeObserver(() => draw())
    if (canvas.current) ro.observe(canvas.current)
    return () => ro.disconnect()
  }, [draw])

  const at = (e: ReactPointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  }
  const cur = node?.currentTime ?? 0
  const onKey = (e: KeyboardEvent) => {
    const d = { ArrowLeft: -5, ArrowRight: 5, PageDown: -15, PageUp: 15 }[e.key]
    if (d !== undefined) onSeek(cur + d)
    else if (e.key === 'Home') onSeek(0)
    else if (e.key === 'End') onSeek(duration)
    else return
    e.preventDefault()
    force((n) => n + 1)
  }

  return (
    <div className="relative mt-5">
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Seek"
        aria-disabled={disabled}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(cur)}
        aria-valuetext={`${fmtTime(cur)} of ${fmtTime(duration)}`}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          if (disabled) return
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          onSeek(at(e) * duration)
        }}
        onPointerMove={(e) => {
          const f = at(e)
          setHover(f)
          if (dragging.current) onSeek(f * duration)
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => setHover(null)}
        className={`relative h-14 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <canvas ref={canvas} className="size-full" aria-hidden />
      </div>
      {hover !== null && !disabled && (
        <span
          className="pointer-events-none absolute -top-6 -translate-x-1/2 rounded bg-fg px-1.5 py-0.5 font-mono text-[10px] text-bg"
          style={{ left: `${hover * 100}%` }}
        >
          {fmtTime(hover * duration)}
        </span>
      )}
      {disabled && !peaks && <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-fg-subtle">Waveform appears once the recording loads</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live visualizers, drawn from the analyser in the record's own colours.

const BANDS = 72

function Visualizer({
  analyser,
  sampleRate,
  playing,
  mode,
  onReadout,
}: {
  analyser: AnalyserNode | null
  sampleRate: number
  playing: boolean
  mode: Mode
  onReadout: (r: { pitch: string; bright: string; level: number }) => void
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const state = useRef({ bands: new Float32Array(BANDS), peaks: new Float32Array(BANDS), spin: 0, lastReadout: 0 })

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const freq = analyser ? new Uint8Array(analyser.frequencyBinCount) : null
    const wave = analyser ? new Uint8Array(analyser.fftSize) : null
    let raf = 0
    let settle = 0
    let colors = { accent: '#888', accent2: '#aaa', fg: '#fff', bg: '#000' }
    let colorAge = 99

    const frame = (now: number) => {
      const dpr = window.devicePixelRatio || 1
      const w = c.clientWidth
      const h = c.clientHeight
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr)
        c.height = Math.round(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (colorAge++ > 30) {
        // Re-read the theme now and then: the page re-skins when the aesthetic changes.
        colorAge = 0
        colors = {
          accent: cssVar(c, '--accent', '#888'),
          accent2: cssVar(c, '--accent-2', cssVar(c, '--accent', '#aaa')),
          fg: cssVar(c, '--fg', '#fff'),
          bg: cssVar(c, '--bg', '#000'),
        }
      }
      const s = state.current
      const live = !!(analyser && freq && wave && playing)
      if (live) {
        analyser!.getByteFrequencyData(freq!)
        analyser!.getByteTimeDomainData(wave!)
      }
      // Log-spaced bands, 30 Hz – 16 kHz.
      const nyquist = sampleRate / 2
      const bins = freq?.length ?? 1
      let energy = 0
      for (let i = 0; i < BANDS; i++) {
        let v = 0
        if (live) {
          const f0 = 30 * Math.pow(16000 / 30, i / BANDS)
          const f1 = 30 * Math.pow(16000 / 30, (i + 1) / BANDS)
          const b0 = Math.floor((f0 / nyquist) * bins)
          const b1 = Math.max(b0 + 1, Math.ceil((f1 / nyquist) * bins))
          for (let b = b0; b < b1 && b < bins; b++) v = Math.max(v, freq![b])
          v = Math.pow(Math.max(0, (v / 255 - 0.12) / 0.88), 1.6)
        }
        s.bands[i] += (v - s.bands[i]) * (v > s.bands[i] ? 0.55 : 0.14)
        s.peaks[i] = Math.max(s.peaks[i] - 0.008, s.bands[i])
        energy += s.bands[i]
      }
      energy /= BANDS
      const bass = (s.bands[2] + s.bands[4] + s.bands[6]) / 3

      ctx.clearRect(0, 0, w, h)
      if (mode === 'spectrum') drawSpectrum(ctx, w, h, s.bands, s.peaks, colors)
      else if (mode === 'radial') {
        if (!reduce) s.spin += 0.0015 + energy * 0.01
        drawRadial(ctx, w, h, s.bands, s.spin, bass, colors)
      } else drawScope(ctx, w, h, live ? wave! : null, colors)

      // Readouts, measured from the signal (4× a second).
      if (live && now - s.lastReadout > 250) {
        s.lastReadout = now
        let sum = 0
        for (let i = 0; i < wave!.length; i++) sum += ((wave![i] - 128) / 128) ** 2
        const rms = Math.sqrt(sum / wave!.length)
        let num = 0
        let den = 0
        for (let b = 1; b < bins; b++) {
          num += ((b * nyquist) / bins) * freq![b]
          den += freq![b]
        }
        const centroid = den ? num / den : 0
        const notes = rms > 0.02 ? detectNote(wave!.subarray(0, 1024), sampleRate) : null
        const best = notes?.filter((n) => +n.frequency > 55 && +n.frequency < 1800 && +n.confidence > 0.55).sort((a, b) => +b.confidence - +a.confidence)[0]
        onReadout({
          pitch: best ? `${best.pitch} · ${Math.round(+best.frequency)} Hz` : '—',
          bright: centroid ? (centroid >= 1000 ? `${(centroid / 1000).toFixed(1)} kHz` : `${Math.round(centroid)} Hz`) : '—',
          // dBFS mapped onto the meter: −54 dB (empty) … 0 dB (full).
          level: rms > 0 ? Math.min(1, Math.max(0, (20 * Math.log10(rms) + 54) / 54)) : 0,
        })
      }

      // Keep animating while playing, then let the bars fall back to rest.
      if (playing) settle = 90
      if (playing || settle-- > 0) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const ro = new ResizeObserver(() => {
      if (!playing) {
        cancelAnimationFrame(raf)
        settle = 1
        raf = requestAnimationFrame(frame)
      }
    })
    ro.observe(c)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [analyser, sampleRate, playing, mode, onReadout])

  return <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden />
}

type Colors = { accent: string; accent2: string; fg: string; bg: string }

function drawSpectrum(ctx: CanvasRenderingContext2D, w: number, h: number, bands: Float32Array, peaks: Float32Array, c: Colors) {
  const base = h * 0.66
  const slot = w / BANDS
  const bw = Math.max(2, slot * 0.58)
  const grad = ctx.createLinearGradient(0, base - h * 0.6, 0, base)
  grad.addColorStop(0, c.accent2)
  grad.addColorStop(1, c.accent)
  for (let i = 0; i < BANDS; i++) {
    const x = i * slot + (slot - bw) / 2
    const up = Math.max(2, bands[i] * h * 0.58)
    ctx.fillStyle = grad
    ctx.globalAlpha = bands[i] > 0.01 ? 1 : 0.35
    ctx.beginPath()
    ctx.roundRect(x, base - up, bw, up, Math.min(bw / 2, up / 2))
    ctx.fill()
    // Reflection
    ctx.globalAlpha = 0.18
    ctx.beginPath()
    ctx.roundRect(x, base + 3, bw, up * 0.42, Math.min(bw / 2, up * 0.21))
    ctx.fill()
    // Falling peak caps
    if (peaks[i] > 0.01) {
      ctx.globalAlpha = 0.75
      ctx.fillStyle = c.fg
      ctx.fillRect(x, base - peaks[i] * h * 0.58 - 4, bw, 1.5)
    }
  }
  ctx.globalAlpha = 0.25
  ctx.fillStyle = c.fg
  ctx.fillRect(0, base + 1, w, 1)
  ctx.globalAlpha = 1
}

function drawRadial(ctx: CanvasRenderingContext2D, w: number, h: number, bands: Float32Array, spin: number, bass: number, c: Colors) {
  const cx = w / 2
  const cy = h / 2
  const m = Math.min(w, h)
  const r = m * 0.2 * (1 + bass * 0.12)
  const n = BANDS * 2
  ctx.lineCap = 'round'
  ctx.lineWidth = Math.max(2, (2 * Math.PI * r) / n) * 0.55
  const conic = 'createConicGradient' in ctx ? ctx.createConicGradient(spin, cx, cy) : null
  if (conic) {
    conic.addColorStop(0, c.accent)
    conic.addColorStop(0.5, c.accent2)
    conic.addColorStop(1, c.accent)
  }
  ctx.strokeStyle = conic ?? c.accent
  for (let i = 0; i < n; i++) {
    // Mirror the spectrum so the ring is symmetric.
    const v = bands[i < BANDS ? i : n - 1 - i]
    const a = spin + (i / n) * Math.PI * 2
    const len = 3 + v * m * 0.26
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    ctx.lineTo(cx + Math.cos(a) * (r + len), cy + Math.sin(a) * (r + len))
    ctx.stroke()
  }
  ctx.globalAlpha = 0.3
  ctx.lineWidth = 1
  ctx.strokeStyle = c.fg
  ctx.beginPath()
  ctx.arc(cx, cy, r - 6, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 0.15 + bass * 0.5
  ctx.fillStyle = c.accent
  ctx.beginPath()
  ctx.arc(cx, cy, (r - 12) * (0.6 + bass * 0.4), 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawScope(ctx: CanvasRenderingContext2D, w: number, h: number, wave: Uint8Array | null, c: Colors) {
  const mid = h / 2
  // Grid
  ctx.globalAlpha = 0.08
  ctx.fillStyle = c.fg
  for (let x = 0; x < w; x += 32) ctx.fillRect(x, 0, 1, h)
  for (let y = mid % 32; y < h; y += 32) ctx.fillRect(0, y, w, 1)
  ctx.globalAlpha = 1
  const grad = ctx.createLinearGradient(0, 0, w, 0)
  grad.addColorStop(0, c.accent)
  grad.addColorStop(1, c.accent2)
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.strokeStyle = grad
  ctx.shadowColor = c.accent
  ctx.shadowBlur = 14
  ctx.beginPath()
  if (!wave) {
    ctx.moveTo(0, mid)
    ctx.lineTo(w, mid)
  } else {
    const n = Math.min(wave.length, 1024)
    // Auto-gain so quiet recordings still read, capped at ×6.
    let peak = 0
    for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(wave[i] - 128) / 128)
    const gain = Math.min(6, 0.9 / Math.max(peak, 0.02))
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * w
      const y = mid + ((wave[i] - 128) / 128) * gain * h * 0.42
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
  }
  ctx.stroke()
  ctx.shadowBlur = 0
}
