'use client'

import { useEffect, useState } from 'react'

export type HediyeKategori = 'temel' | 'orta' | 'premium' | 'luks'

interface HediyeParticle {
  id: string
  emoji: string
  x: number
  tip: 'float' | 'bounce' | 'burst'
}

interface DBHediyeAnimasyonProps {
  emoji: string
  isim: string
  kategori: HediyeKategori
  goldMaliyet: number
  gondericIsim: string
  onBitti?: () => void
}

const KATEGORI_KONFIG: Record<HediyeKategori, {
  tipSinifi: string
  sure: number
  boyut: string
  ekstraSinif: string
  particleSayisi: number
}> = {
  temel:   { tipSinifi: 'gift-float',  sure: 2000, boyut: 'text-4xl',  ekstraSinif: '',                 particleSayisi: 1 },
  orta:    { tipSinifi: 'gift-bounce', sure: 2500, boyut: 'text-5xl',  ekstraSinif: '',                 particleSayisi: 2 },
  premium: { tipSinifi: 'gift-bounce', sure: 3000, boyut: 'text-6xl',  ekstraSinif: 'vip-glow',         particleSayisi: 4 },
  luks:    { tipSinifi: 'gift-burst',  sure: 4000, boyut: 'text-7xl',  ekstraSinif: 'vip-glow',         particleSayisi: 8 },
}

/* Ana bileşen — hediye animasyonunu render eder, bitince onBitti çağırır */
export function DBHediyeAnimasyon({ emoji, isim, kategori, goldMaliyet, gondericIsim, onBitti }: DBHediyeAnimasyonProps) {
  const [goruntu, setGoruntu] = useState(true)
  const konfig = KATEGORI_KONFIG[kategori]

  useEffect(() => {
    const t = setTimeout(() => {
      setGoruntu(false)
      onBitti?.()
    }, konfig.sure)
    return () => clearTimeout(t)
  }, [konfig.sure, onBitti])

  if (!goruntu) return null

  const particles: HediyeParticle[] = Array.from({ length: konfig.particleSayisi }, (_, i) => ({
    id: `p-${i}`,
    emoji,
    x: 20 + (i * (60 / Math.max(konfig.particleSayisi - 1, 1))),
    tip: 'float' as const,
  }))

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center">

      {/* Lüks için tam ekran flaş */}
      {kategori === 'luks' && (
        <div
          className="absolute inset-0 bg-[rgba(201,168,76,0.08)] fade-in-scale"
          style={{ animation: 'fadeInScale 0.3s ease-out, fadeOut 0.6s 1.5s ease-in forwards' }}
        />
      )}

      {/* Merkez emoji */}
      <div className={`relative flex flex-col items-center gap-3 ${konfig.tipSinifi}`}>
        <div className={`${konfig.boyut} ${konfig.ekstraSinif} leading-none`}>{emoji}</div>
        <div className="flex flex-col items-center gap-1 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-[#F0EDE8] font-bold text-lg" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {isim}
          </p>
          <p className="text-[#A09080] text-sm">
            <span className="font-semibold text-[#F0EDE8]">{gondericIsim}</span> gönderdi
          </p>
          <div className="flex items-center gap-1.5 bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] px-3 py-1 rounded-full mt-1">
            <span className="text-[#C9A84C] font-bold text-sm">{goldMaliyet} 🪙</span>
          </div>
        </div>
      </div>

      {/* Particle'lar (premium ve lüks için) */}
      {(kategori === 'premium' || kategori === 'luks') && particles.map(p => (
        <div
          key={p.id}
          className="absolute bottom-1/4 text-2xl gift-float"
          style={{
            left: `${p.x}%`,
            animationDelay: `${Math.random() * 0.4}s`,
            animationDuration: `${1.5 + Math.random() * 1}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}

    </div>
  )
}

/* Hook — dışarıdan kolayca tetiklemek için */
export function useHediyeAnimasyon() {
  const [aktif, setAktif] = useState<DBHediyeAnimasyonProps | null>(null)

  const goster = (props: Omit<DBHediyeAnimasyonProps, 'onBitti'>) => {
    setAktif({ ...props, onBitti: () => setAktif(null) })
  }

  const element = aktif ? <DBHediyeAnimasyon {...aktif} /> : null

  return { goster, element }
}
