'use client'

import { useState, useEffect } from 'react'
import { Trophy, Crown, Star, Users, Gift, Zap } from 'lucide-react'
import { api } from '@/lib/apiClient'

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

const DONEMLER: { value: Donem; label: string }[] = [
  { value: 'haftalik',  label: 'Bu Hafta'   },
  { value: 'aylik',     label: 'Bu Ay'      },
  { value: 'tumzaman',  label: 'Tüm Zamanlar' },
]

const SIRALAMA_STIL = [
  { bg: 'bg-[rgba(201,168,76,0.12)]',  border: 'border-[rgba(201,168,76,0.35)]',   metin: 'text-[#C9A84C]',  emoji: '🏆', boy: 'h-28' },
  { bg: 'bg-[rgba(192,192,208,0.07)]', border: 'border-[rgba(192,192,208,0.22)]',  metin: 'text-[#C0C0D0]',  emoji: '🥈', boy: 'h-20' },
  { bg: 'bg-[rgba(180,120,60,0.07)]',  border: 'border-[rgba(180,120,60,0.22)]',   metin: 'text-[#CD7F32]',  emoji: '🥉', boy: 'h-16' },
]
function siraStil(sira: number) {
  return SIRALAMA_STIL[sira - 1] ?? {
    bg: 'bg-[#0f0f18]', border: 'border-white/6', metin: 'text-gray-600', emoji: '', boy: '',
  }
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
  const isFirst = sira === 1
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: 96 }}>
      <div className="relative">
        <Avatar src={avatarUrl} isim={isim} size={isFirst ? 58 : 46} />
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
    </div>
  )
}

function Iskelet() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-white/4 animate-pulse" />
      ))}
    </div>
  )
}

export default function SiralamaPage() {
  const [sekme, setSekme] = useState<Sekme>('musteri')
  const [donem, setDonem] = useState<Donem>('haftalik')
  const [musteriler, setMusteriler] = useState<MusteriSira[]>([])
  const [yayincilar, setYayincilar] = useState<YayinciSira[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    let canlı = true
    setYukleniyor(true)
    Promise.all([
      api.performer.get<{ siralama: YayinciSira[] }>(`/performers/siralama?donem=${donem}`),
      api.user.get<{ siralama: MusteriSira[] }>(`/users/siralama?donem=${donem}`),
    ]).then(([p, u]) => {
      if (!canlı) return
      setYayincilar(p.siralama)
      setMusteriler(u.siralama)
    }).catch(() => {}).finally(() => { if (canlı) setYukleniyor(false) })
    return () => { canlı = false }
  }, [donem])

  const aktifListe = sekme === 'musteri' ? musteriler : yayincilar
  const ilkUc = aktifListe.slice(0, 3)
  const kalanlar = aktifListe.slice(3)

  return (
    <div className="min-h-screen bg-[#080810]">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Başlık */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center">
            <Trophy size={18} className="text-[#C9A84C]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Sıralama</h1>
            <p className="text-gray-600 text-xs">En iyileri keşfet</p>
          </div>
        </div>

        {/* Dönem seçici */}
        <div className="flex gap-1.5 bg-[#0f0f18] border border-white/6 rounded-xl p-1">
          {DONEMLER.map(({ value, label }) => (
            <button key={value} onClick={() => setDonem(value)}
              className={[
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                donem === value
                  ? 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.25)]'
                  : 'text-gray-600 hover:text-gray-400',
              ].join(' ')}>
              {label}
            </button>
          ))}
        </div>

        {/* Sekme seçici */}
        <div className="flex bg-[#0f0f18] border border-white/6 rounded-xl p-1 gap-1">
          <button onClick={() => setSekme('musteri')}
            className={['flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all',
              sekme === 'musteri'
                ? 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.25)]'
                : 'text-gray-600 hover:text-gray-400'].join(' ')}>
            <Crown size={12} />En Cömert
          </button>
          <button onClick={() => setSekme('yayinci')}
            className={['flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all',
              sekme === 'yayinci'
                ? 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.25)]'
                : 'text-gray-600 hover:text-gray-400'].join(' ')}>
            <Star size={12} />En Popüler
          </button>
        </div>

        {yukleniyor ? <Iskelet /> : aktifListe.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Zap size={28} className="text-gray-700" />
            <p className="text-gray-600 text-sm">Bu dönem için henüz veri yok</p>
          </div>
        ) : (
          <>
            {/* Podyum — ilk 3 */}
            {ilkUc.length >= 3 && (
              <div className="flex items-end justify-center gap-3 pt-3 pb-1">
                {[ilkUc[1], ilkUc[0], ilkUc[2]].map((item, pos) => {
                  const gerçekSira = [2, 1, 3][pos]
                  if (!item) return null
                  const deger = sekme === 'musteri'
                    ? (item as MusteriSira).harcanan
                    : (item as YayinciSira).hediye
                  const birim = sekme === 'musteri' ? '🪙' : '🎁'
                  return <PodyumKart key={item.id} sira={gerçekSira} isim={item.isim}
                    avatarUrl={item.avatarUrl} deger={deger} birim={birim} />
                })}
              </div>
            )}

            {/* Tüm liste */}
            <div className="flex flex-col gap-2">
              {aktifListe.map(item => {
                const { bg, border } = siraStil(item.sira)
                const deger = sekme === 'musteri'
                  ? (item as MusteriSira).harcanan
                  : (item as YayinciSira).hediye
                const isMus = sekme === 'musteri'
                const mus = item as MusteriSira
                const yay = item as YayinciSira
                return (
                  <div key={item.id}
                    className={['flex items-center gap-3 p-3 rounded-2xl border transition-all', bg, border].join(' ')}>
                    <span className="w-5 text-center text-xs text-gray-600 font-medium shrink-0">{item.sira}</span>
                    <Avatar src={item.avatarUrl} isim={item.isim} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold leading-tight truncate">{item.isim}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.sehir && <span className="text-[11px] text-gray-600 truncate">{item.sehir}</span>}
                        {!isMus && yay.puan > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] text-[#C9A84C]">
                            <Star size={8} fill="currentColor" />{yay.puan.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#C9A84C] font-bold text-sm">
                        {deger.toLocaleString('tr-TR')} {isMus ? '🪙' : '🎁'}
                      </p>
                      {!isMus && yay.izleyici > 0 && (
                        <p className="flex items-center gap-1 justify-end text-[10px] text-gray-600 mt-0.5">
                          <Users size={8} />{yay.izleyici.toLocaleString('tr-TR')}
                        </p>
                      )}
                      {isMus && mus.vipLevel > 1 && (
                        <p className="text-[10px] text-[#C9A84C]/60 mt-0.5">VIP {mus.vipLevel}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Alt motivasyon */}
            <div className="bg-[#0f0f18] border border-[rgba(201,168,76,0.1)] rounded-2xl p-5 flex flex-col items-center gap-2 text-center">
              <Gift size={20} className="text-[#C9A84C]" />
              <p className="text-white font-semibold text-sm">Sıralamaya gir!</p>
              <p className="text-gray-600 text-xs max-w-xs">
                {sekme === 'musteri'
                  ? 'Gold harcayarak ilk 10\'a gir, özel VIP rozeti kazan.'
                  : 'Hediye alarak popülerliğini artır, yeni izleyiciler kazan.'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
