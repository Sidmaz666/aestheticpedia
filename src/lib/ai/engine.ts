'use client'

// In-browser AI: a small language model (WebLLM, WebGPU) for the assistant and a
// text-to-image model (Janus-Pro 1B via Transformers.js, WebGPU) for visualising an
// aesthetic. Nothing is sent to a server; models download once and are cached by the browser.
import { toast } from 'sonner'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'

export interface ChatModel {
  id: string
  label: string
  size: string
  note: string
}

export const CHAT_MODELS: ChatModel[] = [
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 · 1.5B', size: '≈1.1 GB', note: 'Best answers' },
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 · 1B', size: '≈0.9 GB', note: 'Balanced' },
  { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 · 0.5B', size: '≈0.4 GB', note: 'Fastest, lightest' },
]

export const IMAGE_MODEL = { id: 'onnx-community/Janus-Pro-1B-ONNX', label: 'Janus-Pro 1B', size: '≈2 GB' }

export function webgpuStatus(): { ok: boolean; reason?: string } {
  if (typeof navigator === 'undefined') return { ok: false, reason: 'Not in a browser' }
  if (!('gpu' in navigator)) return { ok: false, reason: 'This browser has no WebGPU. Use a recent Chrome, Edge or Safari 26+ on a device with a GPU.' }
  return { ok: true }
}

const pct = (p: number) => `${Math.round(p * 100)}%`

// ---------------------------------------------------------------------------
// Chat engine (singleton per tab)
// ---------------------------------------------------------------------------
let chat: { id: string; engine: Promise<MLCEngineInterface> } | null = null

export function loadedChatModel() {
  return chat?.id ?? null
}

export async function getChatEngine(modelId: string): Promise<MLCEngineInterface> {
  if (chat?.id === modelId) return chat.engine
  const model = CHAT_MODELS.find((m) => m.id === modelId) ?? CHAT_MODELS[0]
  const toastId = `llm-${model.id}`
  toast.loading(`Preparing ${model.label} (${model.size}, downloaded once and cached in your browser)…`, { id: toastId, duration: Infinity })
  const engine = (async () => {
    const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm')
    const worker = new Worker(new URL('./llm.worker.ts', import.meta.url), { type: 'module' })
    const e = await CreateWebWorkerMLCEngine(worker, model.id, {
      initProgressCallback: (r) => {
        toast.loading(`${model.label}: ${r.progress < 1 ? pct(r.progress) : 'initialising'} — ${r.text.replace(/\[.*?\]\s*/, '').slice(0, 90)}`, {
          id: toastId,
          duration: Infinity,
        })
      },
    })
    toast.success(`${model.label} is ready — running entirely on your device.`, { id: toastId, duration: 4000 })
    return e
  })()
  chat = { id: model.id, engine }
  engine.catch((err) => {
    chat = null
    toast.error(`Couldn’t load ${model.label}: ${err instanceof Error ? err.message : String(err)}`, { id: toastId, duration: 8000 })
  })
  return engine
}

// ---------------------------------------------------------------------------
// Image generation (Janus-Pro 1B)
// ---------------------------------------------------------------------------
type Janus = { processor: any; model: any }
let janus: Promise<Janus> | null = null

async function getJanus(): Promise<Janus> {
  if (janus) return janus
  const toastId = 'janus'
  const files = new Map<string, { loaded: number; total: number }>()
  toast.loading(`Preparing ${IMAGE_MODEL.label} (${IMAGE_MODEL.size}, downloaded once and cached)…`, { id: toastId, duration: Infinity })
  janus = (async () => {
    const { AutoProcessor, MultiModalityCausalLM } = await import('@huggingface/transformers')
    const progress_callback = (p: any) => {
      if (p.status === 'progress' && p.file) {
        files.set(p.file, { loaded: p.loaded ?? 0, total: p.total ?? 0 })
        const loaded = [...files.values()].reduce((s, f) => s + f.loaded, 0)
        const total = [...files.values()].reduce((s, f) => s + f.total, 0) || 1
        toast.loading(`${IMAGE_MODEL.label}: downloading ${pct(loaded / total)} (${(loaded / 1e6).toFixed(0)} / ${(total / 1e6).toFixed(0)} MB)`, {
          id: toastId,
          duration: Infinity,
        })
      }
    }
    const processor = await AutoProcessor.from_pretrained(IMAGE_MODEL.id, { progress_callback })
    const model = await (MultiModalityCausalLM as any).from_pretrained(IMAGE_MODEL.id, {
      dtype: { prepare_inputs_embeds: 'q4', language_model: 'q4f16', lm_head: 'fp16', gen_head: 'fp16', gen_img_embeds: 'fp16', image_decode: 'fp32' },
      device: {
        prepare_inputs_embeds: 'wasm',
        language_model: 'webgpu',
        lm_head: 'webgpu',
        gen_head: 'webgpu',
        gen_img_embeds: 'webgpu',
        image_decode: 'webgpu',
      },
      progress_callback,
    })
    toast.success(`${IMAGE_MODEL.label} is ready.`, { id: toastId, duration: 3000 })
    return { processor, model }
  })()
  janus.catch((err) => {
    janus = null
    toast.error(`Couldn’t load ${IMAGE_MODEL.label}: ${err instanceof Error ? err.message : String(err)}`, { id: toastId, duration: 8000 })
  })
  return janus
}

/** Generate one 384×384 image; returns an object URL. */
export async function generateImage(prompt: string, onStep?: (msg: string) => void): Promise<string> {
  const { processor, model } = await getJanus()
  onStep?.('Composing…')
  const inputs = await processor([{ role: '<|User|>', content: prompt }], { chat_template: 'text_to_image' })
  const n = processor.num_image_tokens as number
  let step = 0
  const outputs = await model.generate_images({
    ...inputs,
    min_new_tokens: n,
    max_new_tokens: n,
    do_sample: true,
    streamer: {
      put: () => {
        step++
        if (step % 24 === 0) onStep?.(`Painting… ${Math.min(100, Math.round((step / n) * 100))}%`)
      },
      end: () => {},
    },
  })
  const blob: Blob = await outputs[0].toBlob()
  return URL.createObjectURL(blob)
}
