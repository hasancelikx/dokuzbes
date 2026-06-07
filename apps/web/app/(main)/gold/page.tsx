'use client'

import { DBButton } from '@/components/ui/DBButton'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { useAuth } from '@/hooks/useAuth'

interface Paket {
  isim: string
  miktar: number
  fiyat: string
  ekstra: string | null
  border: string
  populer?: boolean
}

interface Islem {
  id: number
  tip: 'yukle' | 'odeme' | 'hediye' | 'kazanc'
  aciklama: string
  miktar: string
  tarih: string
  renk: string
}

const PAKETLER: Paket[] = [
  { isim: 'BAŞLANGIÇ', miktar: 250,  fiyat: '₺659,99',   ekstra: null,  border: 'border-[rgba(201,168,76,0.2)]'  },
  { isim: 'PREMIUM',   miktar: 750,  fiyat: '₺6.159,99', ekstra: '+%20',border: 'border-[rgba(201,168,76,0.3)]'  },
  { isim: 'VIP',       miktar: 1750, fiyat: '₺6.329,99', ekstra: '+%40',border: 'border-[#C9A84C]', populer: true },
  { isim: 'ELİTE',     miktar: 4000, fiyat: '₺6.699,99', ekstra: '+%60',border: 'border-[rgba(201,168,76,0.3)]'  },
]

const SON_ISLEMLER: Islem[] = [
  { id: 1, tip: 'yukle',  aciklama: 'Gold Yükleme',          miktar: '+750', tarih: '16.05.2026', renk: 'text-[#4CAF50]' },
  { id: 2, tip: 'odeme',  aciklama: 'Yayın Ücreti (10 dk)',  miktar: '-50',  tarih: '15.05.2026', renk: 'text-[#F44336]' },
  { id: 3, tip: 'hediye', aciklama: 'Hediye Gönderme - Ece', miktar: '-500', tarih: '15.05.2026', renk: 'text-[#F44336]' },
  { id: 4, tip: 'kazanc', aciklama: 'Arkadaşını Davet Et',   miktar: '+180', tarih: '14.05.2026', renk: 'text-[#4CAF50]' },
]

const ISLEM_EMOJI: Record<Islem['tip'], string> = {
  yukle:  '🟢',
  odeme:  '🔴',
  hediye: '🔴',
  kazanc: '🟢',
}

export default function GoldPage() {
  const { kullanici, yukleniyor } = useAuth()

  if (yukleniyor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <DBLoadingSpinner size={44} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-[600px] mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ── GOLD BAKİYE KARTI ── */}
        <div
          className="rounded-[20px] border border-[rgba(201,168,76,0.2)] p-6 flex flex-col gap-5"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(139,26,42,0.15) 100%)',
          }}
        >
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-6xl leading-none">🪙</span>
            <p
              className="text-[#C9A84C] font-bold leading-none mt-2"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 56,
              }}
            >
              {kullanici?.gold ?? 0}
            </p>
            <p className="db-etiket text-[#A09080] tracking-widest uppercase">Gold</p>
          </div>

          <DBButton variant="primary" size="lg" className="w-full">
            GOLD YÜKLE
          </DBButton>
        </div>

        {/* ── GOLD PAKETLERİ ── */}
        <div className="flex flex-col gap-4">
          <p className="text-[#A09080] text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            GOLD PAKETLERİ
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PAKETLER.map((p) => (
              <div
                key={p.isim}
                className={[
                  'relative bg-[#111111] border rounded-[16px] p-4 flex flex-col gap-2',
                  p.border,
                  p.populer ? 'shadow-[0_0_20px_rgba(201,168,76,0.1)]' : '',
                ].join(' ')}
              >
                {/* POPÜLER badge */}
                {p.populer && (
                  <span className="absolute -top-2.5 right-3 bg-[#C9A84C] text-[#0A0A0A] text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">
                    POPÜLER
                  </span>
                )}

                {/* İsim */}
                <p className="db-etiket text-[#A09080] tracking-wider">{p.isim}</p>

                {/* Miktar */}
                <p className="text-[#C9A84C] font-bold" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26 }}>
                  🪙 {p.miktar.toLocaleString('tr-TR')}
                </p>
                <p className="db-kucuk text-[#A09080] -mt-1">Gold</p>

                {/* Ekstra badge */}
                {p.ekstra && (
                  <span className="self-start bg-[rgba(76,175,80,0.15)] border border-[rgba(76,175,80,0.3)] text-[#4CAF50] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {p.ekstra} bonus
                  </span>
                )}

                {/* Fiyat */}
                <p className="db-govde text-[#F0EDE8] font-semibold mt-1">{p.fiyat}</p>

                {/* Satın Al butonu */}
                <DBButton variant="secondary" size="sm" className="w-full mt-1">
                  Satın Al
                </DBButton>
              </div>
            ))}
          </div>
        </div>

        {/* ── SON İŞLEMLER ── */}
        <div className="flex flex-col gap-4">
          <p className="text-[#A09080] text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            SON İŞLEMLER
          </p>
          <div className="bg-[#111111] border border-[rgba(201,168,76,0.1)] rounded-[16px] overflow-hidden">
            {SON_ISLEMLER.map((i, idx) => (
              <div
                key={i.id}
                className={[
                  'flex items-center gap-3 px-4 py-3',
                  idx < SON_ISLEMLER.length - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : '',
                ].join(' ')}
              >
                <span className="text-lg leading-none shrink-0">{ISLEM_EMOJI[i.tip]}</span>
                <div className="flex-1 min-w-0">
                  <p className="db-govde-kck text-[#F0EDE8]">{i.aciklama}</p>
                  <p className="db-kucuk text-[#5A5050]">{i.tarih}</p>
                </div>
                <p className={['db-govde font-bold shrink-0', i.renk].join(' ')}>
                  {i.miktar}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
