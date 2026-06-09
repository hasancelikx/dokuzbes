'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Plus, Coins, Sparkles, TrendingUp, TrendingDown, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/apiClient'

type IslemTip = 'yukle' | 'odeme' | 'hediye' | 'kazanc'
type Filtre   = 'tumu' | IslemTip

interface Islem {
  id: number; tip: IslemTip; aciklama: string; miktar: number; tarih: string
}

const MOCK_ISLEMLER: Islem[] = [
  { id: 1,  tip: 'yukle',  aciklama: 'Gold Yükleme — VIP Paketi',        miktar:  1750,  tarih: '08.06.2026' },
  { id: 2,  tip: 'odeme',  aciklama: 'Masa Ücreti — Leyla ile',           miktar:  -120,  tarih: '07.06.2026' },
  { id: 3,  tip: 'hediye', aciklama: 'Elmas Yüzük → Ece Yıldız',          miktar:  -500,  tarih: '07.06.2026' },
  { id: 4,  tip: 'kazanc', aciklama: 'Arkadaşını Davet Et Bonusu',        miktar:   180,  tarih: '06.06.2026' },
  { id: 5,  tip: 'odeme',  aciklama: 'Masa Ücreti — Selin ile',           miktar:   -50,  tarih: '05.06.2026' },
  { id: 6,  tip: 'yukle',  aciklama: 'Gold Yükleme — Premium Paketi',     miktar:   750,  tarih: '02.06.2026' },
  { id: 7,  tip: 'hediye', aciklama: 'Gold Bilezik → Luna',                miktar:  -150,  tarih: '01.06.2026' },
  { id: 8,  tip: 'kazanc', aciklama: 'İlk Giriş Bonusu',                  miktar:    50,  tarih: '28.05.2026' },
  { id: 9,  tip: 'odeme',  aciklama: 'Masa Ücreti — Zeynep ile',          miktar:   -50,  tarih: '25.05.2026' },
  { id: 10, tip: 'yukle',  aciklama: 'Gold Yükleme — Başlangıç Paketi',   miktar:   250,  tarih: '20.05.2026' },
]

const FILTRELER: { id: Filtre; label: string }[] = [
  { id: 'tumu',   label: 'Tümü'    },
  { id: 'yukle',  label: 'Yükleme' },
  { id: 'odeme',  label: 'Ödeme'   },
  { id: 'hediye', label: 'Hediye'  },
  { id: 'kazanc', label: 'Kazanç'  },
]

const TIP_CFG: Record<IslemTip, { ikon: React.ElementType; cls: string; renkCls: string }> = {
  yukle:  { ikon: Plus,       cls: 'bg-green-500/10 text-green-400',                    renkCls: 'text-green-400'  },
  odeme:  { ikon: Coins,      cls: 'bg-red-500/10 text-red-400',                        renkCls: 'text-red-400'    },
  hediye: { ikon: Sparkles,   cls: 'bg-[rgba(201,168,76,0.1)] text-[#C9A84C]',          renkCls: 'text-[#C9A84C]'  },
  kazanc: { ikon: TrendingUp, cls: 'bg-green-500/10 text-green-400',                    renkCls: 'text-green-400'  },
}

export default function GecmisPage() {
  useAuth()
  const [filtre, setFiltre] = useState<Filtre>('tumu')
  const [arama, setArama]   = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['gold-gecmis'],
    queryFn: () => api.gold.get<{ islemler: Islem[] }>('/gold/islemler')
      .catch(() => ({ islemler: MOCK_ISLEMLER })),
    staleTime: 60_000,
  })

  const islemler = (data?.islemler ?? MOCK_ISLEMLER)
    .filter(i => filtre === 'tumu' || i.tip === filtre)
    .filter(i => !arama || i.aciklama.toLowerCase().includes(arama.toLowerCase()))

  const toplamGiren  = islemler.filter(i => i.miktar > 0).reduce((s, i) => s + i.miktar, 0)
  const toplamCikan  = islemler.filter(i => i.miktar < 0).reduce((s, i) => s + Math.abs(i.miktar), 0)

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-[600px] mx-auto px-4 pt-6 pb-10 flex flex-col gap-5">

        {/* Başlık */}
        <div className="flex items-center gap-3">
          <Link href="/hesabim"
            className="w-9 h-9 rounded-xl flex items-center justify-center glass hover:bg-white/5 transition-colors">
            <ArrowLeft size={16} className="text-[#A09080]" />
          </Link>
          <div>
            <h1 className="font-bold text-xl text-[#F0EDE8]"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}>İşlem Geçmişi</h1>
            <p className="text-xs text-[#5A5050]">Gold hareketleri</p>
          </div>
        </div>

        {/* Özet kartlar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3">
          <div className="vip-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-green-400" />
              <span className="text-[10px] font-bold tracking-wider text-[#5A5050] uppercase">Giren</span>
            </div>
            <p className="text-[#C9A84C] font-bold tabular-nums"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26 }}>
              +{toplamGiren.toLocaleString('tr-TR')}
            </p>
            <span className="text-[10px] text-[#5A5050]">🪙 gold</span>
          </div>
          <div className="vip-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={13} className="text-red-400" />
              <span className="text-[10px] font-bold tracking-wider text-[#5A5050] uppercase">Çıkan</span>
            </div>
            <p className="text-red-400 font-bold tabular-nums"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26 }}>
              -{toplamCikan.toLocaleString('tr-TR')}
            </p>
            <span className="text-[10px] text-[#5A5050]">🪙 gold</span>
          </div>
        </motion.div>

        {/* Arama + Filtre */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col gap-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5050]" />
            <input
              type="text" value={arama} onChange={e => setArama(e.target.value)}
              placeholder="İşlem ara..."
              className="w-full h-10 rounded-xl pl-9 pr-4 text-[13px] text-[#F0EDE8] transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', outline: 'none' }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTRELER.map(f => (
              <button
                key={f.id}
                onClick={() => setFiltre(f.id)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                style={{
                  background: filtre === f.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${filtre === f.id ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  color: filtre === f.id ? '#C9A84C' : '#5A5050',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-12"><DBLoadingSpinner size={32} /></div>
        ) : islemler.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Coins size={32} className="text-white/10" />
            <p className="text-[#5A5050] text-sm">İşlem bulunamadı</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="vip-card overflow-hidden"
          >
            <AnimatePresence mode="popLayout">
              {islemler.map((islem, idx) => {
                const { ikon: Icon, cls, renkCls } = TIP_CFG[islem.tip]
                const pozitif = islem.miktar > 0
                return (
                  <motion.div
                    key={islem.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderBottom: idx < islemler.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                  >
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${cls}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#F0EDE8] font-medium truncate">{islem.aciklama}</p>
                      <p className="text-[11px] text-[#5A5050] mt-0.5">{islem.tarih}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {pozitif ? <TrendingUp size={11} className="text-green-400" /> : <TrendingDown size={11} className="text-red-400" />}
                      <span className={`font-bold text-sm tabular-nums ${renkCls}`}>
                        {pozitif ? '+' : ''}{islem.miktar.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
