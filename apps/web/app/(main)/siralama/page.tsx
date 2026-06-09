'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Crown, Star, Users, Gift, Zap } from 'lucide-react'
import { api } from '@/lib/apiClient'
import { PA, CA } from '@/lib/mockAvatars'

type Donem = 'haftalik' | 'aylik' | 'tumzaman'
type Sekme = 'musteri' | 'yayinci'

interface MusteriSira {
  sira: number; id: string; isim: string; avatarUrl: string | null
  harcanan: number; vipLevel: number; sehir: string | null
}
interface YayinciSira {
  sira: number; id: string; isim: string; avatarUrl: string | null
  hediye: number; izleyici: number; puan: number; sehir: string | null; vipSeviye: number
}
interface SiraData { musteriler: MusteriSira[]; yayincilar: YayinciSira[] }

const MOCK_SIRA_DATA: SiraData = {
  musteriler: [
    { sira: 1, id: 'u1', isim: 'Mert Koçak',     avatarUrl: CA['Mert Koçak'],     harcanan: 4820, vipLevel: 3, sehir: 'İstanbul' },
    { sira: 2, id: 'u2', isim: 'Ahmet Yıldız',   avatarUrl: CA['Ahmet Yıldız'],   harcanan: 3150, vipLevel: 2, sehir: 'Ankara'   },
    { sira: 3, id: 'u3', isim: 'Can Berberoğlu', avatarUrl: CA['Can Berberoğlu'], harcanan: 2490, vipLevel: 2, sehir: 'İzmir'    },
    { sira: 4, id: 'u4', isim: 'Emre Tuna',      avatarUrl: CA['Emre Tuna'],      harcanan: 1870, vipLevel: 1, sehir: 'Bursa'    },
    { sira: 5, id: 'u5', isim: 'Burak Arslan',   avatarUrl: CA['Burak Arslan'],   harcanan: 1420, vipLevel: 1, sehir: 'İstanbul' },
    { sira: 6, id: 'u6', isim: 'Selim Doğan',    avatarUrl: CA['Selim Doğan'],    harcanan:  980, vipLevel: 1, sehir: 'Antalya'  },
    { sira: 7, id: 'u7', isim: 'Okan Mehmet',    avatarUrl: CA['Okan Mehmet'],    harcanan:  720, vipLevel: 1, sehir: 'İzmir'    },
    { sira: 8, id: 'u8', isim: 'Cem Yılmaz',     avatarUrl: CA['Cem Yılmaz'],     harcanan:  540, vipLevel: 1, sehir: 'Ankara'   },
  ],
  yayincilar: [
    { sira: 1, id: 'p1', isim: 'Leyla',      avatarUrl: PA['Leyla'],      hediye: 1240, izleyici: 234, puan: 4.9, sehir: 'İstanbul', vipSeviye: 3 },
    { sira: 2, id: 'p2', isim: 'Ece Yıldız', avatarUrl: PA['Ece Yıldız'], hediye:  890, izleyici: 178, puan: 4.8, sehir: 'Ankara',   vipSeviye: 2 },
    { sira: 3, id: 'p3', isim: 'Selin',      avatarUrl: PA['Selin'],      hediye:  650, izleyici: 145, puan: 4.7, sehir: 'İzmir',    vipSeviye: 2 },
    { sira: 4, id: 'p4', isim: 'Zeynep',     avatarUrl: PA['Zeynep'],     hediye:  420, izleyici:  98, puan: 4.6, sehir: 'Bursa',    vipSeviye: 1 },
    { sira: 5, id: 'p5', isim: 'Luna',       avatarUrl: PA['Luna'],       hediye:  310, izleyici:  67, puan: 5.0, sehir: 'İstanbul', vipSeviye: 3 },
    { sira: 6, id: 'p6', isim: 'Ayşe G.',    avatarUrl: PA['Ayşe G.'],   hediye:  240, izleyici:  54, puan: 4.5, sehir: 'İstanbul', vipSeviye: 1 },
    { sira: 7, id: 'p7', isim: 'Mia',        avatarUrl: PA['Mia'],        hediye:  180, izleyici:  43, puan: 4.7, sehir: 'Ankara',   vipSeviye: 1 },
    { sira: 8, id: 'p8', isim: 'Karla',      avatarUrl: PA['Karla'],      hediye:  120, izleyici:  31, puan: 4.4, sehir: 'İzmir',    vipSeviye: 1 },
  ],
}

const DONEMLER: { value: Donem; label: string }[] = [
  { value: 'haftalik',  label: 'Bu Hafta'      },
  { value: 'aylik',     label: 'Bu Ay'         },
  { value: 'tumzaman',  label: 'Tüm Zamanlar'  },
]

