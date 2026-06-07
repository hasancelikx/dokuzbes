'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, CheckCircle, XCircle, Loader } from 'lucide-react'
import { toast } from 'sonner'
import { DBButton } from '@/components/ui/DBButton'
import { DBInput } from '@/components/ui/DBInput'
import { DBCard } from '@/components/ui/DBCard'
import { kayitOl } from '@/lib/firebase/auth'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/apiClient'

function sifreGucuHesapla(sifre: string): { puan: number; etiket: string; renk: string } {
  let puan = 0
  if (sifre.length >= 8)           puan++
  if (sifre.length >= 12)          puan++
  if (/[A-Z]/.test(sifre))         puan++
  if (/[0-9]/.test(sifre))         puan++
  if (/[^A-Za-z0-9]/.test(sifre))  puan++
  if (puan <= 1) return { puan, etiket: 'Çok zayıf', renk: '#F44336' }
  if (puan <= 2) return { puan, etiket: 'Zayıf',     renk: '#FF9800' }
  if (puan <= 3) return { puan, etiket: 'Orta',       renk: '#FFD700' }
  if (puan <= 4) return { puan, etiket: 'Güçlü',      renk: '#8BC34A' }
  return { puan, etiket: 'Çok güçlü', renk: '#4CAF50' }
}

type NicknameDurum = 'bos' | 'kontrol' | 'musait' | 'dolu' | 'gecersiz'

export function RegisterForm() {
  const router = useRouter()
  const { setKullanici } = useAuthStore()
  const [email, setEmail]     = useState('')
  const [sifre, setSifre]     = useState('')
  const [nickname, setNickname] = useState('')
  const [yas, setYas]         = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hatalar, setHatalar] = useState<Record<string, string>>({})
  const [nicknameDurum, setNicknameDurum] = useState<NicknameDurum>('bos')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sifreGuc = sifre ? sifreGucuHesapla(sifre) : null

  // Nickname debounce kontrolü
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!nickname) { setNicknameDurum('bos'); return }
    if (nickname.length < 2) { setNicknameDurum('gecersiz'); return }
    if (!/^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+$/.test(nickname)) { setNicknameDurum('gecersiz'); return }

    setNicknameDurum('kontrol')
    debounceRef.current = setTimeout(async () => {
      try {
        const sonuc = await api.user.get<{ musait: boolean; sebep?: string }>(
          `/users/nickname-check?nickname=${encodeURIComponent(nickname)}`
        )
        setNicknameDurum(sonuc.musait ? 'musait' : 'dolu')
      } catch {
        setNicknameDurum('bos')
      }
    }, 500)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [nickname])

  function dogrula(): boolean {
    const yeniHatalar: Record<string, string> = {}
    if (!email) yeniHatalar.email = 'E-posta zorunlu.'
    if (sifre.length < 8) yeniHatalar.sifre = 'Şifre en az 8 karakter olmalı.'
    if (!yas) yeniHatalar.yas = '18 yaş onayı zorunlu.'
    if (nickname && nicknameDurum === 'dolu') yeniHatalar.nickname = 'Bu kullanıcı adı alınmış.'
    if (nickname && nicknameDurum === 'gecersiz') yeniHatalar.nickname = 'Geçersiz karakter içeriyor.'
    setHatalar(yeniHatalar)
    return Object.keys(yeniHatalar).length === 0
  }

  async function handleKayit(e: React.FormEvent) {
    e.preventDefault()
    if (!dogrula()) return

    setYukleniyor(true)
    try {
      const kullanici = await kayitOl(email, sifre, nickname || undefined)
      setKullanici(kullanici)
      router.replace('/kapi-ritueli')
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === 'EMAIL_KULLANILIYOR') {
          setHatalar({ email: 'Bu e-posta adresi zaten kayıtlı.' })
        } else if (err.code === 'NICKNAME_KULLANILIYOR') {
          setHatalar({ nickname: 'Bu kullanıcı adı alınmış.' })
        } else {
          toast.error(`Kayıt olunamadı. (${err.code})`)
        }
      } else {
        toast.error('Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.')
      }
    } finally {
      setYukleniyor(false)
    }
  }

  const nicknameIkon = () => {
    if (nicknameDurum === 'kontrol') return <Loader size={14} className="animate-spin text-gray-400" />
    if (nicknameDurum === 'musait')  return <CheckCircle size={14} className="text-green-400" />
    if (nicknameDurum === 'dolu' || nicknameDurum === 'gecersiz') return <XCircle size={14} className="text-red-400" />
    return <User size={16} />
  }

  const nicknameMesaj = () => {
    if (nicknameDurum === 'musait')  return <span className="text-green-400 text-xs">Kullanılabilir</span>
    if (nicknameDurum === 'dolu')    return <span className="text-red-400 text-xs">Bu kullanıcı adı alınmış</span>
    if (nicknameDurum === 'gecersiz') return <span className="text-red-400 text-xs">Harf, rakam ve _ kullanabilirsin</span>
    return null
  }

  return (
    <DBCard glow className="p-6">
      <h2 className="db-baslik-3 text-[#F0EDE8] mb-6 text-center">Hesap Oluştur</h2>

      <form onSubmit={handleKayit} className="flex flex-col gap-4">
        <DBInput
          label="E-posta"
          type="email"
          placeholder="ornek@mail.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hata={hatalar.email}
          icon={<Mail size={16} />}
          required
        />

        <div className="flex flex-col gap-1">
          <DBInput
            label="Kullanıcı Adı"
            type="text"
            placeholder="Benzersiz bir isim seç (isteğe bağlı)"
            autoComplete="username"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            hata={hatalar.nickname}
            icon={nicknameIkon()}
          />
          {!hatalar.nickname && nicknameMesaj()}
        </div>

        <div className="flex flex-col gap-1.5">
          <DBInput
            label="Şifre"
            type="password"
            placeholder="En az 8 karakter"
            autoComplete="new-password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            hata={hatalar.sifre}
            icon={<Lock size={16} />}
            required
          />
          {sifreGuc && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-1 w-8 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: i <= sifreGuc.puan ? sifreGuc.renk : '#242424' }}
                  />
                ))}
              </div>
              <span className="db-kucuk" style={{ color: sifreGuc.renk }}>{sifreGuc.etiket}</span>
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={yas}
            onChange={(e) => setYas(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#C9A84C]"
          />
          <span className="db-kucuk text-[#A09080]">
            18 yaşından büyüğüm ve{' '}
            <span className="text-[#C9A84C]">kullanım koşullarını</span> kabul ediyorum.
          </span>
        </label>
        {hatalar.yas && <p className="db-kucuk text-[#F44336] -mt-2">{hatalar.yas}</p>}

        <DBButton
          type="submit"
          variant="primary"
          size="lg"
          yukleniyor={yukleniyor}
          className="w-full"
          disabled={nicknameDurum === 'dolu' || nicknameDurum === 'gecersiz' || nicknameDurum === 'kontrol'}
        >
          Kayıt Ol
        </DBButton>
      </form>

      <p className="db-kucuk text-[#A09080] text-center mt-5">
        Zaten hesabınız var mı?{' '}
        <Link href="/giris" className="text-[#C9A84C] hover:underline">
          Giriş Yapın
        </Link>
      </p>
    </DBCard>
  )
}
