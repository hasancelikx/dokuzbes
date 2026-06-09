'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Gift, MapPin, Star, ChevronUp, Compass } from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import type { Yayinci } from '@/types/yayinci'
import { PA } from '@/lib/mockAvatars'

const MOCK: Yayinci[] = [
  { id: 'mock-1', displayName: 'Leyla',      avatarUrl: PA['Leyla'],      city: 'İstanbul', durum: 'musait', aktifIzleyici: 0,  toplamGorusme: 342,  toplamHediye: 1290, puan: 4.8, vipSeviye: 2, etiketler: ['sohbet', 'müzik']         },
  { id: 'mock-2', displayName: 'Ece Yıldız', avatarUrl: PA['Ece Yıldız'], city: 'Ankara',   durum: 'online', aktifIzleyici: 47, toplamGorusme: 891,  toplamHediye: 3401, puan: 4.9, vipSeviye: 3, etiketler: ['dans', 'eğlence']         },
  { id: 'mock-3', displayName: 'Selin',      avatarUrl: PA['Selin'],      city: 'İzmir',    durum: 'musait', aktifIzleyici: 0,  toplamGorusme: 203,  toplamHediye:  780, puan: 4.6, vipSeviye: 1, etiketler: ['müzik']                   },
  { id: 'mock-4', displayName: 'Zeynep',     avatarUrl: PA['Zeynep'],     city: 'Bursa',    durum: 'musait', aktifIzleyici: 0,  toplamGorusme: 567,  toplamHediye: 2340, puan: 4.7, vipSeviye: 2, etiketler: ['sohbet']                  },
  { id: 'mock-5', displayName: 'Luna',       avatarUrl: PA['Luna'],       city: 'İstanbul', durum: 'online', aktifIzleyici: 23, toplamGorusme: 1203, toplamHediye: 5670, puan: 5.0, vipSeviye: 3, etiketler: ['dans', 'eğlence', 'müzik'] },
  { id: 'mock-6', displayName: 'Ayşe G.',    avatarUrl: PA['Ayşe G.'],   city: 'İstanbul', durum: 'musait', aktifIzleyici: 0,  toplamGorusme: 445,  toplamHediye: 1890, puan: 4.5, vipSeviye: 1, etiketler: ['sohbet']                  },
]

// Her performer için renk paleti
const PALETTES = [
  { dark: '#1A0008', mid: '#6B0F1A', accent: '#C9A84C' },
  { dark: '#080820', mid: '#1A1466', accent: '#8B7FE8' },
  { dark: '#081408', mid: '#1A4D20', accent: '#66BB6A' },
  { dark: '#160824', mid: '#4A1070', accent: '#CE93D8' },
  { dark: '#181008', mid: '#5C3200', accent: '#FFB74D' },
  { dark: '#041414', mid: '#005252', accent: '#4DD0E1' },
]

function palette(id: string) {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return PALETTES[n % PALETTES.length]
}

