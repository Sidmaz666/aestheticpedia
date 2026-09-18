'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ArrowUp, ChevronUp, Cpu, Loader2, Minus, PenLine, Settings2, Square, X } from 'lucide-react'
import { onRouterProgress, ROUTER_MODEL, routerLoaded, routerProgress, loadRouter, runAgent, type AgentReply } from '@/lib/ai/agent'
import { CHAT_MODELS, webgpuStatus, writeAnswer } from '@/lib/ai/engine'
import { SITE_NAME } from '@/lib/site'
import { Robot, type RobotMood } from './robot'

interface Msg {
  role: 'user' | 'agent'
  text: string
  reply?: AgentReply
  prose?: string
  question?: string
}

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* private mode */
    }
  },
}

/** The aesthetic on screen (overlay or page), if any. */
function currentAesthetic(pathname: string): { slug: string; name: string } | null {
  const slug = /^\/aesthetics\/([a-z0-9-]+)$/.exec(pathname)?.[1]
  if (!slug) return null
  const modal = document.getElementById('aesthetic-modal')
  const name = modal?.getAttribute('aria-label') || document.title.split(/ [·—|] /)[0] || slug.replace(/-/g, ' ')
  return { slug, name }
}

function scrollRoot(): HTMLElement | null {
  return document.getElementById('aesthetic-modal-scroll')
}

