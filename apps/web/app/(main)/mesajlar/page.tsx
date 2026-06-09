'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ChevronLeft, Search } from 'lucide-react'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { useAuth } from '@/hooks/useAuth'
import { useSalon } from '@/hooks/useSalon'

interface Konusma {
  id: number; isim: string; son: string; zaman: string; okunmamis: number
}
interface Mesaj {
  id: number; ben: boolean; metin: string; zaman: string
}

const KONUSMALAR: Konusma[] = [
  { id: 1, isim: 'Ece Demir',  son: 'Merhaba! Yayınıma hoş geldin 👋',   zaman: '22:30', okunmamis: 2 },
  { id: 2, isim: 'Sara Aydın', son: 'Teşekkürler hediye için!',            zaman: '5 dk',  okunmamis: 0 },
  { id: 3, isim: 'Luna',       son: 'Yarın aynı saatte görüşürüz',         zaman: '1 sa',  okunmamis: 1 },
  { id: 4, isim: 'Zeynep',     son: 'Harika geliyorsun, şaşın süper!',     zaman: '12:00', okunmamis: 0 },
]

const MESAJLAR: Mesaj[] = [
  { id: 1, ben: false, metin: 'Merhaba! Yayınıma hoş geldin 👋',   zaman: '22:28' },
  { id: 2, ben: true,  metin: 'Merhaba Ece! Çok güzel yayın',       zaman: '22:29' },
  { id: 3, ben: false, metin: 'Teşekkürler 😊 Nasılsın?',           zaman: '22:30' },
  { id: 4, ben: true,  metin: 'İyiyim, sen de güzel görünüyorsun',  zaman: '22:31' },
]

const SIDEBAR_BG = 'rgba(8,8,14,0.97)'
const PANEL_BG   = 'rgba(6,6,10,0.98)'

function KonusmaListesi({
  konusmalar, seciliId, gorselMap, onSec,
}: {
  konusmalar: Konusma[]; seciliId: number; gorselMap: Record<string, string | null | undefined>
  onSec: (id: number) => void
}) {
  const [arama, setArama] = useState('')
  const filtreli = arama.trim()
    ? konusmalar.filter(k => k.isim.toLowerCase().includes(arama.toLowerCase()) || k.son.toLowerCase().includes(arama.toLowerCase()))
    : konusmalar

  return (
    <div className="flex flex-col h-full">
      {/* Başlık */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
        <h2 className="text-[#F0EDE8] font-bold text-lg mb-3"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}>Mesajlar</h2>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5050]" />
          <input
            type="text"
            value={arama}
            onChange={e => setArama(e.target.value)}
            placeholder="Ara..."
            className="w-full h-9 rounded-xl pl-9 pr-3 text-[13px] text-[#F0EDE8] transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {filtreli.map((k) => (
          <motion.button
            key={k.id}
            onClick={() => onSec(k.id)}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors relative"
            style={{
              background: k.id === seciliId ? 'rgba(201,168,76,0.07)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            {k.id === seciliId && (
              <motion.div
                layoutId="conv-active"
                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                style={{ background: '#C9A84C' }}
              />
            )}
            <DBAvatar src={gorselMap[k.isim] || null} initials={k.isim} size={42} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13.5px] font-semibold text-[#F0EDE8] truncate">{k.isim}</p>
                <span className="text-[10px] text-[#5A5050] shrink-0">{k.zaman}</span>
              </div>
              <p className="text-[12px] text-[#5A5050] truncate mt-0.5">{k.son}</p>
            </div>
            {k.okunmamis > 0 && (
              <span className="shrink-0 min-w-[18px] h-[18px] bg-[#8B1A2A] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {k.okunmamis}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function SohbetPaneli({
  konusma, mesajlar, yeniMesaj, onMesajChange, onGonder, onGeri, gorselMap,
}: {
  konusma: Konusma; mesajlar: Mesaj[]; yeniMesaj: string
  onMesajChange: (v: string) => void; onGonder: () => void
  onGeri?: () => void; gorselMap: Record<string, string | null | undefined>
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.08)', background: PANEL_BG }}>
        {onGeri && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={onGeri}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ChevronLeft size={18} className="text-[#A09080]" />
          </motion.button>
        )}
        <DBAvatar src={gorselMap[konusma.isim] || null} initials={konusma.isim} size={38} status="online" />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#F0EDE8] leading-tight">{konusma.isim}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"
              style={{ boxShadow: '0 0 4px rgba(76,175,80,0.7)' }} />
            <span className="text-[10px] text-[#4CAF50]">Çevrimiçi</span>
          </div>
        </div>
      </div>

      {/* Mesaj alanı */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5"
        style={{ minHeight: 0, scrollbarWidth: 'none' }}>
        {mesajlar.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className={['flex', m.ben ? 'justify-end' : 'justify-start'].join(' ')}
          >
            <div
              className="max-w-[75%] rounded-[16px] px-4 py-2.5"
              style={{
                background: m.ben
                  ? 'linear-gradient(135deg, rgba(139,26,42,0.85) 0%, rgba(100,15,28,0.9) 100%)'
                  : 'rgba(255,255,255,0.06)',
                border: m.ben
                  ? '1px solid rgba(201,168,76,0.15)'
                  : '1px solid rgba(255,255,255,0.07)',
                borderBottomRightRadius: m.ben ? 4 : 16,
                borderBottomLeftRadius:  m.ben ? 16 : 4,
              }}
            >
              <p className="text-[13.5px] text-[#F0EDE8] leading-snug">{m.metin}</p>
              <p className={['text-[10px] mt-0.5', m.ben ? 'text-[rgba(240,237,232,0.45)] text-right' : 'text-[#5A5050]'].join(' ')}>
                {m.zaman}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 py-3 flex items-center gap-2.5"
        style={{ borderTop: '1px solid rgba(201,168,76,0.08)', background: PANEL_BG }}>
        <input
          type="text"
          value={yeniMesaj}
          onChange={(e) => onMesajChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onGonder()}
          placeholder="Mesaj yaz..."
          className="flex-1 h-10 rounded-full px-4 text-[14px] text-[#F0EDE8] transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            outline: 'none',
          }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onGonder}
          disabled={!yeniMesaj.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-35"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #A8872E)' }}
        >
          <Send size={15} className="text-[#0A0A0A]" />
        </motion.button>
      </div>
    </div>
  )
}

