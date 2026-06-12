'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, TrendingUp, TrendingDown, Plus, ChevronRight, Sparkles } from 'lucide-react'
import { DBButton } from '@/components/ui/DBButton'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/apiClient'
import { mapIslem, type GecmisDTO } from '@/lib/goldIslem'
import { toast } from 'sonner'

interface Paket {
  id: string
  isim: string
  miktar: number
  bonus: number
  fiyat: string
  populer?: boolean
}

const PAKETLER: Paket[] = [
  { id: 'starter', isim: 'BAŞLANGIÇ', miktar: 250,  bonus: 0,   fiyat: '₺659,99'    },
  { id: 'premium', isim: 'PREMIUM',   miktar: 750,  bonus: 20,  fiyat: '₺1.159,99'  },
  { id: 'vip',     isim: 'VIP',       miktar: 1750, bonus: 40,  fiyat: '₺2.329,99', populer: true },
  { id: 'elite',   isim: 'ELİTE',     miktar: 4000, bonus: 60,  fiyat: '₺4.699,99'  },
]

const ISLEM_IKON = {
  yukle:  { icon: Plus,         cls: 'bg-green-500/10 text-green-400'  },
  odeme:  { icon: Coins,        cls: 'bg-red-500/10 text-red-400'      },
  hediye: { icon: Sparkles,     cls: 'bg-[rgba(201,168,76,0.1)] text-[#C9A84C]' },
  kazanc: { icon: TrendingUp,   cls: 'bg-green-500/10 text-green-400'  },
}

function GoldSayac({ hedef }: { hedef: number }) {
  return (
    <motion.span
      key={hedef}
      initial={{ scale: 1.15, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="text-[#C9A84C] font-bold gold-shimmer tabular-nums"
      style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 64, lineHeight: 1 }}
    >
      {hedef.toLocaleString('tr-TR')}
    </motion.span>
  )
}

