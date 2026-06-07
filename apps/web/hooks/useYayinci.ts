'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/apiClient'
import type { Yayinci } from '@/types/yayinci'

export function useYayinci(id: string) {
  const [yayinci, setYayinci] = useState<Yayinci | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    api.performer.get<Yayinci>(`/performers/${id}`)
      .then((veri) => {
        setYayinci(veri)
        setHata(null)
      })
      .catch(() => setHata('Yayıncı bulunamadı.'))
      .finally(() => setYukleniyor(false))
  }, [id])

  return { yayinci, yukleniyor, hata }
}
