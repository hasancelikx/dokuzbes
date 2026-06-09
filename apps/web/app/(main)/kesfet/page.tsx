'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Flame, MessageCircle, Music, Sparkles, Shuffle, X, Users, Radio } from 'lucide-react'
import { api } from '@/lib/apiClient'
import { DBPerformerCard } from '@/components/ui/DBPerformerCard'
import { DBSkeletonPerformer } from '@/components/ui/DBSkeleton'
import { DBEmpty } from '@/components/ui/DBEmpty'
import { useQuery } from '@tanstack/react-query'
import { PA } from '@/lib/mockAvatars'

interface PerformerListItem {
  id: string; displayName: string; avatarUrl?: string | null
  durum: string; category?: string | null; city?: string | null
  puan: number; aktifIzleyici: number; vipSeviye?: number
}
interface SonucVeri { yayincilar: PerformerListItem[]; toplam: number }

const MOCK_PERFORMERS: PerformerListItem[] = [
  { id: 'mock-1', displayName: 'Leyla',      avatarUrl: PA['Leyla'],      durum: 'musait', category: 'sohbet', city: 'İstanbul', puan: 4.8, aktifIzleyici: 0,  vipSeviye: 2 },
  { id: 'mock-2', displayName: 'Ece Yıldız', avatarUrl: PA['Ece Yıldız'], durum: 'online', category: 'dans',   city: 'Ankara',   puan: 4.9, aktifIzleyici: 47, vipSeviye: 3 },
  { id: 'mock-3', displayName: 'Selin',      avatarUrl: PA['Selin'],      durum: 'musait', category: 'muzik',  city: 'İzmir',    puan: 4.6, aktifIzleyici: 0,  vipSeviye: 1 },
  { id: 'mock-4', displayName: 'Zeynep',     avatarUrl: PA['Zeynep'],     durum: 'musait', category: 'sohbet', city: 'Bursa',    puan: 4.7, aktifIzleyici: 0,  vipSeviye: 2 },
  { id: 'mock-5', displayName: 'Luna',       avatarUrl: PA['Luna'],       durum: 'online', category: 'dans',   city: 'İstanbul', puan: 5.0, aktifIzleyici: 23, vipSeviye: 3 },
  { id: 'mock-6', displayName: 'Ayşe G.',    avatarUrl: PA['Ayşe G.'],   durum: 'musait', category: 'sohbet', city: 'İstanbul', puan: 4.5, aktifIzleyici: 0,  vipSeviye: 1 },
  { id: 'mock-7', displayName: 'Mia',        avatarUrl: PA['Mia'],        durum: 'musait', category: 'muzik',  city: 'İzmir',    puan: 4.3, aktifIzleyici: 0,  vipSeviye: 1 },
  { id: 'mock-8', displayName: 'Karla',      avatarUrl: PA['Karla'],      durum: 'musait', category: 'dans',   city: 'Ankara',   puan: 4.7, aktifIzleyici: 0,  vipSeviye: 2 },
]

const KATEGORILER = [
  { value: '',       label: 'Tümü',   icon: Flame         },
  { value: 'sohbet', label: 'Sohbet', icon: MessageCircle },
  { value: 'muzik',  label: 'Müzik',  icon: Music         },
  { value: 'dans',   label: 'Dans',   icon: Sparkles      },
  { value: 'diger',  label: 'Diğer',  icon: Shuffle       },
]