export default function GoldPage() {
  const { kullanici, yukleniyor: authYukleniyor } = useAuth()
  const router = useRouter()
  const paketlerRef = useRef<HTMLDivElement>(null)
  const [odemePaket, setOdemePaket] = useState<string | null>(null)

  const { data: islemler, isLoading: islemlerYukleniyor } = useQuery({
    queryKey: ['gold-islemler'],
    queryFn: async () => {
      const res = await api.gold.get<{ islemler: GecmisDTO[] }>('/gold/gecmis')
      return res.islemler.map(mapIslem)
    },
    staleTime: 60_000,
  })

  const { data: bakiye } = useQuery({
    queryKey: ['gold-bakiye'],
    queryFn: () => api.gold.get<{ gold: number }>('/gold/bakiye').catch(() => null),
    staleTime: 30_000,
  })

  const mevcutGold = bakiye?.gold ?? kullanici?.gold ?? 0

  async function satinAl(paketId: string) {
    setOdemePaket(paketId)
    try {
      const { odemeUrl } = await api.payment.post<{ odemeUrl: string }>('/odeme/basalt', { paketId })
      window.location.href = odemeUrl
    } catch {
      toast.error('Ödeme başlatılamadı. Lütfen tekrar deneyin.')
    } finally {
      setOdemePaket(null)
    }
  }

  if (authYukleniyor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <DBLoadingSpinner size={44} />
      </div>
    )
  }

  const listeIslemler = (islemler ?? []).slice(0, 6)

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-[600px] mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Gold Bakiye Kartı */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative rounded-[24px] overflow-hidden p-6 flex flex-col gap-5"
          style={{
            background: 'linear-gradient(145deg, rgba(22,18,8,0.98) 0%, rgba(18,12,4,0.99) 50%, rgba(14,8,12,0.99) 100%)',
            border: '1px solid rgba(201,168,76,0.28)',
            boxShadow: '0 0 48px rgba(201,168,76,0.08) inset, 0 8px 48px rgba(0,0,0,0.6)',
          }}
        >
          {/* Dekoratif orb'lar */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 65%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,26,42,0.08) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

          <div className="flex flex-col items-center gap-3 py-2 relative">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl leading-none"
            >
              🪙
            </motion.div>
            <GoldSayac hedef={mevcutGold} />
            <p className="db-etiket text-[#A09080] tracking-[0.2em]">GOLD BAKİYE</p>
          </div>

          <DBButton variant="primary" size="lg" className="w-full" icon={<Plus size={16} />}
            onClick={() => paketlerRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            Gold Yükle
          </DBButton>
        </motion.div>

        {/* Gold Paketleri */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <p className="db-etiket text-[#5A5050] tracking-[0.15em]">PAKETLER</p>
            <span className="text-[10px] text-[#3A3030]">Tüm paketler tek seferlik</span>
          </div>

          <div className="grid grid-cols-2 gap-3" ref={paketlerRef}>
            {PAKETLER.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.28 }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className={[
                  'relative bg-[#111111] rounded-[16px] p-4 flex flex-col gap-2 cursor-pointer',
                  p.populer
                    ? 'border border-[#C9A84C] shadow-[0_0_24px_rgba(201,168,76,0.12)]'
                    : 'border border-[rgba(201,168,76,0.15)] hover:border-[rgba(201,168,76,0.3)] transition-colors',
                ].join(' ')}
              >
                {p.populer && (
                  <span className="absolute -top-2.5 right-3 bg-[#C9A84C] text-[#0A0A0A] text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">
                    POPÜLER
                  </span>
                )}

                <p className="db-etiket text-[#5A5050] tracking-wider">{p.isim}</p>

                <div className="flex items-baseline gap-1">
                  <span className="text-[#C9A84C] font-bold tabular-nums"
                    style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}>
                    {p.miktar.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-[#5A5050] text-xs">🪙</span>
                </div>

                {p.bonus > 0 && (
                  <span className="self-start flex items-center gap-1 bg-[rgba(76,175,80,0.1)] border border-[rgba(76,175,80,0.25)] text-[#4CAF50] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <TrendingUp size={9} />+%{p.bonus} bonus
                  </span>
                )}

                <p className="text-[#F0EDE8] font-semibold text-sm mt-1">{p.fiyat}</p>

                <DBButton variant={p.populer ? 'primary' : 'secondary'} size="sm" className="w-full mt-auto"
                  onClick={() => satinAl(p.id)} yukleniyor={odemePaket === p.id}>
                  Satın Al
                </DBButton>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Son İşlemler */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <p className="db-etiket text-[#5A5050] tracking-[0.15em]">SON İŞLEMLER</p>
            <button onClick={() => router.push('/hesabim/gecmis')}
              className="flex items-center gap-1 text-[10px] text-[#C9A84C] hover:text-[#E0C070] transition-colors">
              Tümü <ChevronRight size={10} />
            </button>
          </div>

          <div className="bg-[#0f0f18] border border-[rgba(201,168,76,0.08)] rounded-[16px] overflow-hidden">
            {islemlerYukleniyor ? (
              <div className="flex justify-center py-8">
                <DBLoadingSpinner size={28} />
              </div>
            ) : listeIslemler.length === 0 ? (
              <p className="text-[13px] text-[#5A5050] text-center py-8">Henüz işlem yok</p>
            ) : (
              <AnimatePresence>
                {listeIslemler.map((islem, idx) => {
                  const { icon: Icon, cls } = ISLEM_IKON[islem.tip]
                  const pozitif = islem.miktar > 0
                  return (
                    <motion.div
                      key={islem.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className={[
                        'flex items-center gap-3 px-4 py-3.5',
                        idx < listeIslemler.length - 1 ? 'border-b border-white/4' : '',
                      ].join(' ')}
                    >
                      <div className={['w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0', cls].join(' ')}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#F0EDE8] font-medium truncate">{islem.aciklama}</p>
                        <p className="text-[11px] text-[#5A5050] mt-0.5">{islem.tarih}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {pozitif ? <TrendingUp size={11} className="text-green-400" /> : <TrendingDown size={11} className="text-red-400" />}
                        <span className={['font-bold text-sm tabular-nums', pozitif ? 'text-green-400' : 'text-red-400'].join(' ')}>
                          {pozitif ? '+' : ''}{islem.miktar.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
