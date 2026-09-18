'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUp, Bot, Cpu, Loader2, Square, X } from 'lucide-react'
import type { AestheticsResponse, HybridResponse, SuggestItem } from '@/lib/aesthetic'
import { fetchJson } from '@/lib/client'
import { CHAT_MODELS, getChatEngine, loadedChatModel, webgpuStatus } from '@/lib/ai/engine'
import { SITE_NAME } from '@/lib/site'

interface Msg {
  role: 'user' | 'assistant'
  content: string
  sources?: { slug: string; name: string }[]
  tools?: string[]
}

const MAX_CONTEXT = 7000

/** Gather grounding context with simple, transparent tools (search, current page, colour, blend). */
async function gatherContext(question: string, pathname: string) {
  const tools: string[] = []
  const sources = new Map<string, string>()
  const parts: string[] = []

  const current = /^\/aesthetics\/([a-z0-9-]+)$/.exec(pathname)?.[1]
  if (current) {
    const md = await fetch(`/api/v1/aesthetics/${current}.md`).then((r) => (r.ok ? r.text() : ''))
    if (md) {
      parts.push(`CURRENT PAGE RECORD:\n${md.slice(0, 3200)}`)
      sources.set(current, md.split('\n')[0].replace(/^#\s*/, ''))
      tools.push('read current page')
    }
  }

  const hex = /#?\b([0-9a-f]{6})\b/i.exec(question)?.[1]
  if (hex) {
    const r = await fetchJson<{ items: { slug: string; name: string; match: string }[] }>(`/api/v1/colors?limit=6&hex=${hex}`)
    parts.push(`AESTHETICS USING A COLOUR NEAR #${hex}:\n${r.items.map((i) => `- ${i.name} (${i.match})`).join('\n')}`)
    r.items.forEach((i) => sources.set(i.slug, i.name))
    tools.push(`colour search #${hex}`)
  }

  const res = await fetchJson<AestheticsResponse>(`/api/v1/aesthetics?pageSize=5&facets=false&q=${encodeURIComponent(question.slice(0, 80))}`).catch(() => null)
  let hits = res?.items ?? []
  if (!hits.length) {
    // Fall back to searching individual significant words.
    const words = question.toLowerCase().match(/[a-z][a-z-]{3,}/g)?.filter((w) => !/^(what|which|when|where|with|that|this|about|tell|explain|does|from|like|more|have|make|into|between|their)$/.test(w)) ?? []
    for (const w of words.slice(0, 3)) {
      const s = await fetchJson<{ items: SuggestItem[] }>(`/api/v1/search?limit=3&q=${encodeURIComponent(w)}`).catch(() => ({ items: [] }))
      hits = [...hits, ...s.items.map((i) => ({ slug: i.slug, name: i.name, category: i.category, summary: '' }) as never)]
    }
  }
  if (hits.length) {
    tools.push(`searched the library (${hits.length} matches)`)
    const lines: string[] = []
    for (const h of hits.slice(0, 5)) {
      if (h.slug === current) continue
      sources.set(h.slug, h.name)
      lines.push(`- ${h.name} [${h.category}]: ${h.summary || ''}`)
    }
    if (lines.length) parts.push(`SEARCH RESULTS:\n${lines.join('\n')}`)
  }

  if (/\b(blend|mix|combine|fuse|cross)\b/i.test(question)) {
    const names = [...sources.keys()].filter((s) => s !== current)
    const [a, b] = current ? [current, names[0]] : names
    if (a && b) {
      const blend = await fetchJson<HybridResponse>(`/api/v1/blend?a=${a}&b=${b}`).catch(() => null)
      if (blend) {
        tools.push(`blended ${a} × ${b}`)
        parts.push(`BLEND RESULT (${blend.parents.map((p) => p.name).join(' × ')}):\n${JSON.stringify(blend.hybrid).slice(0, 1200)}`)
      }
    }
  }

  return { context: parts.join('\n\n').slice(0, MAX_CONTEXT), sources: [...sources.entries()].map(([slug, name]) => ({ slug, name })), tools }
}

export function Assistant() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [model, setModel] = useState(CHAT_MODELS[0].id)
  const [ready, setReady] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const stop = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)
  const gpu = typeof window === 'undefined' ? { ok: true } : webgpuStatus()

  useEffect(() => setReady(loadedChatModel()), [open])
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [msgs])

  const load = async () => {
    setLoading(true)
    try {
      await getChatEngine(model)
      setReady(model)
    } finally {
      setLoading(false)
    }
  }

  const ask = async (question: string) => {
    if (!question.trim() || busy) return
    setInput('')
    setBusy(true)
    stop.current = false
    const history = msgs.slice(-6)
    setMsgs((m) => [...m, { role: 'user', content: question }, { role: 'assistant', content: '' }])
    try {
      const engine = await getChatEngine(model)
      setReady(model)
      const { context, sources, tools } = await gatherContext(question, pathname)
      setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, sources, tools } : x)))
      const system = `You are the guide to ${SITE_NAME}, an open encyclopedia of the world's aesthetics. Answer using ONLY the context below; if it does not contain the answer, say you don't know and suggest searching the site. Be concise (under 180 words), concrete (palettes with hex codes, materials, dates, places) and name the aesthetics you draw on.\n\nCONTEXT:\n${context || '(nothing relevant found in the library)'}`
      const stream = await engine.chat.completions.create({
        stream: true,
        temperature: 0.4,
        max_tokens: 420,
        messages: [{ role: 'system', content: system }, ...history.map((h) => ({ role: h.role, content: h.content })), { role: 'user', content: question }],
      })
      for await (const chunk of stream) {
        if (stop.current) {
          await engine.interruptGenerate()
          break
        }
        const delta = chunk.choices[0]?.delta?.content ?? ''
        if (delta) setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: x.content + delta } : x)))
      }
    } catch (e) {
      setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: `Sorry — ${e instanceof Error ? e.message : 'the model failed'}.` } : x)))
    } finally {
      setBusy(false)
    }
  }

  const current = /^\/aesthetics\/([a-z0-9-]+)$/.exec(pathname)?.[1]
  const suggestions = current
    ? ['Summarise this aesthetic in three sentences', 'How would I use this palette in a website?', 'What influenced it and what did it influence?']
    : ['What is wabi-sabi?', 'Which aesthetics use #1f4e79?', 'Compare Art Deco and Art Nouveau']

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-[95] flex h-12 items-center gap-2 rounded-full bg-fg px-4 text-sm font-medium text-bg shadow-xl shadow-black/30 transition-transform hover:scale-[1.03] sm:bottom-6 sm:right-6"
        aria-expanded={open}
        aria-controls="assistant-panel"
      >
        {open ? <X className="size-4" aria-hidden /> : <Bot className="size-4" aria-hidden />}
        <span className="hidden sm:inline">{open ? 'Close' : 'Ask the vault'}</span>
      </button>

      {open && (
        <section
          id="assistant-panel"
          aria-label="AI assistant"
          className="fixed inset-x-2 bottom-20 z-[95] flex max-h-[min(640px,calc(100svh-7rem))] flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl shadow-black/40 animate-in fade-in-0 slide-in-from-bottom-4 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[26rem]"
        >
          <header className="border-b border-line p-4">
            <p className="flex items-center gap-2 font-medium">
              <Cpu className="size-4 text-accent" aria-hidden /> On-device assistant
            </p>
            <p className="mt-1 text-xs text-fg-subtle">
              Runs privately in your browser (WebGPU). Answers are grounded in {SITE_NAME} records, but small models can still be
              wrong — check the linked records.
            </p>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4 no-scrollbar" aria-live="polite">
            {!gpu.ok ? (
              <p className="rounded-xl bg-surface-2 p-3 text-sm text-fg-muted">{gpu.reason}</p>
            ) : !ready ? (
              <div className="space-y-3">
                <p className="text-sm text-fg-muted">Choose a model. It downloads once, then loads from your browser cache.</p>
                <div className="space-y-2">
                  {CHAT_MODELS.map((m) => (
                    <label key={m.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm ${model === m.id ? 'border-accent bg-accent-soft' : 'border-line'}`}>
                      <span className="flex items-center gap-2">
                        <input type="radio" name="model" checked={model === m.id} onChange={() => setModel(m.id)} className="accent-[var(--accent)]" />
                        {m.label}
                        <span className="text-xs text-fg-subtle">{m.note}</span>
                      </span>
                      <span className="font-mono text-xs text-fg-subtle">{m.size}</span>
                    </label>
                  ))}
                </div>
                <button type="button" onClick={load} disabled={loading} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-fg text-sm text-bg disabled:opacity-60">
                  {loading && <Loader2 className="size-4 animate-spin" aria-hidden />} {loading ? 'Downloading… (see progress below)' : 'Download & start'}
                </button>
              </div>
            ) : msgs.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-fg-muted">Ask about any aesthetic{current ? ', or about the one you’re viewing' : ''}.</p>
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)} className="block w-full rounded-xl border border-line px-3 py-2 text-left text-sm text-fg-muted hover:border-line-strong hover:text-fg">
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              msgs.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'ml-8 rounded-2xl bg-surface-2 px-3.5 py-2.5 text-sm' : 'text-sm leading-relaxed text-fg-muted'}>
                  {m.role === 'assistant' && m.tools && m.tools.length > 0 && (
                    <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">{m.tools.join(' · ')}</p>
                  )}
                  <p className="whitespace-pre-wrap">{m.content || (busy && i === msgs.length - 1 ? '…' : '')}</p>
                  {m.sources && m.sources.length > 0 && m.content && (
                    <p className="mt-2 flex flex-wrap gap-1.5">
                      {m.sources.slice(0, 6).map((s) => (
                        <Link key={s.slug} href={`/aesthetics/${s.slug}`} className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-fg-muted hover:text-fg">
                          {s.name}
                        </Link>
                      ))}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {gpu.ok && ready && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                ask(input)
              }}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about an aesthetic…"
                className="h-10 flex-1 rounded-full border border-line-strong bg-bg px-4 text-sm focus:outline-none"
                aria-label="Your question"
              />
              {busy ? (
                <button type="button" onClick={() => (stop.current = true)} className="grid size-10 place-items-center rounded-full bg-surface-2" aria-label="Stop">
                  <Square className="size-4" aria-hidden />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()} className="grid size-10 place-items-center rounded-full bg-fg text-bg disabled:opacity-40" aria-label="Send">
                  <ArrowUp className="size-4" aria-hidden />
                </button>
              )}
            </form>
          )}
        </section>
      )}
    </>
  )
}
