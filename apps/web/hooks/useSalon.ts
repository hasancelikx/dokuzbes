'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { Yayinci, YayinciDurumu } from '@/types/yayinci'

export type SalonFiltre = 'tumu' | 'online' | 'musait'

const ONLINE_DURUMLAR: YayinciDurumu[] = ['online', 'musait', 'mesgul', 'molada']

export function useSalon(filtre: SalonFiltre = 'tumu') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['salon'],
    queryFn: () => api.performer.get<{ yayincilar: Yayinci[] }>('/performers'),
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 1,
  })

  const tumYayincilar = data?.yayincilar ?? []

  const yayincilar = tumYayincilar.filter((y) => {
    if (filtre === 'online') return ONLINE_DURUMLAR.includes(y.durum)
    if (filtre === 'musait') return y.durum === 'musait'
    return true
  })

  return {
    yayincilar,
    yukleniyor: isLoading,
    hata: error ? 'Yayıncılar yüklenemedi.' : null,
  }
}
