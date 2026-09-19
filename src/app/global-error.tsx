'use client'

// Shown only when the root layout itself fails, so it carries its own <html>/<body> and styles.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#0b0b0c', color: '#f3f0ea', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 24 }}>
        <main>
          <p style={{ letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 12, color: '#8f8a81' }}>Something broke</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 48, margin: '16px 0' }}>The vault jammed.</h1>
          <p style={{ color: '#b9b3a9' }}>An unexpected error stopped the site from loading.</p>
          {error.digest && <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#8f8a81' }}>Reference: {error.digest}</p>}
          <button type="button" onClick={reset} style={{ marginTop: 24, height: 44, padding: '0 24px', borderRadius: 999, border: 0, background: '#f3f0ea', color: '#0b0b0c', fontSize: 14, cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
