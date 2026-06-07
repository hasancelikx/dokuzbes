'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'

export interface Bildirim {
  id: string
  tip: string
  baslik: string
  metin: string
  veri: Record<string, unknown> | null
  okundu: boolean
  createdAt: string
}

export function useBildirimler() {
  const { kullanici } = useAuthStore()
  const [bildirimler, setBildirimler] = useState<Bildirim[]>([])
  const [okunmamis, setOkunmamis] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  const yukle = useCallback(async () => {
    if (!kullanici) return
    try {
      const data = await api.notif.get<{ bildirimler: Bildirim[]; okunmamis: number }>('/bildirimler')
      setBildirimler(data.bildirimler)
      setOkunmamis(data.okunmamis)
    } catch {
      // sessiz
    }
  }, [kullanici])

  // SSE bağlantısı
  useEffect(() => {
    if (!kullanici) return

    const BASE = process.env.NEXT_PUBLIC_NOTIF_URL ?? 'http://localhost:3010'
    const es = new EventSource(`${BASE}/bildirimler/stream`, { withCredentials: true })
    eventSourceRef.current = es

    es.onmessage = (e) => {
      try {
        const mesaj = JSON.parse(e.data)
        if (mesaj.tur === 'BAGLANTI') {
          setOkunmamis(mesaj.okunmamis)
        } else if (mesaj.tur === 'BILDIRIM') {
          setBildirimler((prev) => [mesaj.bildirim, ...prev])
          setOkunmamis((prev) => prev + 1)
        }
      } catch {
        // parse hatası
      }
    }

    es.onerror = () => {
      // SSE düştü — polling'e geç
      es.close()
      const polling = setInterval(yukle, 30_000)
      return () => clearInterval(polling)
    }

    yukle()

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [kullanici, yukle])

  const tumunuOku = useCallback(async () => {
    await api.notif.patch('/bildirimler/tumunu-oku')
    setBildirimler((prev) => prev.map((b) => ({ ...b, okundu: true })))
    setOkunmamis(0)
  }, [])

  const bildirimOku = useCallback(async (id: string) => {
    await api.notif.patch(`/bildirimler/${id}/oku`)
    setBildirimler((prev) => prev.map((b) => (b.id === id ? { ...b, okundu: true } : b)))
    setOkunmamis((prev) => Math.max(0, prev - 1))
  }, [])

  const bildirimSil = useCallback(async (id: string) => {
    await api.notif.delete(`/bildirimler/${id}`)
    setBildirimler((prev) => {
      const silinen = prev.find((b) => b.id === id)
      if (silinen && !silinen.okundu) setOkunmamis((c) => Math.max(0, c - 1))
      return prev.filter((b) => b.id !== id)
    })
  }, [])

  return { bildirimler, okunmamis, tumunuOku, bildirimOku, bildirimSil }
}
