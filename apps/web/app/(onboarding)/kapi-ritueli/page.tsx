'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, User } from 'lucide-react'
import { toast } from 'sonner'
import { DBButton } from '@/components/ui/DBButton'
import { DBInput } from '@/components/ui/DBInput'
import { api } from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'

const SEHIRLER = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri', 'Diğer',
]

export default function KapiRitueliPage() {
  const router = useRouter()
  const { kullanici, setKullanici } = useAuthStore()

  const [adim, setAdim] = useState(1)
  const [nickname, setNickname] = useState('')
  const [sehir, setSehir] = useState('')
  const [kayitYukleniyor, setKayitYukleniyor] = useState(false)
  const [nicknameHata, setNicknameHata] = useState('')
  const [gosterKameraZoom, setGosterKameraZoom] = useState(false)

  function nicknameDogrula() {
    if (nickname.trim().length < 3) {
      setNicknameHata('Rumuz en az 3 karakter olmalı.')
      return false
    }
    if (nickname.trim().length > 20) {
      setNicknameHata('Rumuz en fazla 20 karakter olabilir.')
      return false
    }
    setNicknameHata('')
    return true
  }

  async function handleTamamla() {
    if (!kullanici) return
    setKayitYukleniyor(true)

    try {
      const guncellendi = await api.user.patch<{ nickname: string; city: string | null }>('/users/me', {
        nickname: nickname.trim(),
        city: sehir || null,
      })

      setKullanici({ ...kullanici, nickname: guncellendi.nickname, city: guncellendi.city })
      setAdim(3)
    } catch {
      toast.error('Kaydedilemedi. Tekrar deneyin.')
    } finally {
      setKayitYukleniyor(false)
    }
  }

  function handleSalonGir() {
    setGosterKameraZoom(true)
  }

  return (
    <div className="relative min-h-screen mesh-bg flex items-center justify-center overflow-hidden px-4">
      {/* Atmosfer — ambient orb'lar (Canlı/Derin felsefesi) */}
      <div className="absolute top-0 left-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)', transform: 'translate(-50%,-35%)' }} />
      <div className="absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,42,0.12) 0%, transparent 70%)' }} />

      {/* Marka kilidi — adım 1-2 (üstteki boşluğu doldurur + marka kimliği) */}
      {adim < 3 && (
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="absolute top-[7vh] left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-10"
        >
          <h2 className="text-[#C9A84C] tracking-[0.26em] uppercase gold-shimmer"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 30, fontWeight: 700 }}>
            Dokuz Beş
          </h2>
          <div className="flex items-center gap-2.5">
            <span className="h-px w-8" style={{ background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.55))' }} />
            <span className="text-[#A09080] tracking-[0.3em] uppercase" style={{ fontSize: 9 }}>Canlı Eğlence</span>
            <span className="h-px w-8" style={{ background: 'linear-gradient(90deg,rgba(201,168,76,0.55),transparent)' }} />
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {adim === 1 && (
          <motion.div
            key="adim1"
            className="w-full max-w-sm px-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <p className="db-etiket text-[#C9A84C] mb-3">ADIM 1 / 2</p>
              <h1 className="db-baslik-2 text-[#F0EDE8]">Rumuzunuzu Seçin</h1>
              <p className="db-kucuk text-[#A09080] mt-2">Sahne adınız — değiştirilebilir</p>
            </div>

            <div className="vip-card p-6 flex flex-col gap-4">
              <DBInput
                label="Rumuz"
                placeholder="Örn: Hasan, Ahmet..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                hata={nicknameHata}
                icon={<User size={16} />}
                maxLength={20}
                autoFocus
              />
              <DBButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => {
                  if (nicknameDogrula()) setAdim(2)
                }}
              >
                Devam Et
              </DBButton>
            </div>
          </motion.div>
        )}

        {adim === 2 && (
          <motion.div
            key="adim2"
            className="w-full max-w-sm px-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <p className="db-etiket text-[#C9A84C] mb-3">ADIM 2 / 2</p>
              <h1 className="db-baslik-2 text-[#F0EDE8]">Şehriniz</h1>
              <p className="db-kucuk text-[#A09080] mt-2">Yakın yayıncıları öncelikli göstereceğiz</p>
            </div>

            <div className="vip-card p-6 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                {SEHIRLER.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSehir(s)}
                    className={[
                      'h-10 rounded-[8px] text-[14px] font-medium transition-all duration-150 border',
                      sehir === s
                        ? 'bg-[#8B1A2A] border-[#C9A84C] text-[#F0EDE8]'
                        : 'bg-[#1A1A1A] border-[rgba(201,168,76,0.2)] text-[#A09080] hover:border-[rgba(201,168,76,0.4)]',
                    ].join(' ')}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {sehir === 'Diğer' && (
                <DBInput
                  placeholder="Şehrinizi yazın"
                  icon={<MapPin size={16} />}
                  onChange={(e) => setSehir(e.target.value || 'Diğer')}
                />
              )}

              <DBButton
                variant="primary"
                size="lg"
                className="w-full mt-2"
                onClick={handleTamamla}
                yukleniyor={kayitYukleniyor}
                disabled={!sehir}
              >
                Kapıdan Gir
              </DBButton>

              <button
                className="db-kucuk text-[#5A5050] text-center hover:text-[#A09080] transition-colors"
                onClick={handleTamamla}
              >
                Şimdi geç
              </button>
            </div>
          </motion.div>
        )}

        {adim === 3 && !gosterKameraZoom && (
          <motion.div
            key="adim3"
            className="relative w-full h-screen overflow-hidden cursor-pointer"
            onClick={handleSalonGir}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/images/backgrounds/red-carpet.webp"
              alt="Kırmızı Halı"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[#0A0A0A]/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.h1
                className="db-baslik-1 text-[#C9A84C] text-center tracking-[0.12em]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                HOŞ GELDİNİZ
              </motion.h1>
              <motion.p
                className="db-etiket text-[#F0EDE8] opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                Salona girmek için dokunun
              </motion.p>
            </div>
          </motion.div>
        )}

        {gosterKameraZoom && (
          <motion.div
            key="zoom"
            className="fixed inset-0 z-50"
            initial={{ scale: 1 }}
            animate={{ scale: 1.15 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            onAnimationComplete={() => router.replace('/salon')}
            style={{
              backgroundImage: 'url(/images/backgrounds/red-carpet.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-[#0A0A0A]/30" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <p className="db-baslik-1 text-[#C9A84C] tracking-[0.12em]">HOŞ GELDİNİZ</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
