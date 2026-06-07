'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Trophy, TrendingUp, Zap } from 'lucide-react'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { useSalon } from '@/hooks/useSalon'

/* ── Mock aktivite akışı ────────────────────────── */
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
  { tip: 'hediye',  gondericIsim: 'Mert K.',    aliciIsim: 'Leyla',  icerik: 'Diamond Ring gönderdi',   emoji: '💍', goldMaliyet: 500 },
  { tip: 'masa',    gondericIsim: 'Ahmet Y.',   aliciIsim: 'Selin',  icerik: 'masaya oturdu',            emoji: '🎭', goldMaliyet: 120 },
  { tip: 'hediye',  gondericIsim: 'Can B.',     aliciIsim: 'Ayşe',   icerik: 'Gold Bilezik gönderdi',   emoji: '💛', goldMaliyet: 150 },
  { tip: 'vip',     gondericIsim: 'Emre T.',                         icerik: 'Silver VIP oldu',          emoji: '⭐' },
  { tip: 'hediye',  gondericIsim: 'Burak A.',   aliciIsim: 'Zeynep', icerik: 'Parfüm gönderdi',         emoji: '🌸', goldMaliyet: 50  },
  { tip: 'katilim', gondericIsim: 'Selim D.',   aliciIsim: 'Leyla',  icerik: 'yayına katıldı',          emoji: '👁️' },
  { tip: 'hediye',  gondericIsim: 'Okan M.',    aliciIsim: 'Selin',  icerik: 'Çikolata gönderdi',       emoji: '🍫', goldMaliyet: 20  },
  { tip: 'vip',     gondericIsim: 'Ferhat K.',                        icerik: 'Gold VIP oldu',           emoji: '👑' },
  { tip: 'hediye',  gondericIsim: 'Tarık B.',   aliciIsim: 'Ayşe',   icerik: 'Gül gönderdi',            emoji: '🌹', goldMaliyet: 10  },
  { tip: 'masa',    gondericIsim: 'Cem Y.',     aliciIsim: 'Zeynep', icerik: 'özel masaya oturdu',       emoji: '🎪', goldMaliyet: 250 },
  { tip: 'hediye',  gondericIsim: 'Hakan S.',   aliciIsim: 'Leyla',  icerik: 'Diamond Ring gönderdi',   emoji: '💍', goldMaliyet: 500 },
  { tip: 'katilim', gondericIsim: 'Volkan A.',  aliciIsim: 'Selin',  icerik: 'yayına katıldı',          emoji: '👁️' },
]

/* Liderlik mock verisi */
const LIDERLER = [
  { isim: 'Mert K.',   gold: 4820, rozet: '👑' },
  { isim: 'Ahmet Y.',  gold: 3150, rozet: '💎' },
  { isim: 'Can B.',    gold: 2490, rozet: '🥇' },
  { isim: 'Emre T.',   gold: 1870, rozet: '🥈' },
  { isim: 'Burak A.',  gold: 1420, rozet: '🥉' },
]

function aktiviteRenk(tip: AktiviteTip): string {
  switch (tip) {
    case 'hediye':  return 'text-[#C9A84C]'
    case 'vip':     return 'text-[#9C27B0]'
    case 'masa':    return 'text-[#4CAF50]'
    case 'katilim': return 'text-[#5A5050]'
  }
}

