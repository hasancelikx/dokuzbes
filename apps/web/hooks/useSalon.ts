'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/apiClient'
import type { Yayinci, YayinciDurumu } from '@/types/yayinci'

export type SalonFiltre = 'tumu' | 'online' | 'musait'

const ONLINE_DURUMLAR: YayinciDurumu[] = ['online', 'musait', 'mesgul', 'molada']

export function useSalon(filtre: SalonFiltre = 'tumu') {
  const [tumYayincilar, setTumYayincilar] = useState<Yayinci[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState<string | null>(null)

  const getir = useCallback(async () => {
    try {
      const veri = await api.performer.get<{ yayincilar: Yayinci[] }>('/performers')
      setTumYayincilar(veri.yayincilar ?? [])
      setHata(null)
    } catch {
      setHata('Yayıncılar yüklenemedi.')
    } finally {
      setYukleniyor(false)
    }
  }, [])

  useEffect(() => {
    getir()
    // Her 30 saniyede bir yenile
    const interval = setInterval(getir, 30_000)
    return () => clearInterval(interval)
  }, [getir])

  const yayincilar = tumYayincilar.filter((y) => {
    if (filtre === 'online') return ONLINE_DURUMLAR.includes(y.durum)
    if (filtre === 'musait') return y.durum === 'musait'
    return true
  })

  return { yayincilar, yukleniyor, hata }
}
