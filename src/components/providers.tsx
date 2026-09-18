'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      })
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" themes={['dark', 'light']} enableSystem={false} disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--line-strong)' },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
