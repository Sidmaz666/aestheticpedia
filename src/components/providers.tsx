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
    <ThemeProvider attribute="class" defaultTheme="dark" themes={['dark', 'light']} enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-center"
          gap={10}
          toastOptions={{
            // Themed by the current aesthetic; the icon sits on the title's line, the
            // description stays readable, actions are pills.
            classNames: {
              toast: 'aesthetic-toast',
              title: 'aesthetic-toast-title',
              description: 'aesthetic-toast-description',
              icon: 'aesthetic-toast-icon',
              actionButton: 'aesthetic-toast-action',
              cancelButton: 'aesthetic-toast-cancel',
              closeButton: 'aesthetic-toast-close',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