const SIRALAMA_STIL = [
  { bg: 'bg-[rgba(201,168,76,0.1)]',   border: 'border-[rgba(201,168,76,0.35)]',  metin: 'text-[#C9A84C]',  emoji: '🏆', boy: 'h-28' },
  { bg: 'bg-[rgba(192,192,208,0.06)]', border: 'border-[rgba(192,192,208,0.2)]',  metin: 'text-[#C0C0D0]',  emoji: '🥈', boy: 'h-20' },
  { bg: 'bg-[rgba(180,120,60,0.06)]',  border: 'border-[rgba(180,120,60,0.2)]',   metin: 'text-[#CD7F32]',  emoji: '🥉', boy: 'h-16' },
]
function siraStil(sira: number) {
  return SIRALAMA_STIL[sira - 1] ?? { bg: 'bg-[#0f0f18]', border: 'border-white/6', metin: 'text-gray-600', emoji: '', boy: '' }
}

function Avatar({ src, isim, size }: { src: string | null; isim: string; size: number }) {
  return src ? (
    <img src={src} alt={isim}
      className="rounded-full object-cover border border-white/10 shrink-0"
      style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full flex items-center justify-center bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] text-[#C9A84C] font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {isim.slice(0, 1).toUpperCase()}
    </div>
  )
}

function PodyumKart({ isim, avatarUrl, deger, sira, birim }: {
  isim: string; avatarUrl: string | null; deger: number; sira: number; birim: string
}) {
  const stil = siraStil(sira)
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      style={{ width: 96 }}
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: sira === 1 ? 0 : sira === 2 ? 0.1 : 0.18 }}
    >
      <div className="relative">
        <Avatar src={avatarUrl} isim={isim} size={sira === 1 ? 58 : 46} />
        <span className="absolute -bottom-1 -right-1 text-base leading-none">{stil.emoji}</span>
      </div>
      <p className="text-white text-xs font-semibold truncate w-full text-center leading-tight">
        {isim.split(' ')[0]}
      </p>
      <div className={['flex flex-col items-center justify-end w-full rounded-t-xl border', stil.bg, stil.border, stil.boy].join(' ')}>
        <span className={['text-[11px] font-bold mb-2 px-1 text-center', stil.metin].join(' ')}>
          {deger.toLocaleString('tr-TR')} {birim}
        </span>
      </div>
    </motion.div>
  )
}

function Iskelet() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-white/4 animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  )
}

const listItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.28, delay: i * 0.04, ease: 'easeOut' as const },
  }),
}

