'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { DBButton } from '@/components/ui/DBButton'
import { DBInput } from '@/components/ui/DBInput'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { useAuth } from '@/hooks/useAuth'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { profilGuncelle, nicknameKontrol } from '@/services/kullaniciService'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

export default function ProfilDuzenle() {
  const router = useRouter()
  const { kullanici, yukleniyor } = useAuth()
  const { setKullanici } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState(kullanici?.nickname ?? '')
  const [city, setCity]         = useState(kullanici?.city ?? '')
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [nicknameHata, setNicknameHata] = useState('')

  if (yukleniyor) {
    return (
      <div className="flex items-center justify-center py-32">
        <DBLoadingSpinner size={40} />
      </div>
    )
  }

  if (!kullanici) return null

  async function handleKaydet(e: React.FormEvent) {
    e.preventDefault()
    if (!kullanici) return

    const temizNickname = nickname.trim()
    const temizCity     = city.trim()

    if (temizNickname.length < 3) {
      setNicknameHata('Rumuz en az 3 karakter olmalı.')
      return
    }

    // Nickname değiştiyse benzersizlik kontrolü
    if (temizNickname.toLowerCase() !== (kullanici.nickname ?? '').toLowerCase()) {
      const { musait } = await nicknameKontrol(temizNickname)
      if (!musait) {
        setNicknameHata('Bu rumuz zaten kullanılıyor.')
        return
      }
    }

    setNicknameHata('')
    setKaydediliyor(true)

    try {
      await profilGuncelle({ nickname: temizNickname, city: temizCity })
      setKullanici({ ...kullanici, nickname: temizNickname, city: temizCity })
      toast.success('Profil güncellendi.')
      router.push('/hesabim')
    } catch {
      toast.error('Güncelleme başarısız. Tekrar deneyin.')
    } finally {
      setKaydediliyor(false)
    }
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 py-8 flex flex-col gap-6">

      {/* Üst bar */}
      <div className="flex items-center gap-3">
        <Link href="/hesabim" className="w-9 h-9 rounded-full bg-[#111111] border border-[rgba(255,255,255,0.06)] flex items-center justify-center hover:bg-[#1A1A1A] transition-colors">
          <ArrowLeft size={16} className="text-[#A09080]" />
        </Link>
        <h1 className="db-baslik-3 text-[#F0EDE8]">Profili Düzenle</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative">
          <DBAvatar
            src={kullanici.avatarUrl || null}
            initials={kullanici.nickname ?? ''}
            size={88}
            status="online"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-lg hover:bg-[#E0C070] transition-colors"
          >
            <Camera size={14} className="text-[#0A0A0A]" />
          </button>
          {/* Avatar yükleme — Firebase Storage açılınca aktive edilecek */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => {
            toast.info('Avatar yükleme yakında aktif olacak.')
          }} />
        </div>
        <p className="db-kucuk text-[#5A5050]">Fotoğrafını değiştirmek için tıkla</p>
      </div>

      {/* Form */}
      <form onSubmit={handleKaydet} className="flex flex-col gap-5">

        <div className="bg-[#111111] border border-[rgba(201,168,76,0.12)] rounded-[16px] p-5 flex flex-col gap-4">

          <DBInput
            label="Rumuz (Nickname)"
            type="text"
            placeholder="rumuzu_yaz"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              setNicknameHata('')
            }}
            hata={nicknameHata}
            required
          />

          <DBInput
            label="Şehir"
            type="text"
            placeholder="İstanbul"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          {/* E-posta — salt okunur */}
          <div className="flex flex-col gap-1.5">
            <label className="db-etiket text-[#A09080]">E-posta</label>
            <div className="bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] rounded-[10px] px-4 py-3 flex items-center justify-between">
              <span className="db-govde-kck text-[#5A5050]">{kullanici.email}</span>
              <span className="db-etiket text-[#3A3030]">DEĞİŞTİRİLEMEZ</span>
            </div>
          </div>

        </div>

        <DBButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          yukleniyor={kaydediliyor}
        >
          Kaydet
        </DBButton>

      </form>
    </div>
  )
}
