'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/apiClient'

/**
 * Yayıncı çevrimiçi durumu (heartbeat).
 *
 * Backend: PUT /performers/me/status — Redis'te 90sn TTL ile tutulur.
 * Heartbeat 45sn'de bir gider; kesilirse sunucu yayıncıyı otomatik offline sayar.
 * Sekme/pencere kapanınca keepalive fetch ile offline yazılır.
 */

export type PerformerDurum = 'online' | 'molada' | 'offline'

const HEARTBEAT_MS = 45_000 // Redis TTL (90sn) yarısından sık
const PERFORMER_URL = process.env.NEXT_PUBLIC_PERFORMER_URL ?? 'http://localhost:3003'

export function usePerformerHeartbeat(baslangic: PerformerDurum = 'offline', etkin = true) {
  const [durum, setDurum] = useState<PerformerDurum>(baslangic)
  const [guncelleniyor, setGuncelleniyor] = useState(false)
  const durumRef = useRef<PerformerDurum>(baslangic)
  durumRef.current = durum

  const gonder = useCallback(async (d: PerformerDurum) => {
    try { await api.performer.put('/performers/me/status', { durum: d }) } catch { /* sessiz */ }
  }, [])

  // Kullanıcı eylemi ile durum değiştir
  const degistir = useCallback(async (d: PerformerDurum) => {
    setGuncelleniyor(true)
    setDurum(d)
    await gonder(d)
    setGuncelleniyor(false)
  }, [gonder])

  // Heartbeat döngüsü — online/molada iken canlı tut
  useEffect(() => {
    if (!etkin || durum === 'offline') return
    gonder(durum) // hemen bir kez
    const t = setInterval(() => gonder(durumRef.current), HEARTBEAT_MS)
    return () => clearInterval(t)
  }, [etkin, durum, gonder])

  // Sekme/pencere kapanırken offline yaz (keepalive → kapanışta da gider)
  useEffect(() => {
    if (!etkin) return
    function ayril() {
      if (durumRef.current === 'offline') return
      fetch(`${PERFORMER_URL}/performers/me/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ durum: 'offline' }),
        keepalive: true,
      }).catch(() => {})
    }
    window.addEventListener('pagehide', ayril)
    return () => {
      window.removeEventListener('pagehide', ayril)
      ayril() // bileşen kalkarsa da offline yaz
    }
  }, [etkin])

  return { durum, guncelleniyor, degistir }
}
