'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HediyeDetay } from '@/lib/kutlama'

export type HediyeKategori = 'temel' | 'orta' | 'premium' | 'luks'

interface HediyeParticle {
  id: string
  emoji: string
  x: number
  y: number
  delay: number
  duration: number
}

interface DBHediyeAnimasyonProps {
  emoji: string
  isim: string
  kategori: HediyeKategori
  goldMaliyet: number
  gondericIsim: string
  onBitti?: () => void
}

const KONFIG: Record<HediyeKategori, {
  sure: number
  boyut: string
  particleSayisi: number
  initialScale: number
}> = {
  temel:   { sure: 2000, boyut: 'text-4xl',  particleSayisi: 0, initialScale: 0.7 },
  orta:    { sure: 2500, boyut: 'text-5xl',  particleSayisi: 2, initialScale: 0.5 },
  premium: { sure: 3000, boyut: 'text-6xl',  particleSayisi: 4, initialScale: 0.3 },
  luks:    { sure: 4000, boyut: 'text-7xl',  particleSayisi: 8, initialScale: 0.1 },
}

export function DBHediyeAnimasyon({
  emoji, isim, kategori, goldMaliyet, gondericIsim, onBitti,
}: DBHediyeAnimasyonProps) {
  const [goruntu, setGoruntu] = useState(true)
  const konfig = KONFIG[kategori]
  const isLuks = kategori === 'luks'
  const isPremium = kategori === 'premium' || isLuks

  useEffect(() => {
    const t = setTimeout(() => {
      setGoruntu(false)
      onBitti?.()
    }, konfig.sure)
    return () => clearTimeout(t)
  }, [konfig.sure, onBitti])

  const particles: HediyeParticle[] = Array.from({ length: konfig.particleSayisi }, (_, i) => ({
    id: `p-${i}`,
    emoji,
    x: 15 + (i * (70 / Math.max(konfig.particleSayisi - 1, 1))),
    y: 20 + Math.random() * 30,
    delay: i * 0.08,
    duration: 1.4 + Math.random() * 0.8,
  }))

  return (
    <AnimatePresence>
      {goruntu && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Lüks: tam ekran flaş */}
          {isLuks && (
            <motion.div
              className="absolute inset-0 bg-[rgba(201,168,76,0.07)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.4] }}
              transition={{ duration: 0.8, times: [0, 0.2, 1] }}
            />
          )}

          {/* Merkez animasyon */}
          <motion.div
            className="relative flex flex-col items-center gap-3"
            initial={{ scale: konfig.initialScale, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -40 }}
            transition={{
              type: 'spring',
              stiffness: isLuks ? 220 : 260,
              damping: isLuks ? 14 : 18,
            }}
          >
            {/* Emoji */}
            <motion.div
              className={`${konfig.boyut} leading-none ${isLuks ? 'vip-glow' : ''}`}
              animate={isPremium ? {
                scale: [1, 1.12, 1, 1.06, 1],
                rotate: isLuks ? [0, -4, 4, -2, 0] : [0, 0, 0, 0, 0],
              } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {emoji}
            </motion.div>

            {/* Bilgi */}
            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <p
                className="text-[#F0EDE8] font-bold text-lg"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                {isim}
              </p>
              <p className="text-[#A09080] text-sm">
                <span className="font-semibold text-[#F0EDE8]">{gondericIsim}</span> gönderdi
              </p>
              <motion.div
                className="flex items-center gap-1.5 bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] px-3 py-1 rounded-full mt-1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              >
                <span className="text-[#C9A84C] font-bold text-sm">{goldMaliyet} 🪙</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Particle'lar */}
          {isPremium && particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute text-2xl"
              style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: -120, scale: [0.5, 1.1, 1, 0.7] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function useHediyeAnimasyon() {
  const [aktif, setAktif] = useState<DBHediyeAnimasyonProps | null>(null)

  const goster = (props: Omit<DBHediyeAnimasyonProps, 'onBitti'>) => {
    setAktif({ ...props, onBitti: () => setAktif(null) })
  }

  const element = aktif ? <DBHediyeAnimasyon {...aktif} /> : null

  return { goster, element }
}

const GECERLI_KATEGORI: HediyeKategori[] = ['temel', 'orta', 'premium', 'luks']
function normalizeKategori(k?: string | null): HediyeKategori {
  return (GECERLI_KATEGORI as string[]).includes(k ?? '') ? (k as HediyeKategori) : 'orta'
}

/**
 * Olay-tetikli hediye animasyonu katmanı — `hediyePatlat()` çağrısında oynatır.
 * (main) layout'a monteli; her yerden tetiklenebilir. Kategori savunmacı normalize
 * edilir (bilinmeyen değer → 'orta'), bu yüzden bozuk veriyle çökmez.
 */
export function HediyeKatmani() {
  const [aktif, setAktif] = useState<DBHediyeAnimasyonProps | null>(null)
  useEffect(() => {
    function dinle(e: Event) {
      const d = (e as CustomEvent<HediyeDetay>).detail
      if (!d) return
      setAktif({
        emoji: d.emoji || '🎁',
        isim: d.isim || 'Hediye',
        kategori: normalizeKategori(d.kategori),
        goldMaliyet: d.gold ?? 0,
        gondericIsim: d.gonderen || '',
        onBitti: () => setAktif(null),
      })
    }
    window.addEventListener('db:hediye', dinle)
    return () => window.removeEventListener('db:hediye', dinle)
  }, [])
  return aktif ? <DBHediyeAnimasyon {...aktif} /> : null
}
