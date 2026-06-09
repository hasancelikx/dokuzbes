'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { girisYap } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { ApiError } from '@/lib/apiClient'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'

export function LoginForm() {
  const router = useRouter()
  const { setKullanici } = useAuthStore()
  const [email, setEmail]   = useState('')
  const [sifre, setSifre]   = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  // Oturum süresi dolduğu için yönlendirildiyse bilgilendir
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('expired') === '1') {
      toast.error('Oturum süreniz doldu, lütfen tekrar giriş yapın.')
    }
  }, [])

  async function handleGiris(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email || !sifre) { toast.error('E-posta ve şifre zorunludur.'); return }

    setYukleniyor(true)
    try {
      const kullanici = await girisYap(email, sifre)
      setKullanici(kullanici)
      if (kullanici.role === 'admin') {
        router.replace('/admin')
      } else {
        router.replace(kullanici.nickname ? '/salon' : '/kapi-ritueli')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'GECERSIZ_KIMLIK') toast.error('E-posta veya şifre hatalı.')
        else if (err.code === 'HESAP_BANDI') toast.error('Hesabınız askıya alınmış.')
        else toast.error(`Giriş yapılamadı. (${err.code})`)
      } else {
        toast.error('Sunucuya ulaşılamadı.')
      }
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-3xl p-8 w-full card-depth-gold"
    >
      {/* Başlık */}
      <div className="text-center mb-8">
        <p className="db-etiket text-[#C9A84C] tracking-[0.3em] mb-2">HOŞGELDINIZ</p>
        <h2
          className="text-[#F0EDE8] font-bold leading-tight"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}
        >
          Giriş Yapın
        </h2>
      </div>

      <form onSubmit={handleGiris} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="db-etiket text-[#5A5050] tracking-widest">E-POSTA</label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5050]" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              autoComplete="email"
              required
              className="input-glass w-full h-12 rounded-xl pl-10 pr-4 text-[14px] text-[#F0EDE8]"
            />
          </div>
        </div>

        {/* Şifre */}
        <div className="flex flex-col gap-1.5">
          <label className="db-etiket text-[#5A5050] tracking-widest">ŞİFRE</label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5050]" />
            <input
              type="password"
              value={sifre}
              onChange={e => setSifre(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="input-glass w-full h-12 rounded-xl pl-10 pr-4 text-[14px] text-[#F0EDE8]"
            />
          </div>
        </div>

        {/* Giriş butonu */}
        <motion.button
          type="submit"
          disabled={yukleniyor}
          whileHover={{ scale: yukleniyor ? 1 : 1.01 }}
          whileTap={{ scale: yukleniyor ? 1 : 0.97 }}
          className="relative mt-2 h-13 rounded-xl font-black tracking-widest text-black text-[12px] overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed cta-shimmer"
          style={{ height: 52 }}
        >
          {yukleniyor ? (
            <span className="flex items-center justify-center gap-2">
              <DBLoadingSpinner size={18} />
              <span>GİRİŞ YAPILIYOR</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              GİRİŞ YAP <ArrowRight size={14} />
            </span>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] text-[#3A3030] tracking-widest">VEYA</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Kayıt linki */}
      <p className="text-center text-[13px] text-[#5A5050]">
        Hesabınız yok mu?{' '}
        <Link href="/kayit" className="text-[#C9A84C] hover:text-[#E0C070] font-semibold transition-colors">
          Kayıt Olun
        </Link>
      </p>

      {/* Platform stats */}
      <div className="flex items-center justify-center gap-5 mt-6 pt-5 border-t border-white/[0.05]">
        {[['50K+', 'Üye'], ['200+', 'Yayıncı'], ['7/24', 'Aktif']].map(([val, label]) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-[#C9A84C] text-[13px] font-black">{val}</span>
            <span className="text-[#3A3030] text-[9px] tracking-widest uppercase">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