export default function SiralamaPage() {
  const [sekme, setSekme] = useState<Sekme>('musteri')
  const [donem, setDonem] = useState<Donem>('haftalik')

  const { data, isLoading } = useQuery<SiraData>({
    queryKey: ['siralama', donem],
    queryFn: async () => {
      try {
        const [p, u] = await Promise.all([
          api.performer.get<{ siralama: YayinciSira[] }>(`/performers/siralama?donem=${donem}`),
          api.user.get<{ siralama: MusteriSira[] }>(`/users/siralama?donem=${donem}`),
        ])
        const yayincilar = p.siralama ?? []
        const musteriler = u.siralama ?? []
        if (!yayincilar.length && !musteriler.length) return MOCK_SIRA_DATA
        return { yayincilar, musteriler }
      } catch (_e) {
        return MOCK_SIRA_DATA
      }
    },
    staleTime: 60_000,
  })

  const aktifListe = sekme === 'musteri' ? (data?.musteriler ?? []) : (data?.yayincilar ?? [])
  const ilkUc = aktifListe.slice(0, 3)

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Başlık */}
        <motion.div
          className="flex items-center gap-3.5 pb-1"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 100%)',
              border: '1px solid rgba(201,168,76,0.28)',
              boxShadow: '0 0 20px rgba(201,168,76,0.1) inset',
            }}>
            <Trophy size={18} className="text-[#C9A84C]" style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.6))' }} />
          </div>
          <div>
            <h1 className="section-title">Sıralama</h1>
            <p className="text-[#5A5050] text-[11px] mt-0.5">Bu haftanın şampiyonları</p>
          </div>
        </motion.div>

        {/* Dönem seçici */}
        <div className="flex gap-1.5 rounded-xl p-1" style={{ background: 'rgba(12,12,20,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {DONEMLER.map(({ value, label }) => (
            <button key={value} onClick={() => setDonem(value)}
              className={[
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all relative',
                donem === value ? 'text-[#C9A84C]' : 'text-gray-600 hover:text-gray-400',
              ].join(' ')}>
              {donem === value && (
                <motion.span
                  layoutId="donem-pill"
                  className="absolute inset-0 rounded-lg bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        {/* Sekme seçici */}
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(12,12,20,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {([['musteri', Crown, 'En Cömert'], ['yayinci', Star, 'En Popüler']] as const).map(([val, Icon, label]) => (
            <button key={val} onClick={() => setSekme(val)}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all relative',
                sekme === val ? 'text-[#C9A84C]' : 'text-gray-600 hover:text-gray-400',
              ].join(' ')}>
              {sekme === val && (
                <motion.span
                  layoutId="sekme-pill"
                  className="absolute inset-0 rounded-lg bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2"><Icon size={12} />{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="iskelet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Iskelet />
            </motion.div>
          ) : aktifListe.length === 0 ? (
            <motion.div
              key="bos"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-16 gap-3"
            >
              <Zap size={28} className="text-gray-700" />
              <p className="text-gray-600 text-sm">Bu dönem için henüz veri yok</p>
            </motion.div>
          ) : (
            <motion.div key={`${sekme}-${donem}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Podyum */}
              {ilkUc.length >= 3 && (
                <div className="flex items-end justify-center gap-3 pt-3 pb-1">
                  {[ilkUc[1], ilkUc[0], ilkUc[2]].map((item, pos) => {
                    if (!item) return null
                    const gerçekSira = [2, 1, 3][pos]
                    const deger = sekme === 'musteri' ? (item as MusteriSira).harcanan : (item as YayinciSira).hediye
                    const kart = (
                      <PodyumKart key={item.id} sira={gerçekSira} isim={item.isim}
                        avatarUrl={item.avatarUrl} deger={deger} birim={sekme === 'musteri' ? '🪙' : '🎁'} />
                    )
                    return sekme === 'yayinci'
                      ? <Link key={item.id} href={`/yayinci/${item.id}`}>{kart}</Link>
                      : kart
                  })}
                </div>
              )}

              {/* Liste */}
              <div className="flex flex-col gap-2">
                {aktifListe.map((item, i) => {
                  const { bg, border } = siraStil(item.sira)
                  const deger = sekme === 'musteri' ? (item as MusteriSira).harcanan : (item as YayinciSira).hediye
                  const mus = item as MusteriSira
                  const yay = item as YayinciSira
                  return (
                    <motion.div key={item.id} custom={i} variants={listItemVariants} initial="hidden" animate="visible"
                      className={['flex items-center gap-3 p-3 rounded-2xl border', bg, border].join(' ')}>
                      <span className="w-5 text-center text-xs text-gray-600 font-medium shrink-0">{item.sira}</span>
                      {sekme === 'yayinci'
                        ? <Link href={`/yayinci/${item.id}`} className="shrink-0"><Avatar src={item.avatarUrl} isim={item.isim} size={40} /></Link>
                        : <Avatar src={item.avatarUrl} isim={item.isim} size={40} />
                      }
                      <div className="flex-1 min-w-0">
                        {sekme === 'yayinci'
                          ? <Link href={`/yayinci/${item.id}`} className="block"><p className="text-white text-sm font-semibold leading-tight truncate hover:text-[#C9A84C] transition-colors">{item.isim}</p></Link>
                          : <p className="text-white text-sm font-semibold leading-tight truncate">{item.isim}</p>
                        }
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.sehir && <span className="text-[11px] text-gray-600 truncate">{item.sehir}</span>}
                          {sekme === 'yayinci' && yay.puan > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] text-[#C9A84C]">
                              <Star size={8} fill="currentColor" />{yay.puan.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[#C9A84C] font-bold text-sm">
                          {deger.toLocaleString('tr-TR')} {sekme === 'musteri' ? '🪙' : '🎁'}
                        </p>
                        {sekme === 'yayinci' && yay.izleyici > 0 && (
                          <p className="flex items-center gap-1 justify-end text-[10px] text-gray-600 mt-0.5">
                            <Users size={8} />{yay.izleyici.toLocaleString('tr-TR')}
                          </p>
                        )}
                        {sekme === 'musteri' && mus.vipLevel > 1 && (
                          <p className="text-[10px] text-[#C9A84C]/60 mt-0.5">VIP {mus.vipLevel}</p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Motivasyon */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#0f0f18] border border-[rgba(201,168,76,0.1)] rounded-2xl p-5 flex flex-col items-center gap-2 text-center"
              >
                <Gift size={20} className="text-[#C9A84C]" />
                <p className="text-white font-semibold text-sm">Sıralamaya gir!</p>
                <p className="text-gray-600 text-xs max-w-xs">
                  {sekme === 'musteri'
                    ? "Gold harcayarak ilk 10'a gir, özel VIP rozeti kazan."
                    : 'Hediye alarak popülerliğini artır, yeni izleyiciler kazan.'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
