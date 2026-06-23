'use client'

import { AuthProvider } from '@/components/AuthProvider'
import { I18nProvider } from '@/contexts/i18nContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1A1D27',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontFamily: 'var(--font-dm-sans)',
              },
              success: { iconTheme: { primary: '#F5620F', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
