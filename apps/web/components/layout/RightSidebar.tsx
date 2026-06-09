'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, TrendingUp, Zap, Crown, Flame } from 'lucide-react'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { useSalon } from '@/hooks/useSalon'

type AktiviteTip = 'hediye' | 'vip' | 'katilim' | 'masa'

interface Aktivite {
  id: string
  tip: AktiviteTip
  gondericIsim: string
  aliciIsim?: string
  icerik: string
  emoji: string
  goldMaliyet?: number
  zaman: number
}

const MOCK_AKTIVITELER: Omit<Aktivite, 'id' | 'zaman'>[] = [
  { tip: 'hediye',  gondericIsim: 'Mert K.',   aliciIsim: 'Leyla',  icerik: 'Diamond Ring gönderdi',  emoji: '💍', goldMaliyet: 500 },
  { tip: 'masa',    gondericIsim: 'Ahmet Y.',  aliciIsim: 'Selin',  icerik: 'masaya oturdu',           emoji: '🎭', goldMaliyet: 120 },
  { tip: 'hediye',  gondericIsim: 'Can B.',    aliciIsim: 'Ayşe',   icerik: 'Gold Bilezik gönderdi',  emoji: '💛', goldMaliyet: 150 },
  { tip: 'vip',     gondericIsim: 'Emre T.',                        icerik: 'Silver VIP oldu',         emoji: '⭐' },
  { tip: 'hediye',  gondericIsim: 'Burak A.',  aliciIsim: 'Zeynep', icerik: 'Parfüm gönderdi',        emoji: '🌸', goldMaliyet: 50  },
  { tip: 'katilim', gondericIsim: 'Selim D.',  aliciIsim: 'Leyla',  icerik: 'yayına katıldı',         emoji: '👁️' },
  { tip: 'hediye',  gondericIsim: 'Okan M.',   aliciIsim: 'Selin',  icerik: 'Çikolata gönderdi',      emoji: '🍫', goldMaliyet: 20  },
  { tip: 'vip',     gondericIsim: 'Ferhat K.',                      icerik: 'Gold VIP oldu',           emoji: '👑' },
  { tip: 'hediye',  gondericIsim: 'Tarık B.',  aliciIsim: 'Ayşe',   icerik: 'Gül gönderdi',           emoji: '🌹', goldMaliyet: 10  },
  { tip: 'masa',    gondericIsim: 'Cem Y.',    aliciIsim: 'Zeynep', icerik: 'özel masaya oturdu',      emoji: '🎪', goldMaliyet: 250 },
  { tip: 'hediye',  gondericIsim: 'Hakan S.',  aliciIsim: 'Leyla',  icerik: 'Diamond Ring gönderdi',  emoji: '💍', goldMaliyet: 500 },
  { tip: 'katilim', gondericIsim: 'Volkan A.', aliciIsim: 'Selin',  icerik: 'yayına katıldı',         emoji: '👁️' },
]

const LIDERLER = [
  { isim: 'Mert K.',  gold: 4820, rozet: '👑', renk: '#C9A84C' },
  { isim: 'Ahmet Y.', gold: 3150, rozet: '💎', renk: '#C0C0D0' },
  { isim: 'Can B.',   gold: 2490, rozet: '🥇', renk: '#CD7F32' },
  { isim: 'Emre T.',  gold: 1870, rozet: '🥈', renk: '#5A5060' },
  { isim: 'Burak A.', gold: 1420, rozet: '🥉', renk: '#5A5060' },
]

const TIP_RENK: Record<AktiviteTip, string> = {
  hediye:  '#C9A84C',
  vip:     '#9C27B0',
  masa:    '#4CAF50',
  katilim: '#4A7090',
}

function zamanMetni(ts: number) {
  const sn = Math.floor((Date.now() - ts) / 1000)
  if (sn < 10) return 'Az önce'
  if (sn < 60) return `${sn} sn`
  return `${Math.floor(sn / 60)} dk`
}