function MesajlarInner() {
  useAuth()
  const searchParams = useSearchParams()
  const { yayincilar } = useSalon('tumu')
  const gorselMap = Object.fromEntries(yayincilar.map(y => [y.displayName, y.avatarUrl]))

  const [konusmalar, setKonusmalar] = useState<Konusma[]>(KONUSMALAR)
  const [seciliId, setSeciliId]     = useState<number>(1)
  const [mesajlar, setMesajlar]     = useState<Mesaj[]>(MESAJLAR)
  const [yeniMesaj, setYeniMesaj]   = useState('')
  const [mobilGorunum, setMobilGorunum] = useState<'liste' | 'sohbet'>('liste')

  // ?performer=İsim — URL'den gelen performer'ı konuşma listesinde aç
  useEffect(() => {
    const isim = searchParams.get('performer')
    if (!isim) return
    const mevcut = konusmalar.find(k => k.isim === isim)
    if (mevcut) {
      setSeciliId(mevcut.id)
      setMobilGorunum('sohbet')
    } else {
      const yeniId = Date.now()
      const yeni: Konusma = { id: yeniId, isim, son: 'Yeni sohbet', zaman: 'Şimdi', okunmamis: 0 }
      setKonusmalar(prev => [yeni, ...prev])
      setSeciliId(yeniId)
      setMesajlar([])
      setMobilGorunum('sohbet')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const seciliKonusma = konusmalar.find(k => k.id === seciliId) ?? konusmalar[0]

  function gonder() {
    const trimmed = yeniMesaj.trim()
    if (!trimmed) return
    setMesajlar(prev => [
      ...prev,
      { id: prev.length + 1, ben: true, metin: trimmed,
        zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) },
    ])
    setYeniMesaj('')
  }

  function secKonusma(id: number) {
    setSeciliId(id)
    setMobilGorunum('sohbet')
  }

  return (
    <div className="mesh-bg" style={{ height: 'calc(100dvh - 68px)', display: 'flex', overflow: 'hidden' }}>

      {/* ── Masaüstü Sol Panel ── */}
      <div className="hidden md:flex flex-col shrink-0 border-r"
        style={{
          width: 268,
          background: SIDEBAR_BG,
          borderColor: 'rgba(201,168,76,0.1)',
        }}>
        <KonusmaListesi
          konusmalar={konusmalar}
          seciliId={seciliId}
          gorselMap={gorselMap}
          onSec={setSeciliId}
        />
      </div>

      {/* ── Masaüstü Sağ Panel ── */}
      <div className="hidden md:flex flex-1 flex-col" style={{ background: PANEL_BG }}>
        <SohbetPaneli
          konusma={seciliKonusma}
          mesajlar={mesajlar}
          yeniMesaj={yeniMesaj}
          onMesajChange={setYeniMesaj}
          onGonder={gonder}
          gorselMap={gorselMap}
        />
      </div>

      {/* ── Mobil Görünüm ── */}
      <div className="flex md:hidden flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {mobilGorunum === 'liste' ? (
            <motion.div
              key="liste"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
              style={{ background: SIDEBAR_BG }}
            >
              <KonusmaListesi
                konusmalar={konusmalar}
                seciliId={seciliId}
                gorselMap={gorselMap}
                onSec={secKonusma}
              />
            </motion.div>
          ) : (
            <motion.div
              key="sohbet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
              style={{ background: PANEL_BG }}
            >
              <SohbetPaneli
                konusma={seciliKonusma}
                mesajlar={mesajlar}
                yeniMesaj={yeniMesaj}
                onMesajChange={setYeniMesaj}
                onGonder={gonder}
                onGeri={() => setMobilGorunum('liste')}
                gorselMap={gorselMap}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function MesajlarPage() {
  return (
    <Suspense>
      <MesajlarInner />
    </Suspense>
  )
}
