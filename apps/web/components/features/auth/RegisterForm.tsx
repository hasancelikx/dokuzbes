'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { kayitOl } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/apiClient'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'

function sifreGucuHesapla(sifre: string) {
  let p = 0
  if (sifre.length >= 8)          p++
  if (sifre.length >= 12)         p++
  if (/[A-Z]/.test(sifre))        p++
  if (/[0-9]/.test(sifre))        p++
  if (/[^A-Za-z0-9]/.test(sifre)) p++
  if (p <= 1) return { puan: p, etiket: 'Çok zayıf', renk: '#F44336' }
  if (p <= 2) return { puan: p, etiket: 'Zayıf',     renk: '#FF9800' }
  if (p <= 3) return { puan: p, etiket: 'Orta',       renk: '#FFD700' }
  if (p <= 4) return { puan: p, etiket: 'Güçlü',      renk: '#8BC34A' }
  return { puan: p, etiket: 'Çok güçlü', renk: '#4CAF50' }
}

type NickDurum = 'bos' | 'kontrol' | 'musait' | 'dolu' | 'gecersiz'

export function RegisterForm() {
  const router = useRouter()
  const { setKullanici } = useAuthStore()
  const [email, setEmail]         = useState('')
  const [sifre, setSifre]         = useState('')
  const [nickname, setNickname]   = useState('')
  const [yas, setYas]             = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hatalar, setHatalar]     = useState<Record<string, string>>({})
  const [nickDurum, setNickDurum] = useState<NickDurum>('bos')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sifreGuc = sifre ? sifreGucuHesapla(sifre) : null

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!nickname)                           { setNickDurum('bos');      return }
    if (nickname.length < 2)                 { setNickDurum('gecersiz'); return }
    if (!/^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+$/.test(nickname)) { setNickDurum('gecersiz'); return }
    setNickDurum('kontrol')
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.user.get<{ musait: boolean }>(`/users/nickname-check?nickname=${encodeURIComponent(nickname)}`)
        setNickDurum(r.musait ? 'musait' : 'dolu')
      } catch { setNickDurum('bos') }
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [nickname])

  function dogrula() {
    const h: Record<string, string> = {}
    if (!email)             h.email = 'E-posta zorunlu.'
    if (sifre.length < 8)   h.sifre = 'En az 8 karakter.'
    if (!yas)               h.yas   = '18 yaş onayı zorunlu.'
    if (nickname && nickDurum === 'dolu')     h.nickname = 'Bu kullanıcı adı alınmış.'
    if (nickname && nickDurum === 'gecersiz') h.nickname = 'Harf, rakam ve _ kullanabilirsin.'
    setHatalar(h)
    return Object.keys(h).length === 0
  }

  async function handleKayit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!dogrula()) return
    setYukleniyor(true)
    try {
      const kullanici = await kayitOl(email, sifre, nickname || undefined)
      setKullanici(kullanici)
      router.replace('/kapi-ritueli')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'EMAIL_KULLANILIYOR')    setHatalar({ email: 'Bu e-posta zaten kayıtlı.' })
        else if (err.code === 'NICKNAME_KULLANILIYOR') setHatalar({ nickname: 'Bu kullanıcı adı alınmış.' })
        else toast.error(`Kayıt olunamadı. (${err.code})`)
      } else { toast.error('Sunucuya ulaşılamadı.') }
    } finally { setYukleniyor(false) }
  }

  const nickIkon = () => {
    if (nickDurum === 'kontrol') return <Loader size={14} className="animate-spin text-[#5A5050]" />
    if (nickDurum === 'musait')  return <CheckCircle size={14} className="text-green-400" />
    if (nickDurum === 'dolu' || nickDurum === 'gecersiz') return <XCircle size={14} className="text-red-400" />
    return <User size={15} className="text-[#5A5050]" />
  }

  const disabled = yukleniyor || nickDurum === 'dolu' || nickDurum === 'gecersiz' || nickDurum === 'kontrol'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-3xl p-8 w-full card-depth-gold"
    >
      <div className="text-center mb-7">
        <p className="db-etiket text-[#C9A84C] tracking-[0.3em] mb-2">DOKUZ BEŞ</p>
        <h2
          className="text-[#F0EDE8] font-bold leading-tight"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}
        >
          Hesap Oluştur
        </h2>
      </div>

      <form onSubmit={handleKayit} className="flex flex-col gap-3.5">

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="db-etiket text-[#5A5050] tracking-widest">E-POSTA</label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5050]" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ornek@mail.com" autoComplete="email" required
              className={['input-glass w-full h-11 rounded-xl pl-10 pr-4 text-[14px] text-[#F0EDE8]',
                hatalar.email ? 'border-[#F44336]/60 shadow-[0_0_0_3px_rgba(244,67,54,0.1)]' : ''].join(' ')} />
          </div>
          {hatalar.email && <p className="text-[11px] text-[#F44336]">{hatalar.email}</p>}
        </div>

        {/* Kullanıcı adı */}
        <div className="flex flex-col gap-1.5">
          <label className="db-etiket text-[#5A5050] tracking-widest">KULLANICI ADI <span className="text-[#3A3030] normal-case font-normal tracking-normal">(isteğe bağlı)</span></label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">{nickIkon()}</div>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="benzersiz_isim" autoComplete="username"
              className={['input-glass w-full h-11 rounded-xl pl-10 pr-4 text-[14px] text-[#F0EDE8]',
                hatalar.nickname ? 'border-[#F44336]/60' : nickDurum === 'musait' ? 'border-green-400/40' : ''].join(' ')} />
          </div>
          {nickDurum === 'musait' && <p className="text-[11px] text-green-400">Kullanılabilir</p>}
          {hatalar.nickname && <p className="text-[11px] text-[#F44336]">{hatalar.nickname}</p>}
        </div>

        {/* Şifre */}
        <div className="flex flex-col gap-1.5">
          <label className="db-etiket text-[#5A5050] tracking-widest">ŞİFRE</label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5050]" />
            <input type="password" value={sifre} onChange={e => setSifre(e.target.value)}
              placeholder="En az 8 karakter" autoComplete="new-password" required
              className={['input-glass w-full h-11 rounded-xl pl-10 pr-4 text-[14px] text-[#F0EDE8]',
                hatalar.sifre ? 'border-[#F44336]/60' : ''].join(' ')} />
          </div>
          {sifreGuc && (
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div key={i}
                    className="h-1 w-7 rounded-full"
                    animate={{ backgroundColor: i <= sifreGuc.puan ? sifreGuc.renk : '#1A1A1A' }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
              <span className="text-[10px]" style={{ color: sifreGuc.renk }}>{sifreGuc.etiket}</span>
            </div>
          )}
          {hatalar.sifre && <p className="text-[11px] text-[#F44336]">{hatalar.sifre}</p>}
        </div>

        {/* 18 yaş */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setYas(p => !p)}
            className={[
              'mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all',
              yas ? 'bg-[#C9A84C] border-[#C9A84C]' : 'border-white/20 bg-transparent group-hover:border-white/40',
            ].join(' ')}
          >
            {yas && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          </div>
          <span className="text-[12px] text-[#5A5050] leading-relaxed select-none">
            18 yaşından büyüğüm ve{' '}
            <span className="text-[#C9A84C]">kullanım koşullarını</span> kabul ediyorum.
          </span>
        </label>
        {hatalar.yas && <p className="text-[11px] text-[#F44336] -mt-1">{hatalar.yas}</p>}

        {/* Kayıt butonu */}
        <motion.button
          type="submit"
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.01 }}
          whileTap={{ scale: disabled ? 1 : 0.97 }}
          className="mt-1 rounded-xl font-black tracking-widest text-black text-[12px] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cta-shimmer flex items-center justify-center gap-2"
          style={{ height: 52 }}
        >
          {yukleniyor
            ? <><DBLoadingSpinner size={18} /><span>KAYIT YAPILIYOR</span></>
            : <><span>KAYIT OL</span><ArrowRight size={14} /></>
          }
        </motion.button>
      </form>

      <p className="text-center text-[13px] text-[#5A5050] mt-6">
        Zaten hesabınız var mı?{' '}
        <Link href="/giris" className="text-[#C9A84C] hover:text-[#E0C070] font-semibold transition-colors">
          Giriş Yapın
        </Link>
      </p>
    </motion.div>
  )
}
