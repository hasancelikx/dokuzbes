'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Key, Eye, EyeOff, Monitor, Smartphone, LogOut } from 'lucide-react'
import { DBButton } from '@/components/ui/DBButton'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/apiClient'
import { toast } from 'sonner'

const MOCK_OTURUMLAR = [
  { id: '1', cihaz: 'MacBook Pro',   tarayici: 'Chrome 125',  konum: 'İstanbul, TR', zaman: 'Şu an',       aktif: true  },
  { id: '2', cihaz: 'iPhone 15 Pro', tarayici: 'Safari 17',   konum: 'İstanbul, TR', zaman: '2 gün önce',  aktif: false },
]

function SifreInput({ placeholder, value, onChange }: {
  placeholder: string; value: string; onChange: (v: string) => void
}) {
  const [goster, setGoster] = useState(false)
  return (
    <div className="relative">
      <input
        type={goster ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 rounded-xl px-4 pr-10 text-[14px] text-[#F0EDE8] transition-all"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
      />
      <button
        type="button"
        onClick={() => setGoster(g => !g)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5050] hover:text-[#A09080] transition-colors"
      >
        {goster ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

export default function GuvenlikPage() {
  useAuth()
  const [mevcut, setMevcut]   = useState('')
  const [yeni, setYeni]       = useState('')
  const [tekrar, setTekrar]   = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  const guclu = yeni.length >= 8 && /[A-Z]/.test(yeni) && /[0-9]/.test(yeni)

  async function handleSifreDegistir() {
    if (yeni !== tekrar) { toast.error('Şifreler eşleşmiyor.'); return }
    if (yeni.length < 8)  { toast.error('En az 8 karakter giriniz.'); return }
    setYukleniyor(true)
    try {
      await api.auth.post('/auth/sifre-degistir', { mevcutSifre: mevcut, yeniSifre: yeni })
      toast.success('Şifre başarıyla güncellendi.')
      setMevcut(''); setYeni(''); setTekrar('')
    } catch (e: unknown) {
      const code = (e as { code?: string }).code
      toast.error(code === 'YANLIS_SIFRE' ? 'Mevcut şifre hatalı.' : 'İşlem başarısız.')
    } finally {
      setYukleniyor(false)
    }
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
              style={{ fontFamily: '"Cormorant Garamond", serif' }}>Güvenlik</h1>
            <p className="text-xs text-[#5A5050]">Şifre ve oturum yönetimi</p>
          </div>
        </div>

        {/* Şifre Değiştir */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="vip-card p-5 flex flex-col gap-4">

          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <Key size={16} className="text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F0EDE8]">Şifre Değiştir</p>
              <p className="text-[11px] text-[#5A5050]">En az 8 karakter, 1 büyük harf, 1 rakam</p>
            </div>
          </div>

          <SifreInput placeholder="Mevcut şifre"        value={mevcut}  onChange={setMevcut}  />
          <SifreInput placeholder="Yeni şifre"          value={yeni}    onChange={setYeni}    />
          <SifreInput placeholder="Yeni şifre (tekrar)" value={tekrar}  onChange={setTekrar}  />

          {/* Güç göstergesi */}
          {yeni.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[4, 6, 8].map((esik, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{ background: yeni.length >= esik ? (guclu ? '#4CAF50' : '#C9A84C') : 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
              <span className="text-[10px] shrink-0"
                style={{ color: guclu ? '#4CAF50' : yeni.length >= 6 ? '#C9A84C' : '#5A5050' }}>
                {guclu ? 'Güçlü' : yeni.length >= 6 ? 'Orta' : 'Zayıf'}
              </span>
            </div>
          )}

          <DBButton
            variant="primary" size="md"
            onClick={handleSifreDegistir}
            yukleniyor={yukleniyor}
            disabled={!mevcut || !yeni || !tekrar}
          >
            Şifreyi Güncelle
          </DBButton>
        </motion.div>

        {/* Aktif Oturumlar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="vip-card p-5 flex flex-col gap-3">

          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(139,26,42,0.1)', border: '1px solid rgba(139,26,42,0.2)' }}>
              <Monitor size={16} className="text-[#E05070]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F0EDE8]">Aktif Oturumlar</p>
              <p className="text-[11px] text-[#5A5050]">{MOCK_OTURUMLAR.length} cihazda giriş yapılmış</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {MOCK_OTURUMLAR.map(o => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {o.cihaz.toLowerCase().includes('iphone') || o.cihaz.toLowerCase().includes('android')
                    ? <Smartphone size={15} className="text-[#5A5050]" />
                    : <Monitor size={15} className="text-[#5A5050]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#F0EDE8] font-medium truncate">{o.cihaz}</p>
                  <p className="text-[11px] text-[#5A5050] truncate">{o.tarayici} · {o.konum}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  {o.aktif ? (
                    <span className="text-[10px] font-bold text-[#4CAF50]"
                      style={{ background: 'rgba(76,175,80,0.1)', padding: '2px 8px', borderRadius: 999 }}>
                      Aktif
                    </span>
                  ) : (
                    <button className="text-[10px] text-[#5A5050] hover:text-red-400 transition-colors">Sonlandır</button>
                  )}
                  <span className="text-[10px] text-[#3A3030]">{o.zaman}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] text-red-400 transition-colors hover:bg-red-500/5 border border-red-500/10 mt-1">
            <LogOut size={12} />
            Diğer tüm oturumları sonlandır
          </button>
        </motion.div>

      </div>
    </div>
  )
}