/* Yayın programı saatleri story ringi için */
function LiveStoryBubble({ yayinci }: { yayinci: PerformerListItem }) {
  const isLive = yayinci.durum === 'online'
  return (
    <Link href={`/yayinci/${yayinci.id}`} className="flex flex-col items-center gap-1.5 shrink-0">
      <div className="relative">
        {/* Ring */}
        <div className={['rounded-full p-[2.5px]', isLive ? 'story-ring-live' : 'story-ring-online'].join(' ')}>
          <div className="rounded-full p-[2px]" style={{ background: '#050508' }}>
            {yayinci.avatarUrl ? (
              <img src={yayinci.avatarUrl} alt={yayinci.displayName}
                className="w-14 h-14 rounded-full object-cover object-top" />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1A0A15, #3D1020)' }}>
                <span className="text-[#C9A84C] font-bold text-xl"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                  {yayinci.displayName[0]}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Live dot */}
        {isLive && (
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
            style={{ background: '#8B1A2A', border: '1.5px solid #050508' }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1 h-1 rounded-full bg-[#FF4444]"
            />
            <span className="text-[7px] font-black text-white tracking-wider">CANLI</span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-[#A09080] truncate max-w-[64px] text-center leading-tight font-medium">
        {yayinci.displayName.split(' ')[0]}
      </span>
    </Link>
  )
}

/* Canlı hero kartı — geniş, öne çıkan */
function LiveHeroCard({ yayinci }: { yayinci: PerformerListItem }) {
  return (
    <Link href={`/yayinci/${yayinci.id}`} className="block group">
      <motion.div
        className="relative rounded-3xl overflow-hidden live-card-glow"
        style={{ height: 220 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      >
        {yayinci.avatarUrl ? (
          <img src={yayinci.avatarUrl} alt={yayinci.displayName}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]" />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2D0A15, #8B1A2A)' }} />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.85)] via-[rgba(0,0,0,0.3)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] via-transparent to-transparent" />

        <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
          {/* Üst: canlı badge + izleyici */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: 'rgba(120,0,20,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,68,68,0.3)' }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#FF4444]"
              />
              <span className="text-white text-[10px] font-black tracking-widest">CANLI</span>
            </div>
            {yayinci.aktifIzleyici > 0 && (
              <div className="flex items-center gap-1 glass-dark rounded-full px-2 py-0.5">
                <Users size={9} className="text-white/60" />
                <span className="text-[10px] text-white/80">{yayinci.aktifIzleyici} izleyici</span>
              </div>
            )}
          </div>

          {/* Alt: isim + CTA */}
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="text-white font-bold leading-none"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32 }}>
                {yayinci.displayName}
              </h3>
              {(yayinci.vipSeviye ?? 1) >= 2 && (
                <span className="text-[#C9A84C] text-[11px] font-bold">✦ VIP</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/50 capitalize">{yayinci.category}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
              <span className="text-[11px] text-white/50">{yayinci.city}</span>
              <div className="ml-auto flex items-center gap-1.5 rounded-full px-4 py-1.5 font-black text-[11px] tracking-[0.1em] text-white"
                style={{
                  background: 'linear-gradient(90deg, #5C0011 0%, #8B1A2A 35%, #C9A84C 50%, #8B1A2A 65%, #5C0011 100%)',
                  backgroundSize: '200% auto',
                  animation: 'ctaShimmer 2.5s linear infinite',
                }}>
                KATIL
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

function SectionHeader({ icon: Icon, title, count, color = '#C9A84C' }: {
  icon: React.ElementType; title: string; count?: number; color?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={12} style={{ color }} />
      </div>
      <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color }}>
        {title}
      </span>
      {count !== undefined && (
        <span className="text-[10px] font-semibold rounded-full px-2 py-0.5"
          style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
          {count}
        </span>
      )}
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
    </div>
  )
}

export default function KesfetSayfasi() {
  const [aramaGecici, setAramaGecici] = useState('')
  const [aramaAktif, setAramaAktif]   = useState('')
  const [kategori, setKategori]       = useState('')
  const [sadeceMüsait, setSadeceMüsait] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: veri, isLoading: yukleniyor } = useQuery({
    queryKey: ['kesfet', aramaAktif, kategori, sadeceMüsait],
    queryFn: async () => {
      const p = new URLSearchParams()
      if (aramaAktif)   p.set('ara', aramaAktif)
      if (kategori)     p.set('kategori', kategori)
      if (sadeceMüsait) p.set('durum', 'musait')
      const result = await api.performer.get<SonucVeri>(`/performers?${p}`)
        .catch(() => ({ yayincilar: MOCK_PERFORMERS, toplam: MOCK_PERFORMERS.length }))
      if (!result.yayincilar.length && !aramaAktif && !kategori) {
        const filtreli = sadeceMüsait
          ? MOCK_PERFORMERS.filter(m => m.durum === 'musait')
          : MOCK_PERFORMERS
        return { yayincilar: filtreli, toplam: filtreli.length }
      }
      return result
    },
    staleTime: 30_000,
  })

  const aramaGuncelle = useCallback((v: string) => {
    setAramaGecici(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setAramaAktif(v), 380)
  }, [])

  const liste = veri?.yayincilar ?? []
  const canlilar  = liste.filter(p => p.durum === 'online')
  const musaitler = liste.filter(p => p.durum !== 'online')
  const aramaAktifmi = !!(aramaAktif || kategori || sadeceMüsait)

  return (
    <div className="min-h-screen mesh-bg">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 px-4 pt-4 pb-3 sm:pt-5 sm:pb-4"
        style={{ background: 'rgba(5,5,8,0.88)', backdropFilter: 'blur(32px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-xl mx-auto flex flex-col gap-3">

          {/* Başlık */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-gradient-gold font-bold leading-none"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}>
                Keşfet
              </h1>
              {veri && (
                <motion.p
                  key={veri.toplam}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-[#5A5050] mt-0.5"
                >
                  {veri.toplam} yayıncı
                  {canlilar.length > 0 && (
                    <> · <span className="text-[#FF6666]">{canlilar.length} canlı</span></>
                  )}
                </motion.p>
              )}
            </div>
            {sadeceMüsait && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSadeceMüsait(false)}
                className="flex items-center gap-1.5 text-[11px] text-[#C9A84C] glass-gold rounded-full px-3 py-1"
              >
                <X size={10} /> Müsait filtresi
              </motion.button>
            )}
          </div>

          {/* Arama */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5050]" />
            <input
              type="text"
              value={aramaGecici}
              onChange={e => aramaGuncelle(e.target.value)}
              placeholder="Yayıncı, kategori ara..."
              className="input-glass w-full rounded-2xl pl-9 pr-9 py-2.5 text-[14px] text-[#F0EDE8]"
            />
            <AnimatePresence>
              {aramaGecici && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => { setAramaGecici(''); setAramaAktif('') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5050] hover:text-white transition-colors p-1"
                >
                  <X size={13} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Kategori pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {KATEGORILER.map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                onClick={() => setKategori(value)}
                whileTap={{ scale: 0.92 }}
                className={[
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all duration-150',
                  kategori === value
                    ? 'glass-gold text-[#C9A84C] shadow-[0_0_16px_rgba(201,168,76,0.18)]'
                    : 'glass-sm text-[#5A5050] hover:text-[#A09080]',
                ].join(' ')}
              >
                <Icon size={11} />{label}
              </motion.button>
            ))}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSadeceMüsait(p => !p)}
              className={[
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold shrink-0 transition-all',
                sadeceMüsait ? 'glass-gold text-[#4CAF50]' : 'glass-sm text-[#5A5050] hover:text-[#A09080]',
              ].join(' ')}
              style={sadeceMüsait ? { borderColor: 'rgba(76,175,80,0.3)' } : {}}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sadeceMüsait ? '#4CAF50' : '#5A5050' }} />
              Müsait
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── İçerik ── */}
      <div className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-7">

        {yukleniyor ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <DBSkeletonPerformer key={i} />)}
          </div>
        ) : liste.length === 0 ? (
          <DBEmpty
            icon={Search}
            baslik={aramaAktif ? `"${aramaAktif}" bulunamadı` : 'Yayıncı bulunamadı'}
            aciklama={aramaAktif ? 'Farklı bir arama deneyin' : 'Yakında yayıncılar burada görünecek'}
            aksiyon={aramaAktifmi ? {
              label: 'Filtreleri temizle',
              onClick: () => { setAramaGecici(''); setAramaAktif(''); setKategori(''); setSadeceMüsait(false) }
            } : undefined}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${aramaAktif}-${kategori}-${sadeceMüsait}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-7"
            >
              {/* Stories şeridi — sadece canlı varsa */}
              {!aramaAktifmi && canlilar.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                    {[...canlilar, ...musaitler.slice(0, 4)].map(y => (
                      <LiveStoryBubble key={y.id} yayinci={y} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Canlı hero — 1. canlı performcı için geniş kart */}
              {!aramaAktifmi && canlilar.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <SectionHeader icon={Radio} title="Şu An Canlı" count={canlilar.length} color="#FF5555" />
                  <LiveHeroCard yayinci={canlilar[0]} />
                  {canlilar.length > 1 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {canlilar.slice(1).map((y, i) => (
                        <motion.div key={y.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.04 }}>
                          <DBPerformerCard id={y.id} displayName={y.displayName} avatarUrl={y.avatarUrl}
                            durum={y.durum} kategori={y.category} sehir={y.city}
                            puan={y.puan} aktifIzleyici={y.aktifIzleyici} vipSeviye={y.vipSeviye} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Müsait grid */}
              {musaitler.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: canlilar.length > 0 ? 0.12 : 0.05 }}>
                  {!aramaAktifmi && (
                    <SectionHeader icon={Sparkles} title="Müsait" count={musaitler.length} color="#C9A84C" />
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(aramaAktifmi ? liste : musaitler).map((y, i) => (
                      <motion.div key={y.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, ease: 'easeOut' }}>
                        <DBPerformerCard id={y.id} displayName={y.displayName} avatarUrl={y.avatarUrl}
                          durum={y.durum} kategori={y.category} sehir={y.city}
                          puan={y.puan} aktifIzleyici={y.aktifIzleyici} vipSeviye={y.vipSeviye} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