export function RightSidebar() {
  const { yayincilar } = useSalon('online')
  const cevrimiciSayisi = yayincilar.length

  const [aktiviteler, setAktiviteler] = useState<Aktivite[]>(() =>
    MOCK_AKTIVITELER.slice(0, 5).map((a, i) => ({
      ...a, id: `init-${i}`, zaman: Date.now() - (i + 1) * 18000,
    }))
  )
  const counterRef = useRef(0)

  useEffect(() => {
    const ekle = () => {
      const template = MOCK_AKTIVITELER[counterRef.current % MOCK_AKTIVITELER.length]
      counterRef.current++
      setAktiviteler(prev => [
        { ...template, id: `a-${Date.now()}`, zaman: Date.now() },
        ...prev,
      ].slice(0, 12))
    }
    const interval = setInterval(ekle, 4500 + Math.random() * 2500)
    return () => clearInterval(interval)
  }, [])

  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 15000)
    return () => clearInterval(t)
  }, [])

  return (
    <aside
      className="hidden xl:flex flex-col fixed right-0 top-0 h-screen w-[350px] overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, #0C0C14 0%, #080810 60%, #060609 100%)',
        borderLeft: '1px solid rgba(201,168,76,0.1)',
        scrollbarWidth: 'none',
      }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)' }} />
        <div className="absolute bottom-1/3 left-0 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,26,42,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* ── Platform Status Card ── */}
      <div className="relative px-4 pt-5 pb-4">
        <div className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(139,26,42,0.1) 60%, rgba(12,12,20,0.8) 100%)',
            border: '1px solid rgba(201,168,76,0.22)',
            boxShadow: '0 0 40px rgba(201,168,76,0.06) inset',
          }}>
          {/* Decorative shine */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', transform: 'translate(40%, -40%)' }} />

          <div className="flex items-start justify-between relative">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-[0.22em] text-[#5A5050] uppercase mb-1">Aktif Yayıncı</span>
              <motion.span
                key={cevrimiciSayisi}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="leading-none"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 56, fontWeight: 700, color: '#C9A84C', lineHeight: 0.9 }}
              >
                {cevrimiciSayisi}
              </motion.span>
            </div>
            <div className="flex flex-col items-end gap-2 pt-1">
              <motion.div
                animate={{ boxShadow: ['0 0 0px rgba(255,68,68,0)', '0 0 14px rgba(255,68,68,0.35)', '0 0 0px rgba(255,68,68,0)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: 'rgba(139,26,42,0.35)', border: '1px solid rgba(255,68,68,0.3)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4444] animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-[#FF7777] uppercase">Canlı</span>
              </motion.div>
              <span className="text-[9px] text-[#3A3030]">platform aktif</span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-0 mt-3 pt-3"
            style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            {[
              { label: 'Bu Gece', value: '2.4K', icon: '👁️' },
              { label: 'Hediye',  value: '18.2K', icon: '🎁' },
              { label: 'Gold',    value: '84.5K', icon: '🪙' },
            ].map((s, i) => (
              <div key={s.label} className={['flex flex-col items-center gap-0.5', i > 0 ? 'border-l border-white/[0.05]' : ''].join(' ')}>
                <span className="text-[12px] font-bold text-[#D0C8BC]">{s.icon} {s.value}</span>
                <span className="text-[9px] text-[#3A3030]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Canlı Aktivite ── */}
      <div className="relative px-4 pb-4 flex-1 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={11} className="text-[#FF4444]" />
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#5A5050] uppercase">Canlı Aktivite</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#FF4444] animate-pulse" />
            <span className="text-[9px] text-[#3A3030]">gerçek zamanlı</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 overflow-hidden">
          <AnimatePresence initial={false}>
            {aktiviteler.map((a) => {
              const renk = TIP_RENK[a.tip]
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 28, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.26, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                    {/* Color left bar */}
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-r-full"
                      style={{ background: `linear-gradient(180deg, ${renk}CC, ${renk}44)` }} />

                    {/* Emoji circle */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] shrink-0 mt-0.5"
                      style={{ background: `${renk}18`, border: `1px solid ${renk}30` }}>
                      {a.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] leading-snug">
                        <span className="font-semibold text-[#F0EDE8]">{a.gondericIsim}</span>
                        {a.aliciIsim && (
                          <> <span className="text-[#3A3030]">›</span> <span className="font-medium" style={{ color: renk }}>{a.aliciIsim}</span></>
                        )}
                        <span className="text-[#5A5050]"> {a.icerik}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {a.goldMaliyet && (
                          <span className="text-[10px] font-bold" style={{ color: renk }}>
                            +{a.goldMaliyet} 🪙
                          </span>
                        )}
                        <span className="text-[9px] text-[#2A2A30] ml-auto">{zamanMetni(a.zaman)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Liderlik Tablosu ── */}
      <div className="relative px-4 py-4" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={11} className="text-[#C9A84C]" />
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#5A5050] uppercase">Bu Hafta En Cömert</p>
          </div>
          <Link href="/siralama"
            className="text-[9px] font-bold tracking-wider uppercase transition-colors"
            style={{ color: '#C9A84C' }}>
            Tümü →
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          {LIDERLER.map((l, i) => {
            const isTop3 = i < 3
            const bgGradients = [
              'linear-gradient(90deg, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0.03) 100%)',
              'linear-gradient(90deg, rgba(192,192,208,0.08) 0%, rgba(192,192,208,0.01) 100%)',
              'linear-gradient(90deg, rgba(180,120,60,0.08) 0%, rgba(180,120,60,0.01) 100%)',
            ]
            return (
              <motion.div
                key={l.isim}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.26, ease: 'easeOut' }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{
                  background: isTop3 ? bgGradients[i] : 'transparent',
                  border: isTop3 ? `1px solid ${l.renk}22` : '1px solid transparent',
                }}
              >
                {isTop3 ? (
                  <span className="text-[14px] w-5 text-center leading-none">{l.rozet}</span>
                ) : (
                  <span className="text-[11px] w-5 text-center font-bold text-[#3A3030]">{i + 1}</span>
                )}
                <DBAvatar src={null} initials={l.isim} size={26} />
                <span className="text-[12px] font-medium flex-1 truncate" style={{ color: isTop3 ? l.renk : '#5A5060' }}>
                  {l.isim}
                </span>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: isTop3 ? l.renk : '#3A3030' }}>
                  {l.gold.toLocaleString('tr-TR')} 🪙
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Trend ── */}
      <div className="relative px-4 py-4" style={{ borderTop: '1px solid rgba(201,168,76,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={11} className="text-[#C9A84C]" />
          <p className="text-[9px] font-bold tracking-[0.18em] text-[#5A5050] uppercase">Trend</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['#GeceSohbeti', '#CanlıMüzik', '#VIPGecesi', '#DansGecesi', '#YeniYayıncı'].map((e, i) => (
            <motion.div
              key={e}
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 22 }}
            >
              <Link href="/kesfet"
                className="block text-[11px] font-medium px-2.5 py-1 rounded-full transition-all hover:scale-105"
                style={{
                  color: '#C9A84C',
                  background: 'rgba(201,168,76,0.07)',
                  border: '1px solid rgba(201,168,76,0.15)',
                }}>
                {e}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── VIP Join CTA ── */}
      <div className="relative px-4 py-4" style={{ borderTop: '1px solid rgba(201,168,76,0.06)' }}>
        <Link href="/gold">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(139,26,42,0.12) 100%)',
              border: '1px solid rgba(201,168,76,0.25)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 80% 50%, rgba(201,168,76,0.08) 0%, transparent 60%)' }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
              style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Crown size={16} style={{ color: '#C9A84C' }} />
            </div>
            <div className="relative">
              <p className="text-[12px] font-bold text-[#C9A84C]">Gold VIP Ol</p>
              <p className="text-[10px] text-[#5A5050]">Özel ayrıcalıklar kazan</p>
            </div>
          </motion.div>
        </Link>
      </div>
    </aside>
  )
}
