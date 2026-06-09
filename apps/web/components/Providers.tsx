'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState, useEffect, useRef } from 'react'
import { benimKimim } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/apiClient'

// Access token 15 dakika — 12 dakikada bir yenile (3 dk tampon)
const YENILE_INTERVAL = 12 * 60 * 1000

function AuthInit() {
  const { setKullanici, setYukleniyor, sifirla } = useAuthStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function tokenYenile() {
    try {
      await api.auth.post('/auth/refresh')
      // Başarılıysa kullanıcı bilgisini güncelle
      const kullanici = await benimKimim()
      if (kullanici) setKullanici(kullanici)
    } catch {
      // Refresh token da geçersizse oturumu kapat
      sifirla()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  useEffect(() => {
    benimKimim()
      .then((kullanici) => {
        if (kullanici) {
          setKullanici(kullanici)
          // Periyodik yenileme başlat
          timerRef.current = setInterval(tokenYenile, YENILE_INTERVAL)
        } else {
          sifirla()
        }
      })
      .catch(() => sifirla())
      .finally(() => setYukleniyor(false))

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { sifirla } = useAuthStore()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error: any) => {
              // 401 hatalarında yeniden deneme — token yenileme fırsatı ver
              if (error?.status === 401) return false
              return failureCount < 1
            },
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInit />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#F0EDE8',
            border: '0.5px solid rgba(201,168,76,0.25)',
            borderRadius: '10px',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