export default function SalonPage() {
  useAuth()
  const { yayincilar, yukleniyor } = useSalon('tumu')
  const liste = yayincilar.length > 0 ? yayincilar : MOCK
  const canlilar  = liste.filter(y => y.durum === 'online')
  const musaitler = liste.filter(y => y.durum !== 'online')
  // Canlılar önce
  const sirali = [...canlilar, ...musaitler]

  const [begendiler, setBegendiler] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try { return new Set(JSON.parse(localStorage.getItem('salon-begen') ?? '[]')) }
    catch { return new Set() }
  })
  const [aktifIdx, setAktifIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const begen = useCallback((id: string) => {
    setBegendiler(p => {
      const n = new Set(p)
      n.has(id) ? n.delete(id) : n.add(id)
      try { localStorage.setItem('salon-begen', JSON.stringify([...n])) } catch {}
      return n
    })
  }, [])

  // Scroll'dan aktif kartı takip et
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight)
      setAktifIdx(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  if (yukleniyor) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-68px)] md:h-screen" style={{ background: '#050508' }}>
        <DBLoadingSpinner size={44} />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden" style={{ height: 'calc(100dvh - 68px)', background: '#050508' }}>

      {/* ── Üst header — saydam, kartların üzerinde ── */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)', paddingBottom: 56 }}>
        <div className="flex items-center justify-between px-5 pt-safe-top pt-5 pointer-events-auto">
          <div>
            <h1 className="text-white font-bold leading-none"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, letterSpacing: '0.02em' }}>
              Salon
            </h1>
            <p className="text-white/40 text-[10px] mt-0.5 tracking-widest">
              {canlilar.length > 0 ? `${canlilar.length} CANLI · ` : ''}{musaitler.length} MÜSAİT
            </p>
          </div>
          <Link href="/kesfet"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', backdropFilter: 'blur(12px)' }}>
            <Compass size={13} className="text-[#C9A84C]" />
            <span className="text-[#C9A84C] text-[11px] font-bold tracking-widest">KEŞFET</span>
          </Link>
        </div>
      </div>

      {/* ── Kart sayacı — sağ orta ── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 pointer-events-none">
        {sirali.map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: i === aktifIdx ? 18 : 4, opacity: i === aktifIdx ? 1 : 0.25 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="w-1 rounded-full"
            style={{ background: i === aktifIdx ? '#C9A84C' : 'rgba(255,255,255,0.4)', minHeight: 4 }}
          />
        ))}
      </div>

      {/* ── Swipe alanı ── */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {sirali.map((y, i) => (
          <PerformerKart
            key={y.id}
            yayinci={y}
            begendi={begendiler.has(y.id)}
            onBegen={() => begen(y.id)}
            isFirst={i === 0}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────── */

function PerformerKart({ yayinci, begendi, onBegen, isFirst }: {
  yayinci: Yayinci
  begendi: boolean
  onBegen: () => void
  isFirst: boolean
}) {
  const p        = palette(yayinci.id)
  const isCanli  = yayinci.durum === 'online'
  const [hintiGoster, setHintiGoster] = useState(isFirst)

  useEffect(() => {
    if (!isFirst) return
    const t = setTimeout(() => setHintiGoster(false), 3000)
    return () => clearTimeout(t)
  }, [isFirst])

  return (
    <div
      className="relative overflow-hidden flex-shrink-0"
      style={{ height: 'calc(100dvh - 68px)', scrollSnapAlign: 'start' }}
    >
      {/* Gradient arka plan */}
      <div className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 130% 90% at 15% 65%, ${p.dark}ff 0%, transparent 50%),
            radial-gradient(ellipse 90% 130% at 85% 25%, ${p.mid}cc 0%, transparent 50%),
            radial-gradient(ellipse 70% 70% at 50% 95%, ${p.accent}18 0%, transparent 55%),
            #050508
          `,
        }}
      />

      {/* Dekoratif ışık lekeleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full blur-3xl opacity-20"
          style={{ width: 320, height: 320, top: '5%', left: '-15%', background: p.accent }} />
        <div className="absolute rounded-full blur-3xl opacity-15"
          style={{ width: 280, height: 280, bottom: '15%', right: '-10%', background: p.mid }} />
      </div>

      {/* Fotoğraf veya baş harf */}
      {yayinci.avatarUrl ? (
        <img
          src={yayinci.avatarUrl}
          alt={yayinci.displayName}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <motion.span
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 0.05 }}
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(160px, 42vw, 280px)',
              color: `${p.accent}40`,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {yayinci.displayName.slice(0, 1)}
          </motion.span>
        </div>
      )}

      {/* Alt karartma */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

      {/* ── Durum badge — üst ── */}
      <div className="absolute top-[72px] left-5 z-20">
        <AnimatePresence>
          {isCanli ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: 'rgba(100,0,15,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,60,60,0.3)' }}
            >
              <motion.span
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#FF3C3C]"
              />
              <span className="text-white text-[10px] font-black tracking-widest">CANLI</span>
              {yayinci.aktifIzleyici > 0 && (
                <span className="text-white/60 text-[10px]">· {yayinci.aktifIzleyici} izleyici</span>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: 'rgba(10,50,15,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(76,175,80,0.35)' }}
            >
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"
              />
              <span className="text-white text-[10px] font-black tracking-widest">MÜSAİT</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sağ aksiyonlar — TikTok tarzı ── */}
      <div className="absolute right-4 z-20 flex flex-col items-center gap-6"
        style={{ bottom: 160 }}>

        {/* Beğen */}
        <motion.button
          onClick={onBegen}
          whileTap={{ scale: 0.75 }}
          className="flex flex-col items-center gap-1.5"
        >
          <motion.div
            animate={begendi ? { scale: [1, 1.5, 0.9, 1.1, 1], rotate: [0, -20, 10, -5, 0] } : {}}
            transition={{ duration: 0.45 }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: begendi ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: `1px solid ${begendi ? 'rgba(244,67,54,0.4)' : 'rgba(255,255,255,0.12)'}` }}
          >
            <Heart size={20} strokeWidth={1.8}
              fill={begendi ? '#F44336' : 'none'}
              className={begendi ? 'text-[#F44336]' : 'text-white'} />
          </motion.div>
          <span className="text-white/60 text-[10px] font-medium">
            {((yayinci.toplamHediye ?? 0) / 1000).toFixed(1)}k
          </span>
        </motion.button>

        {/* Mesaj */}
        <Link href={`/yayinci/${yayinci.id}`} className="flex flex-col items-center gap-1.5">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <MessageCircle size={20} strokeWidth={1.8} className="text-white" />
          </div>
          <span className="text-white/60 text-[10px] font-medium">{yayinci.toplamGorusme ?? 0}</span>
        </Link>

        {/* Hediye */}
        <Link href={`/yayinci/${yayinci.id}`} className="flex flex-col items-center gap-1.5">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: `${p.accent}18`, backdropFilter: 'blur(12px)', border: `1px solid ${p.accent}35` }}>
            <Gift size={20} strokeWidth={1.8} style={{ color: p.accent }} />
          </div>
          <span className="text-white/60 text-[10px] font-medium">Hediye</span>
        </Link>
      </div>

      {/* ── Alt bilgi + CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-8"
      >
        {/* İsim + VIP */}
        <div className="flex items-baseline gap-2.5 mb-1">
          <h2 className="text-white font-bold leading-none"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38 }}>
            {yayinci.displayName}
          </h2>
          {yayinci.vipSeviye >= 2 && (
            <span className="text-xs font-black tracking-widest pb-1"
              style={{ color: p.accent }}>
              {yayinci.vipSeviye === 3 ? '✦ VIP' : 'VIP'}
            </span>
          )}
        </div>

        {/* Şehir + Puan */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <MapPin size={11} className="text-white/40" />
            <span className="text-white/50 text-[12px]">{yayinci.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={11} fill={p.accent} style={{ color: p.accent }} />
            <span className="text-white/80 text-[12px] font-semibold">{yayinci.puan?.toFixed(1)}</span>
          </div>
        </div>

        {/* Etiketler */}
        {yayinci.etiketler && yayinci.etiketler.length > 0 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            {yayinci.etiketler.slice(0, 3).map(e => (
              <span key={e}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: `${p.accent}15`,
                  color: p.accent,
                  border: `1px solid ${p.accent}30`,
                  backdropFilter: 'blur(8px)',
                }}>
                {e}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link href={`/yayinci/${yayinci.id}`} className="block">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full h-[54px] rounded-2xl font-black text-[14px] tracking-[0.15em] overflow-hidden relative"
            style={{
              background: isCanli
                ? 'linear-gradient(90deg, #5C0011, #8B1A2A, #C9A84C, #8B1A2A, #5C0011)'
                : `linear-gradient(90deg, ${p.dark}, ${p.mid}, ${p.accent}, ${p.mid}, ${p.dark})`,
              backgroundSize: '200% auto',
              animation: 'ctaShimmer 3s linear infinite',
              color: '#fff',
              boxShadow: isCanli
                ? '0 4px 32px rgba(139,26,42,0.5), 0 1px 0 rgba(201,168,76,0.3) inset'
                : `0 4px 32px ${p.accent}30, 0 1px 0 ${p.accent}25 inset`,
            }}
          >
            {isCanli ? '🎙  YAYINA KATIL' : '✦  OTUR'}
          </motion.button>
        </Link>
      </motion.div>

      {/* ── İlk kartta kaydır ipucu ── */}
      <AnimatePresence>
        {hintiGoster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="absolute z-30 flex flex-col items-center gap-1 pointer-events-none"
            style={{ bottom: 170, left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-1"
            >
              <ChevronUp size={16} className="text-white/35" />
              <span className="text-white/35 text-[10px] tracking-[0.2em]">kaydır</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