function zamanMetni(ts: number): string {
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
      ...a,
      id: `init-${i}`,
      zaman: Date.now() - (i + 1) * 18000,
    }))
  )
  const counterRef = useRef(0)

  /* Her 4-7 saniyede yeni aktivite ekle */
  useEffect(() => {
    const ekle = () => {
      const template = MOCK_AKTIVITELER[counterRef.current % MOCK_AKTIVITELER.length]
      counterRef.current++
      const yeni: Aktivite = { ...template, id: `a-${Date.now()}`, zaman: Date.now() }
      setAktiviteler(prev => [yeni, ...prev].slice(0, 12))
    }

    const interval = setInterval(ekle, 4500 + Math.random() * 2500)
    return () => clearInterval(interval)
  }, [])

  /* Zaman etiketlerini güncelle */
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 15000)
    return () => clearInterval(t)
  }, [])

  return (
    <aside className="hidden xl:flex flex-col fixed right-0 top-0 h-screen w-[350px] border-l border-[rgba(201,168,76,0.08)] bg-[#0A0A0A] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

      {/* ── Platform durumu ── */}
      <div className="px-5 pt-6 pb-4 border-b border-[rgba(201,168,76,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[#C9A84C] leading-none gold-shimmer"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 42, fontWeight: 700 }}
            >
              {cevrimiciSayisi}
            </span>
            <span className="db-kucuk text-[#5A5050]">aktif yayıncı</span>
          </div>
          <div className="text-right flex flex-col gap-1.5 items-end">
            <div className="flex items-center gap-1.5 bg-[#8B1A2A] rounded-full px-3 py-1.5 pulse-border-live">
              <span className="w-2 h-2 rounded-full bg-[#FF4444] animate-pulse" />
              <span className="text-white text-[11px] font-bold tracking-wider uppercase">Canlı</span>
            </div>
            <span className="db-kucuk text-[#5A5050]">platform aktif</span>
          </div>
        </div>
      </div>

      {/* ── Canlı Aktivite Akışı ── */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Zap size={11} className="text-[#FF4444]" />
          <p className="db-etiket text-[#5A5050]">CANLI AKTİVİTE</p>
        </div>

        <div className="flex flex-col gap-1">
          {aktiviteler.map((a, i) => (
            <AktiviteKarti key={a.id} aktivite={a} index={i} />
          ))}
        </div>
      </div>

      {/* ── Haftalık Liderlik ── */}
      <div className="px-5 py-4 border-t border-[rgba(201,168,76,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={11} className="text-[#C9A84C]" />
            <p className="db-etiket text-[#5A5050]">BU HAFTA EN CÖMERTLer</p>
          </div>
          <Link href="/siralama" className="text-[10px] text-[#C9A84C] hover:text-[#E0C070] transition-colors font-medium uppercase tracking-wide">
            Tümü
          </Link>
        </div>
        <div className="flex flex-col gap-1.5">
          {LIDERLER.map((l, i) => (
            <div key={l.isim} className="flex items-center gap-2.5 py-1.5">
              <span className="text-sm w-4 text-center">{l.rozet}</span>
              <DBAvatar src={null} initials={l.isim} size={28} />
              <span className="db-kucuk text-[#A09080] flex-1 truncate">{l.isim}</span>
              <span className="db-kucuk text-[#C9A84C] font-semibold">{l.gold.toLocaleString('tr-TR')} 🪙</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trend etiketi ── */}
      <div className="px-5 py-4 border-t border-[rgba(201,168,76,0.06)]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={11} className="text-[#5A5050]" />
          <p className="db-etiket text-[#5A5050]">TREND</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['#GeceSohbeti','#CanlıMüzik','#VIPGecesi','#DansGecesi','#YeniYayıncı'].map(e => (
            <Link
              key={e}
              href={`/kesfet`}
              className="text-[11px] text-[#C9A84C] bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.15)] px-2.5 py-1 rounded-full hover:bg-[rgba(201,168,76,0.15)] transition-colors"
            >
              {e}
            </Link>
          ))}
        </div>
      </div>

    </aside>
  )
}

/* ── Aktivite Kartı ──────────────────────────────── */
function AktiviteKarti({ aktivite: a, index }: { aktivite: Aktivite; index: number }) {
  const renk = aktiviteRenk(a.tip)
  const isYeni = index === 0

  return (
    <div
      className={[
        'flex items-start gap-2.5 px-3 py-2.5 rounded-[10px] transition-all',
        isYeni ? 'bg-[rgba(201,168,76,0.06)] slide-in-right' : 'hover:bg-[#111111]',
      ].join(' ')}
    >
      <DBAvatar src={null} initials={a.gondericIsim} size={28} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#F0EDE8] leading-snug">
          <span className="font-semibold">{a.gondericIsim}</span>
          {a.aliciIsim && (
            <span className="text-[#5A5050]"> → <span className={`font-medium ${renk}`}>{a.aliciIsim}</span></span>
          )}
          <span className="text-[#A09080]"> {a.icerik}</span>
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-base leading-none">{a.emoji}</span>
          {a.goldMaliyet && (
            <span className="text-[10px] text-[#C9A84C] font-semibold">{a.goldMaliyet} 🪙</span>
          )}
          <span className="text-[10px] text-[#3A3030] ml-auto">{zamanMetni(a.zaman)}</span>
        </div>
      </div>
    </div>
  )
}
