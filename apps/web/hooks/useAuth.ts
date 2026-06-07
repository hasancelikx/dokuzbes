'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const PUBLIC_PATHS = ['/giris', '/kayit', '/']

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const { kullanici, yukleniyor } = useAuthStore()

  useEffect(() => {
    if (yukleniyor) return

    if (!kullanici) {
      if (!PUBLIC_PATHS.includes(pathname)) {
        router.replace('/giris')
      }
      return
    }

    if (!kullanici.nickname && pathname !== '/kapi-ritueli') {
      router.replace('/kapi-ritueli')
    }
  }, [kullanici, yukleniyor, pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return { kullanici, yukleniyor }
}
