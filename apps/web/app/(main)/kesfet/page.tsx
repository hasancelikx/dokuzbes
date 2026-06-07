'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, Flame, MessageCircle, Music, Sparkles, Shuffle, X, SlidersHorizontal,
} from 'lucide-react'
import { api } from '@/lib/apiClient'
import { DBPerformerCard } from '@/components/ui/DBPerformerCard'
import { DBSkeletonPerformer } from '@/components/ui/DBSkeleton'
import { DBEmpty } from '@/components/ui/DBEmpty'

interface PerformerListItem {
  id: string; displayName: string; avatarUrl?: string | null
  durum: string; category?: string | null; city?: string | null
  puan: number; aktifIzleyici: number; vipSeviye?: number
}
interface SonucVeri { yayincilar: PerformerListItem[]; toplam: number }

const KATEGORILER = [
  { value: '',       label: 'Tümü',   icon: Flame         },
  { value: 'sohbet', label: 'Sohbet', icon: MessageCircle },
  { value: 'muzik',  label: 'Müzik',  icon: Music         },
  { value: 'dans',   label: 'Dans',   icon: Sparkles      },
  { value: 'diger',  label: 'Diğer',  icon: Shuffle       },
]

export default function KesfetSayfasi() {
  const [aramaGecici, setAramaGecici] = useState('')
  const [aramaAktif, setAramaAktif] = useState('')
  const [kategori, setKategori] = useState('')
  const [sadeceMüsait, setSadeceMüsait] = useState(false)
  const [filtrePaneli, setFiltrePaneli] = useState(false)
  const [veri, setVeri] = useState<SonucVeri | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    try {
      const p = new URLSearchParams()
      if (aramaAktif) p.set('ara', aramaAktif)
      if (kategori) p.set('kategori', kategori)
      if (sadeceMüsait) p.set('durum', 'musait')
      const d = await api.performer.get<SonucVeri>(`/performers?${p}`)
      setVeri(d)
    } catch { setVeri({ yayincilar: [], toplam: 0 }) }
    finally { setYukleniyor(false) }
  }, [aramaAktif, kategori, sadeceMüsait])

  useEffect(() => { yukle() }, [yukle])

  function aramaGuncelle(v: string) {
    setAramaGecici(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setAramaAktif(v), 400)
  }

  return (
    <div className="min-h-screen bg-[#080810]">

      {/* Sticky başlık + arama */}
      <div className="sticky top-0 z-30 bg-[#080810]/92 backdrop-blur border-b border-white/6 px-4 pt-4 pb-3">
        <div className="max-w-xl mx-auto space-y-2.5">

          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={aramaGecici}
              onChange={e => aramaGuncelle(e.target.value)}
              placeholder="Yayıncı ara..."
              className="w-full bg-[#12121e] border border-white/8 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[rgba(201,168,76,0.35)] transition-colors"
            />
            {aramaGecici && (
              <button onClick={() => { setAramaGecici(''); setAramaAktif('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-0.5">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar">
              {KATEGORILER.map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setKategori(value)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all',
                    kategori === value
                      ? 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)]'
                      : 'text-gray-500 hover:text-gray-300 border border-transparent hover:bg-white/5',
                  ].join(' ')}>
                  <Icon size={11} />{label}
                </button>
              ))}
            </div>
            <button onClick={() => setFiltrePaneli(p => !p)}
              className={[
                'p-2 rounded-lg border transition-colors shrink-0',
                sadeceMüsait ? 'border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.1)] text-[#C9A84C]'
                  : 'border-white/8 text-gray-500 hover:text-white hover:bg-white/5',
              ].join(' ')}>
              <SlidersHorizontal size={14} />
            </button>
          </div>

          {filtrePaneli && (
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <div onClick={() => setSadeceMüsait(p => !p)}
                className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${sadeceMüsait ? 'bg-[#C9A84C]' : 'bg-white/15'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${sadeceMüsait ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs text-gray-400 select-none">Sadece müsait göster</span>
            </label>
          )}
        </div>
      </div>

      {/* Sonuçlar */}
      <div className="max-w-xl mx-auto px-4 py-5">
        {!yukleniyor && veri && (
          <p className="text-xs text-gray-600 mb-4">
            {aramaAktif ? `"${aramaAktif}" · ` : kategori ? `${KATEGORILER.find(k=>k.value===kategori)?.label} · ` : ''}
            {veri.toplam} yayıncı
          </p>
        )}

        {yukleniyor ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_,i) => <DBSkeletonPerformer key={i} />)}
          </div>
        ) : !veri || veri.yayincilar.length === 0 ? (
          <DBEmpty
            icon={Search}
            baslik={aramaAktif ? `"${aramaAktif}" bulunamadı` : 'Şu an çevrimiçi yayıncı yok'}
            aciklama={aramaAktif ? 'Farklı bir arama deneyin' : 'Yakında yayıncılar burada görünecek'}
            aksiyon={(aramaAktif || kategori || sadeceMüsait) ? {
              label: 'Filtreleri temizle',
              onClick: () => { setAramaGecici(''); setAramaAktif(''); setKategori(''); setSadeceMüsait(false) }
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {veri.yayincilar.map(y => (
              <DBPerformerCard
                key={y.id}
                id={y.id}
                displayName={y.displayName}
                avatarUrl={y.avatarUrl}
                durum={y.durum}
                kategori={y.category}
                sehir={y.city}
                puan={y.puan}
                aktifIzleyici={y.aktifIzleyici}
                vipSeviye={y.vipSeviye}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
