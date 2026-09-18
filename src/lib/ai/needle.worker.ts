/// <reference lib="webworker" />
// Runs Needle 3 (Cactus Compute, Apache-2.0) — a 35 MB tool-calling model — off the main
// thread. The engine (public/vendor/needle) is ~0.7 MB of WebAssembly with no GPU
// requirement; the weights are fetched once from Hugging Face at a pinned revision and kept
// in Cache Storage, so later visits start offline in about a second.
export {}

const REVISION = '9da75122d4ca11aa4a667281c9c8ba38a7eed679'
const WEIGHTS_URL = `https://huggingface.co/Cactus-Compute/needle3/resolve/${REVISION}/needle3.cact`
const CACHE = 'aestheticpedia-models-v1'
const OUT_CAPACITY = 16384

type NeedleModule = {
  HEAPU8: Uint8Array
  _malloc(n: number): number
  _needle_load(ptr: number, n: bigint): number
  ccall(name: string, ret: string | null, types: string[], args: unknown[]): number
  UTF8ToString(ptr: number): string
}

let M: NeedleModule | null = null
let outPtr = 0
const post = (m: unknown) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m)

async function weights(): Promise<Uint8Array> {
  let cache: Cache | null = null
  try {
    cache = await caches.open(CACHE)
    const hit = await cache.match(WEIGHTS_URL)
    if (hit) {
      post({ type: 'progress', loaded: 1, total: 1, cached: true })
      return new Uint8Array(await hit.arrayBuffer())
    }
  } catch {
    cache = null // Cache Storage unavailable (private mode) — download every time.
  }
  const res = await fetch(WEIGHTS_URL)
  if (!res.ok || !res.body) throw new Error(`Model download failed (${res.status})`)
  const total = Number(res.headers.get('content-length')) || 35_335_380
  const buf = new Uint8Array(total)
  const reader = res.body.getReader()
  let loaded = 0
  let last = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf.set(value, loaded)
    loaded += value.length
    if (loaded - last > 512 * 1024) {
      last = loaded
      post({ type: 'progress', loaded, total })
    }
  }
  const bytes = loaded === total ? buf : buf.slice(0, loaded)
  try {
    await cache?.put(WEIGHTS_URL, new Response(bytes, { headers: { 'content-type': 'application/octet-stream' } }))
  } catch {
    /* quota exceeded — still usable this session */
  }
  post({ type: 'progress', loaded, total })
  return bytes
}

async function init(system: string, tools: unknown) {
  const [code, wasm, cact] = await Promise.all([
    fetch('/vendor/needle/needle.js').then((r) => r.text()),
    fetch('/vendor/needle/needle.wasm').then((r) => r.arrayBuffer()),
    weights(),
  ])
  // The Emscripten glue is a classic script exposing `createNeedle`; module workers have no
  // importScripts, so evaluate it in a function scope (same-origin, vendored file).
  const createNeedle = new Function(`${code};return createNeedle`)() as (o: object) => Promise<NeedleModule>
  M = await createNeedle({ wasmBinary: new Uint8Array(wasm) })
  const ptr = M._malloc(cact.length)
  M.HEAPU8.set(cact, ptr)
  if (M._needle_load(ptr, BigInt(cact.length)) < 0) throw new Error('Needle could not read its weights')
  if (M.ccall('needle_init', 'number', ['string', 'string', 'string'], [system, JSON.stringify(tools), null]) < 0)
    throw new Error('Needle rejected the tool list')
  outPtr = M._malloc(OUT_CAPACITY)
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type } = e.data as { id: number; type: string }
  try {
    if (type === 'init') {
      if (!M) await init(e.data.system, e.data.tools)
      post({ id, ok: true })
    } else if (type === 'complete') {
      if (!M) throw new Error('Model not loaded')
      M.ccall('needle_reset', null, [], [])
      const t = performance.now()
      const n = M.ccall('needle_complete', 'number', ['string', 'number', 'number', 'number'], [e.data.input, 128, outPtr, OUT_CAPACITY])
      if (n < 0) throw new Error('Needle could not answer')
      post({ id, ok: true, result: JSON.parse(M.UTF8ToString(outPtr)), ms: Math.round(performance.now() - t) })
    }
  } catch (err) {
    post({ id, ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
