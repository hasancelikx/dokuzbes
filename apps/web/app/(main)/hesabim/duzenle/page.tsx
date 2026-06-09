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
import { api, ApiError } from '@/lib/apiClient'
import Link from 'next/link'

const AVATAR_TIPLER = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX = 2 * 1024 * 1024 // 2MB

const AVATAR_HATA: Record<string, string> = {
  GECERSIZ_DOSYA_TIPI: 'Sadece JPG, PNG veya WEBP yükleyebilirsin.',
  DOSYA_COK_BUYUK:     'Dosya 2MB sınırını aşıyor.',
  DOSYA_YOK:           'Dosya seçilmedi.',
}

export default function ProfilDuzenle() {
  const router = useRouter()
  const { kullanici, yukleniyor } = useAuth()
  const { setKullanici } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState(kullanici?.nickname ?? '')
  const [city, setCity]         = useState(kullanici?.city ?? '')
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [nicknameHata, setNicknameHata] = useState('')
  const [avatarYukleniyor, setAvatarYukleniyor] = useState(false)

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

  async function handleAvatarSec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0]
    e.target.value = '' // aynı dosya tekrar seçilebilsin
    if (!dosya || !kullanici) return

    if (!AVATAR_TIPLER.includes(dosya.type)) {
      toast.error(AVATAR_HATA.GECERSIZ_DOSYA_TIPI)
      return
    }
    if (dosya.size > AVATAR_MAX) {
      toast.error(AVATAR_HATA.DOSYA_COK_BUYUK)
      return
    }

    const form = new FormData()
    form.append('avatar', dosya)

    setAvatarYukleniyor(true)
    try {
      const { avatarUrl } = await api.user.upload<{ avatarUrl: string }>('/users/me/avatar', form)
      setKullanici({ ...kullanici, avatarUrl })
      toast.success('Profil fotoğrafın güncellendi.')
    } catch (err) {
      const kod = err instanceof ApiError ? err.code : ''
      toast.error(AVATAR_HATA[kod] ?? 'Yükleme başarısız. Tekrar deneyin.')
    } finally {
      setAvatarYukleniyor(false)
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
            disabled={avatarYukleniyor}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-lg hover:bg-[#E0C070] transition-colors disabled:opacity-60"
          >
            <Camera size={14} className="text-[#0A0A0A]" />
          </button>
          {/* Yükleme sırasında avatar üstünde spinner */}
          {avatarYukleniyor && (
            <div className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center">
              <DBLoadingSpinner size={24} />
            </div>
          )}
          {/* Avatar yükleme — MinIO/S3 (user-service: POST /users/me/avatar) */}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            className="hidden" onChange={handleAvatarSec} />
        </div>
        <p className="db-kucuk text-[#5A5050]">JPG, PNG veya WEBP · en fazla 2MB</p>
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
