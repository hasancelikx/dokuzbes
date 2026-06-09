'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Radio, Gift, UserPlus, Megaphone, Smartphone, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface KanalTercih { push: boolean; email: boolean }
interface BildirimTercih {
  id: string
  ikon: React.ElementType
  renk: string
  bg: string
  baslik: string
  aciklama: string
}

const BILDIRIM_TIPLERI: BildirimTercih[] = [
  { id: 'canli',  ikon: Radio,     renk: '#FF4444', bg: 'rgba(255,68,68,0.1)',   baslik: 'Canlı Yayın',       aciklama: 'Takip ettiğin yayıncı yayına başladığında' },
  { id: 'hediye', ikon: Gift,      renk: '#C9A84C', bg: 'rgba(201,168,76,0.1)',  baslik: 'Hediyeler',          aciklama: 'Sana hediye gönderildiğinde'               },
  { id: 'takip',  ikon: UserPlus,  renk: '#4CAF50', bg: 'rgba(76,175,80,0.1)',   baslik: 'Yeni Takipçi',       aciklama: 'Biri seni takip etmeye başladığında'       },
  { id: 'sistem', ikon: Megaphone, renk: '#FF9800', bg: 'rgba(255,152,0,0.1)',   baslik: 'Sistem & Kampanya',  aciklama: 'Duyurular ve özel teklifler'               },
]

function Toggle({ aktif, onChange }: { aktif: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative shrink-0 transition-colors"
      style={{ width: 42, height: 22, borderRadius: 11, background: aktif ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}
    >
      <motion.span
        animate={{ x: aktif ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-[3px] rounded-full bg-white shadow"
        style={{ width: 16, height: 16 }}
      />
    </button>
  )
}

export default function BildirimAyarlariPage() {
  useAuth()
  const [tercihler, setTercihler] = useState<Record<string, KanalTercih>>({
    canli:  { push: true,  email: false },
    hediye: { push: true,  email: true  },
    takip:  { push: false, email: false },
    sistem: { push: true,  email: true  },
  })

  function toggle(id: string, kanal: keyof KanalTercih) {
    setTercihler(prev => ({ ...prev, [id]: { ...prev[id], [kanal]: !prev[id][kanal] } }))
    toast.success('Tercih güncellendi', { duration: 1200 })
  }

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
              style={{ fontFamily: '"Cormorant Garamond", serif' }}>Bildirimler</h1>
            <p className="text-xs text-[#5A5050]">Bildirim tercihlerini yönet</p>
          </div>
        </div>

        {/* Tercih Tablosu */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="vip-card overflow-hidden">

          {/* Sütun başlıkları */}
          <div className="flex items-center px-5 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="flex-1 text-[10px] font-bold tracking-[0.15em] text-[#3A3030] uppercase">Bildirim Türü</span>
            <div className="flex items-center gap-6 shrink-0">
              <div className="flex flex-col items-center gap-0.5 w-10">
                <Smartphone size={12} className="text-[#5A5050]" />
                <span className="text-[9px] text-[#3A3030]">Push</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 w-10">
                <Mail size={12} className="text-[#5A5050]" />
                <span className="text-[9px] text-[#3A3030]">E-Posta</span>
              </div>
            </div>
          </div>

          {BILDIRIM_TIPLERI.map((t, i) => {
            const Icon = t.ikon
            const tr = tercihler[t.id]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + i * 0.05 }}
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: i < BILDIRIM_TIPLERI.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: t.bg }}>
                  <Icon size={16} style={{ color: t.renk }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#F0EDE8] font-medium">{t.baslik}</p>
                  <p className="text-[11px] text-[#5A5050] leading-snug">{t.aciklama}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="w-10 flex justify-center">
                    <Toggle aktif={tr.push}  onChange={() => toggle(t.id, 'push')}  />
                  </div>
                  <div className="w-10 flex justify-center">
                    <Toggle aktif={tr.email} onChange={() => toggle(t.id, 'email')} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <p className="text-[11px] text-[#3A3030] text-center px-4">
          Push bildirimleri için tarayıcı izni gereklidir.
        </p>
      </div>
    </div>
  )
}