export function AgentDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [hover, setHover] = useState(false)
  const [busy, setBusy] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [writing, setWriting] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [writer, setWriter] = useState<string>('off')
  const [settings, setSettings] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [showTop, setShowTop] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [current, setCurrent] = useState<{ slug: string; name: string } | null>(null)
  const stop = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMinimized(store.get('agent:min') === '1')
    setWriter(store.get('agent:writer') ?? 'off')
    setLoaded(routerLoaded())
    setProgress(routerProgress())
    return onRouterProgress((p) => {
      setProgress(p)
      setLoaded(p >= 1)
    }) as () => void
  }, [])

  // Track the aesthetic on screen (title/overlay settle a moment after navigation).
  useEffect(() => {
    const read = () => setCurrent(currentAesthetic(pathname))
    read()
    const t = setTimeout(read, 600)
    return () => clearTimeout(t)
  }, [pathname])

  // A one-time, per-session nudge on aesthetic pages.
  useEffect(() => {
    if (!current || open || minimized) return
    let seen = false
    try {
      seen = sessionStorage.getItem('agent:hinted') === '1'
    } catch {}
    if (seen) return
    const show = setTimeout(() => {
      setHint(`Ask me anything about ${current.name}`)
      try {
        sessionStorage.setItem('agent:hinted', '1')
      } catch {}
    }, 2600)
    const hide = setTimeout(() => setHint(null), 8600)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [current, open, minimized])

  // Scroll-to-top satellite: watches the window and the aesthetic overlay.
  useEffect(() => {
    const onScroll = () => setShowTop((scrollRoot()?.scrollTop ?? 0) > 700 || window.scrollY > 700)
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    onScroll()
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [pathname])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const toTop = () => {
    const root = scrollRoot()
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const minimize = (v: boolean) => {
    setMinimized(v)
    store.set('agent:min', v ? '1' : '0')
    if (v) setOpen(false)
  }

  const expand = useCallback(
    async (i: number, given?: Msg) => {
      const m = given ?? msgs[i]
      if (!m?.reply?.context || writer === 'off') return
      setWriting(true)
      stop.current = false
      try {
        await writeAnswer(
          writer,
          m.question ?? '',
          m.reply.context,
          `You are the guide to ${SITE_NAME}, an encyclopedia of aesthetics. Answer the question in under 150 words using ONLY the context. Be concrete (dates, places, materials, hex colours). If the context lacks the answer, say so.`,
          (text) => setMsgs((all) => all.map((x, j) => (j === i ? { ...x, prose: text } : x))),
          () => stop.current
        )
      } catch (e) {
        setMsgs((all) => all.map((x, j) => (j === i ? { ...x, prose: `The writer model failed: ${e instanceof Error ? e.message : e}` } : x)))
      } finally {
        setWriting(false)
      }
    },
    [msgs, writer]
  )

  const ask = async (q: string) => {
    const question = q.trim()
    if (!question || busy) return
    setInput('')
    setBusy(true)
    setMsgs((m) => [...m, { role: 'user', text: question }])
    try {
      const ctx = { current: currentAesthetic(pathname) }
      const reply = await runAgent(question, ctx)
      const idx = msgs.length + 1
      const msg: Msg = { role: 'agent', text: reply.text, reply, question }
      setMsgs((m) => [...m, msg])
      if (reply.theme) setTheme(reply.theme)
      if (reply.navigate) router.push(reply.navigate)
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 1600)
      if (writer !== 'off' && reply.context && !reply.navigate) setTimeout(() => expand(idx, msg), 0)
    } catch (e) {
      setMsgs((m) => [...m, { role: 'agent', text: `Sorry — ${e instanceof Error ? e.message : 'something went wrong'}.` }])
    } finally {
      setBusy(false)
    }
  }

  const mood: RobotMood = minimized ? 'sleep' : busy || (progress > 0 && progress < 1) ? 'think' : writing ? 'talk' : celebrate || hover ? 'happy' : 'idle'
  const suggestions = current
    ? [`Tell me about ${current.name}`, `What is similar to ${current.name}?`, `Blend this with Art Deco`, 'Which aesthetics use teal?']
    : ['What is wabi-sabi?', 'Aesthetics from Nigeria', 'Styles from the 1920s', 'Compare Art Deco and Bauhaus', 'Something warm and muted', 'Surprise me']
  const gpu = writer !== 'off' ? webgpuStatus() : { ok: true }

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[95] flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
      {open && (
        <section
          id="agent-panel"
          aria-label="On-device agent"
          className="pointer-events-auto flex max-h-[min(680px,calc(100svh-8.5rem))] w-[min(26rem,calc(100vw-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-[calc(1.5rem*var(--r-scale,1))] border border-line-strong bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="relative grid size-9 place-items-center rounded-full bg-accent-soft">
              <Cpu className="size-4 text-accent" aria-hidden />
              <span className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-surface ${loaded ? 'bg-emerald-500' : progress > 0 ? 'animate-pulse bg-amber-400' : 'bg-fg-subtle'}`} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Vault guide</span>
              <span className="block truncate text-xs text-fg-subtle">
                {ROUTER_MODEL.label} · {loaded ? 'running on your device' : progress > 0 ? `loading ${Math.round(progress * 100)}%` : `${ROUTER_MODEL.size}, loads on first question`}
                {writer !== 'off' && ` · writer ${CHAT_MODELS.find((m) => m.id === writer)?.label}`}
              </span>
            </span>
            <button type="button" onClick={() => setSettings((s) => !s)} aria-expanded={settings} className="grid size-8 place-items-center rounded-full text-fg-subtle hover:bg-surface-2 hover:text-fg" aria-label="Agent settings">
              <Settings2 className="size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full text-fg-subtle hover:bg-surface-2 hover:text-fg" aria-label="Close agent">
              <X className="size-4" aria-hidden />
            </button>
          </header>

          {progress > 0 && progress < 1 && (
            <div className="h-0.5 bg-line" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Model download">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
          )}

          {settings && (
            <div className="space-y-2 border-b border-line bg-surface-2/60 p-4 text-sm">
              <p className="text-xs text-fg-subtle">
                The agent ({ROUTER_MODEL.label}, {ROUTER_MODEL.size}) picks tools and answers from the library’s own records. Optionally add a writer model (WebGPU) that turns those
                results into prose.
              </p>
              {[{ id: 'off', label: 'No writer', size: '', note: 'Instant, fully grounded' }, ...CHAT_MODELS].map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2 ${writer === m.id ? 'border-accent bg-accent-soft' : 'border-line'}`}>
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="writer"
                      checked={writer === m.id}
                      onChange={() => {
                        setWriter(m.id)
                        store.set('agent:writer', m.id)
                      }}
                      className="accent-[var(--accent)]"
                    />
                    {m.label} <span className="text-xs text-fg-subtle">{m.note}</span>
                  </span>
                  <span className="font-mono text-xs text-fg-subtle">{m.size}</span>
                </label>
              ))}
              {!gpu.ok && <p className="text-xs text-danger">{gpu.reason}</p>}
            </div>
          )}

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4 no-scrollbar" aria-live="polite">
            {msgs.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-fg-muted">
                  I search, explain, compare and blend {current ? <>aesthetics — including <span className="text-fg">{current.name}</span></> : 'the world’s aesthetics'}, find them by colour, mood, place or era, and
                  can drive the site for you.
                </p>
                {!loaded && progress === 0 && (
                  <button type="button" onClick={() => loadRouter().catch(() => {})} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-fg text-sm text-bg">
                    Wake the agent · {ROUTER_MODEL.size}, once
                  </button>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) =>
              m.role === 'user' ? (
                <p key={i} className="ml-10 rounded-2xl rounded-br-md bg-fg px-3.5 py-2 text-sm text-bg">
                  {m.text}
                </p>
              ) : (
                <AgentMessage key={i} m={m} canWrite={writer !== 'off' && !writing} onWrite={() => expand(i)} />
              )
            )}
            {busy && (
              <p className="flex items-center gap-2 text-xs text-fg-subtle">
                <Loader2 className="size-3.5 animate-spin" aria-hidden /> {loaded ? 'Choosing tools…' : 'Waking the agent…'}
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={current ? `Ask about ${current.name}…` : 'Ask the vault…'}
              className="h-10 min-w-0 flex-1 rounded-full border border-line-strong bg-bg px-4 text-sm focus:border-accent focus:outline-none"
              aria-label="Your request"
            />
            {writing ? (
              <button type="button" onClick={() => (stop.current = true)} className="grid size-10 place-items-center rounded-full bg-surface-2" aria-label="Stop writing">
                <Square className="size-4" aria-hidden />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim() || busy} className="grid size-10 place-items-center rounded-full bg-accent text-accent-fg disabled:opacity-40" aria-label="Send">
                <ArrowUp className="size-4" aria-hidden />
              </button>
            )}
          </form>
        </section>
      )}

      <div className="pointer-events-auto relative flex items-end gap-2">
        {hint && !open && (
          <button
            type="button"
            onClick={() => {
              setHint(null)
              setOpen(true)
            }}
            className="mb-8 max-w-[14rem] rounded-2xl rounded-br-sm border border-line-strong bg-surface px-3 py-2 text-left text-xs text-fg shadow-xl animate-in fade-in-0 slide-in-from-right-2"
          >
            {hint}
          </button>
        )}
        <div className={`relative flex flex-col items-center transition-transform duration-500 ${minimized ? 'translate-x-[45%]' : ''}`}>
          {showTop && !minimized && (
            <button
              type="button"
              onClick={toTop}
              className="mb-1 grid size-9 place-items-center rounded-full border border-line-strong bg-surface text-fg-muted shadow-lg transition-colors animate-in fade-in-0 zoom-in-75 hover:text-fg"
              aria-label="Back to top"
              title="Back to top"
            >
              <ChevronUp className="size-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={() => (minimized ? minimize(false) : setOpen((o) => !o))}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            aria-expanded={open}
            aria-controls="agent-panel"
            aria-label={minimized ? 'Wake the vault guide' : open ? 'Close the vault guide' : 'Ask the vault guide'}
            title={minimized ? 'Wake me' : 'Ask the vault'}
            className="group relative grid place-items-center rounded-full outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
          >
            <Robot mood={mood} size={minimized ? 52 : 76} />
            <span className="sr-only">Vault guide</span>
          </button>
          {!minimized && (
            <button
              type="button"
              onClick={() => minimize(true)}
              className="absolute -left-1 top-1/2 grid size-6 place-items-center rounded-full border border-line-strong bg-surface text-fg-subtle opacity-0 shadow transition-opacity hover:text-fg focus-visible:opacity-100 [div:hover>&]:opacity-100"
              aria-label="Tuck the guide away"
              title="Tuck away"
            >
              <Minus className="size-3" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AgentMessage({ m, canWrite, onWrite }: { m: Msg; canWrite: boolean; onWrite: () => void }) {
  const r = m.reply
  return (
    <div className="space-y-3 text-sm">
      {r && r.tools.length > 0 && (
        <p className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
          {r.tools.join(' · ')}
          {r.ms !== undefined && ` · ${r.ms} ms`}
        </p>
      )}
      <p className="whitespace-pre-line leading-relaxed text-fg-muted">{m.text}</p>
      {r?.table && (
        <table className="w-full table-fixed border-collapse overflow-hidden rounded-xl text-xs ring-1 ring-line">
          <thead>
            <tr className="bg-surface-2 text-left">
              <th className="w-[28%] p-2 font-normal text-fg-subtle" />
              <th className="p-2 font-medium text-fg">{r.table.head[0]}</th>
              <th className="p-2 font-medium text-fg">{r.table.head[1]}</th>
            </tr>
          </thead>
          <tbody>
            {r.table.rows.map(([label, x, y]) => (
              <tr key={label} className="border-t border-line align-top">
                <th scope="row" className="p-2 text-left font-normal text-fg-subtle">
                  {label}
                </th>
                <td className="p-2 text-fg-muted">{x || '—'}</td>
                <td className="p-2 text-fg-muted">{y || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {r?.swatches && r.swatches.length > 0 && (
        <div className="flex overflow-hidden rounded-xl ring-1 ring-line">
          {r.swatches.map((c, i) => (
            <span key={`${c.hex}-${i}`} className="h-8 flex-1" style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />
          ))}
        </div>
      )}
      {r?.cards && r.cards.length > 0 && (
        <ul className="grid grid-cols-2 gap-2">
          {r.cards.map((c) => (
            <li key={c.slug}>
              <Link href={`/aesthetics/${c.slug}`} className="group block overflow-hidden rounded-xl border border-line bg-bg transition-colors hover:border-line-strong">
                <span className="relative block aspect-[4/3] overflow-hidden bg-surface-2">
                  {c.image ? (
                    <img src={c.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="flex size-full">
                      {(c.colors ?? []).map((col, i) => (
                        <span key={i} className="flex-1" style={{ background: col.hex }} />
                      ))}
                    </span>
                  )}
                </span>
                <span className="block p-2">
                  <span className="block truncate text-xs font-medium text-fg">{c.name}</span>
                  {c.note && <span className="line-clamp-2 text-[11px] leading-snug text-fg-subtle">{c.note}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {m.prose !== undefined && (
        <div className="rounded-xl border border-line bg-surface-2/60 p-3">
          <p className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
            <PenLine className="size-3" aria-hidden /> Written by the on-device writer from the records above
          </p>
          <p className="whitespace-pre-line leading-relaxed text-fg-muted">{m.prose || '…'}</p>
        </div>
      )}
      {((r?.actions?.length ?? 0) > 0 || (canWrite && r?.context && m.prose === undefined)) && (
        <p className="flex flex-wrap gap-1.5">
          {r?.actions?.map((a) => (
            <Link key={a.href} href={a.href} className="rounded-full border border-line-strong px-3 py-1 text-xs text-fg-muted transition-colors hover:border-accent hover:text-fg" {...(a.href.startsWith('/data/') ? { download: true, prefetch: false } : {})}>
              {a.label}
            </Link>
          ))}
          {canWrite && r?.context && m.prose === undefined && (
            <button type="button" onClick={onWrite} className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs text-fg">
              <PenLine className="size-3" aria-hidden /> Write it up
            </button>
          )}
        </p>
      )}
    </div>
  )
}
