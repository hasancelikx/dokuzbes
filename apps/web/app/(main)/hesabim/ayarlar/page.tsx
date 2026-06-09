'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Moon, Volume2, VolumeX, Zap, Globe, Info } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

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

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="vip-card overflow-hidden">
      <p className="text-[10px] font-bold tracking-[0.15em] text-[#3A3030] uppercase px-5 pt-4 pb-2">{baslik}</p>
      {children}
    </motion.div>
  )
}

function SatirToggle({ icon: Icon, baslik, aciklama, renk = '#5A5050', value, onChange }: {
  icon: React.ElementType; baslik: string; aciklama: string; renk?: string; value: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4"
      style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
      <Icon size={15} style={{ color: renk }} className="shrink-0" />
      <div className="flex-1">
        <p className="text-[13px] text-[#F0EDE8] font-medium">{baslik}</p>
        <p className="text-[11px] text-[#5A5050]">{aciklama}</p>
      </div>
      <Toggle aktif={value} onChange={onChange} />
    </div>
  )
}

export default function AyarlarPage() {
  useAuth()
  const [ses, setSes]           = useState(true)
  const [titresim, setTitresim] = useState(true)
  const [animasyon, setAnimasyon] = useState(true)

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
              style={{ fontFamily: '"Cormorant Garamond", serif' }}>Uygulama Ayarları</h1>
            <p className="text-xs text-[#5A5050]">Tema, ses ve görünüm</p>
          </div>
        </div>

        {/* Tema */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="vip-card p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#3A3030] uppercase mb-3">TEMA</p>
          <div className="flex gap-3">
            {/* Karanlık — aktif */}
            <div className="flex-1 flex flex-col items-center gap-2.5 py-4 rounded-2xl cursor-default"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.28)' }}>
              <Moon size={22} className="text-[#C9A84C]" />
              <span className="text-[12px] font-semibold text-[#C9A84C]">Karanlık</span>
              <span className="text-[9px] font-bold tracking-widest text-[#C9A84C]/60">AKTİF</span>
            </div>
            {/* Aydınlık — yakında */}
            <div className="flex-1 flex flex-col items-center gap-2.5 py-4 rounded-2xl cursor-not-allowed opacity-25"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-[22px] h-[22px] rounded-full"
                style={{ background: 'linear-gradient(135deg, #F0EDE8 0%, #B0A070 100%)' }} />
              <span className="text-[12px] font-semibold text-[#5A5050]">Aydınlık</span>
              <span className="text-[9px] font-bold tracking-widest text-[#3A3030]">YAKINDA</span>
            </div>
          </div>
        </motion.div>

        {/* Ses & Efektler */}
        <Bolum baslik="SES & EFEKTLER">
          <SatirToggle
            icon={ses ? Volume2 : VolumeX}
            baslik="Ses Efektleri"
            aciklama="Hediye, bildirim ve aksiyon sesleri"
            renk={ses ? '#C9A84C' : '#5A5050'}
            value={ses}
            onChange={() => setSes(p => !p)}
          />
          <SatirToggle
            icon={Zap}
            baslik="Titreşim"
            aciklama="Bildirimler için titreşim geri bildirimi"
            value={titresim}
            onChange={() => setTitresim(p => !p)}
          />
          <SatirToggle
            icon={Info}
            baslik="Animasyonlar"
            aciklama="Konfeti ve geçiş animasyonları"
            value={animasyon}
            onChange={() => setAnimasyon(p => !p)}
          />
        </Bolum>

        {/* Dil */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="vip-card p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#3A3030] uppercase mb-3">DİL</p>
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)' }}>
            <Globe size={16} className="text-[#C9A84C] shrink-0" />
            <span className="text-[13px] text-[#F0EDE8] font-medium flex-1">Türkçe</span>
            <span className="text-[10px] font-bold text-[#C9A84C] bg-[rgba(201,168,76,0.1)] px-2 py-0.5 rounded-full">AKTİF</span>
          </div>
          <p className="text-[11px] text-[#3A3030] mt-2">Dil desteği yakında genişleyecek.</p>
        </motion.div>

        {/* Sürüm */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="vip-card p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#3A3030] uppercase mb-3">UYGULAMA</p>
          {[
            { label: 'Sürüm',  value: '1.0.0-beta' },
            { label: 'Ortam',  value: 'Development' },
            { label: 'Build',  value: new Date().toLocaleDateString('tr-TR') },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-1.5">
              <span className="text-[12px] text-[#5A5050]">{r.label}</span>
              <span className="text-[12px] text-[#A09080] font-mono">{r.value}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
