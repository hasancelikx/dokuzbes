'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { DBButton } from '@/components/ui/DBButton'
import { DBInput } from '@/components/ui/DBInput'
import { DBCard } from '@/components/ui/DBCard'
import { girisYap } from '@/lib/firebase/auth'
import { useAuthStore } from '@/store/authStore'
import { ApiError } from '@/lib/apiClient'

export function LoginForm() {
  const router = useRouter()
  const { setKullanici } = useAuthStore()
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  async function handleGiris(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !sifre) {
      toast.error('E-posta ve şifre zorunludur.')
      return
    }

    setYukleniyor(true)
    try {
      const kullanici = await girisYap(email, sifre)
      setKullanici(kullanici)

      if (!kullanici.nickname) {
        router.replace('/kapi-ritueli')
      } else {
        router.replace('/salon')
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === 'GECERSIZ_KIMLIK') {
          toast.error('E-posta veya şifre hatalı.')
        } else if (err.code === 'HESAP_BANDI') {
          toast.error('Hesabınız askıya alınmış.')
        } else {
          toast.error(`Giriş yapılamadı. (${err.code})`)
        }
      } else {
        toast.error('Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.')
      }
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <DBCard glow className="p-6">
      <h2 className="db-baslik-3 text-[#F0EDE8] mb-6 text-center">Hoş Geldiniz</h2>

      <form onSubmit={handleGiris} className="flex flex-col gap-4">
        <DBInput
          label="E-posta"
          type="email"
          placeholder="ornek@mail.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          required
        />
        <DBInput
          label="Şifre"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          icon={<Lock size={16} />}
          required
        />

        <DBButton type="submit" variant="primary" size="lg" yukleniyor={yukleniyor} className="w-full mt-1">
          Giriş Yap
        </DBButton>
      </form>

      <p className="db-kucuk text-[#A09080] text-center mt-5">
        Hesabınız yok mu?{' '}
        <Link href="/kayit" className="text-[#C9A84C] hover:underline">
          Kayıt Olun
        </Link>
      </p>
    </DBCard>
  )
}
