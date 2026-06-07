'use client'

import { useState } from 'react'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { DBButton } from '@/components/ui/DBButton'
import { useAuth } from '@/hooks/useAuth'
import { useSalon } from '@/hooks/useSalon'

type BildirimTip = 'canli' | 'hediye' | 'takip' | 'sistem'

interface Bildirim {
  id: number
  tip: BildirimTip
  isim: string
  mesaj: string
  zaman: string
  buton: string
}

type Sekme = 'Tümü' | 'Mesajlar' | 'Takip' | 'Sistem'
const SEKMELER: Sekme[] = ['Tümü', 'Mesajlar', 'Takip', 'Sistem']

const BILDIRIMLER: Bildirim[] = [
  { id: 1, tip: 'canli',  isim: 'Ece Demir',  mesaj: 'yayına başladı',             zaman: 'Az önce',    buton: 'KATIL'       },
  { id: 2, tip: 'hediye', isim: 'Sara Aydın', mesaj: 'sana hediye gönderdi',        zaman: '5 dk önce',  buton: 'GÖR'         },
  { id: 3, tip: 'takip',  isim: 'Luna',       mesaj: 'seni takip etmeye başladı',   zaman: '10 dk önce', buton: 'PROFİLE GİT' },
  { id: 4, tip: 'sistem', isim: '9BEŞ',       mesaj: 'Gold kampanyası başladı!',    zaman: '1 saat önce',buton: 'İNCELE'      },
  { id: 5, tip: 'canli',  isim: 'Zeynep',     mesaj: 'yayına başladı',              zaman: '2 saat önce',buton: 'KATIL'       },
  { id: 6, tip: 'sistem', isim: '9BEŞ',       mesaj: 'VIP üyeliğin sona eriyor',    zaman: '3 saat önce',buton: 'YENLE'       },
]

const TIP_EMOJI: Record<BildirimTip, string> = {
  canli:  '🔴',
  hediye: '🎁',
  takip:  '👤',
  sistem: '🔔',
}

function tiptenSekme(tip: BildirimTip): Sekme {
  if (tip === 'takip') return 'Takip'
  if (tip === 'sistem') return 'Sistem'
  return 'Tümü'
}

export default function BildirimlerPage() {
  useAuth()
  const { yayincilar } = useSalon('tumu')
  const [aktifSekme, setAktifSekme] = useState<Sekme>('Tümü')
  const [okundu, setOkundu] = useState(false)

  // İsimden avatarURL haritası
  const gorselMap = Object.fromEntries(yayincilar.map(y => [y.displayName, y.avatarUrl]))

  const filtrelenmis = BILDIRIMLER.filter((b) => {
    if (aktifSekme === 'Tümü') return true
    if (aktifSekme === 'Mesajlar') return b.tip === 'hediye' || b.tip === 'canli'
    return tiptenSekme(b.tip) === aktifSekme
  })

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-[600px] mx-auto px-4 py-6 flex flex-col gap-5">

        {/* ── BAŞLIK ── */}
        <h1 className="db-baslik-3 text-[#F0EDE8]">Bildirimler</h1>

        {/* ── SEKME ÇUBUĞU ── */}
        <div className="flex border-b border-[rgba(201,168,76,0.1)]">
          {SEKMELER.map((s) => (
            <button
              key={s}
              onClick={() => setAktifSekme(s)}
              className={[
                'flex-1 pb-2.5 text-[13px] font-semibold tracking-wide transition-all duration-150 cursor-pointer',
                aktifSekme === s
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] -mb-px'
                  : 'text-[#5A5050] hover:text-[#A09080]',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ── BİLDİRİM LİSTESİ ── */}
        <div className="flex flex-col gap-2">
          {filtrelenmis.map((b) => (
            <div
              key={b.id}
              className={[
                'bg-[#111111] border rounded-[14px] p-4 flex items-center gap-3 transition-all',
                okundu
                  ? 'border-[rgba(201,168,76,0.06)] opacity-60'
                  : 'border-[rgba(201,168,76,0.12)]',
              ].join(' ')}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <DBAvatar src={gorselMap[b.isim] || null} initials={b.isim} size={48} />
                <span className="absolute -bottom-0.5 -right-0.5 text-[14px] leading-none">
                  {TIP_EMOJI[b.tip]}
                </span>
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0">
                <p className="db-govde-kck text-[#F0EDE8]">
                  <span className="font-bold">{b.isim}</span>{' '}
                  <span className="text-[#A09080]">{b.mesaj}</span>
                </p>
                <p className="db-kucuk text-[#5A5050] mt-0.5">{b.zaman}</p>
              </div>

              {/* Aksiyon Butonu */}
              <DBButton variant="secondary" size="sm" className="shrink-0 text-[11px] px-3">
                {b.buton}
              </DBButton>
            </div>
          ))}

          {filtrelenmis.length === 0 && (
            <p className="db-kucuk text-[#3A3030] text-center py-8">Bu kategoride bildirim yok.</p>
          )}
        </div>

        {/* ── TÜM BİLDİRİMLERİ OKUNDU İŞARETLE ── */}
        <DBButton
          variant="ghost"
          size="md"
          className="w-full mt-2"
          onClick={() => setOkundu(true)}
        >
          TÜM BİLDİRİMLERİ OKUNDU İŞARETLE
        </DBButton>

      </div>
    </div>
  )
}
