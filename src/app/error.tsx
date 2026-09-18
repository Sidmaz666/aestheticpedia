'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60svh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Error</p>
      <h1 className="display mt-3 text-5xl">Something went wrong.</h1>
      <button type="button" onClick={reset} className="mt-8 rounded-full bg-fg px-5 py-2.5 text-sm text-bg">
        Try again
      </button>
    </main>
  )
}
