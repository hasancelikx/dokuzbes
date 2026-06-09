'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic2, Music, MessageCircle, Shuffle, Sparkles, ChevronRight, CheckCircle } from 'lucide-react'
import { api, ApiError } from '@/lib/apiClient'
import { useAuth } from '@/hooks/useAuth'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'

const KATEGORILER = [
  { value: 'muzik',  label: 'Müzik',   aciklama: 'Şarkı söyle, çalgı çal',   icon: Music          },
  { value: 'sohbet', label: 'Sohbet',  aciklama: 'Muhabbet, talk show',      icon: MessageCircle  },
  { value: 'dans',   label: 'Dans',    aciklama: 'Performans, koreografi',   icon: Sparkles       },
  { value: 'diger',  label: 'Diğer',   aciklama: 'Farklı içerik türleri',    icon: Shuffle        },
]

type Adim = 'form' | 'gonderildi'

export default function YayinciOlSayfasi() {
  const router = useRouter()
  const { kullanici, yukleniyor } = useAuth()
  const [adim, setAdim] = useState<Adim>('form')
  const [gonderiyor, setGonderiyor] = useState(false)
  const [hata, setHata] = useState<string | null>(null)

  const [stageName, setStageName] = useState('')
  const [kategori, setKategori] = useState('')
  const [bio, setBio] = useState('')
  const [sehir, setSehir] = useState('')

  if (yukleniyor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DBLoadingSpinner size={40} />
      </div>
    )
  }

  if (!kullanici) {
    router.replace('/giris')
    return null
  }

  if (kullanici.role === 'performer') {
    router.replace('/yayinci-paneli')
    return null
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault()
    if (!stageName.trim() || !kategori) return
    setGonderiyor(true)
    setHata(null)

    try {
      await api.performer.post('/performers/apply', {
        stageName: stageName.trim(),
        category: kategori,
        bio: bio.trim() || undefined,
        city: sehir.trim() || undefined,
      })
      setAdim('gonderildi')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message === 'BEKLEYEN_BASVURU_VAR') {
          setHata('Bekleyen bir başvurun zaten var. Admin incelemesi bekleniyor.')
        } else if (err.message === 'ZATEN_YAYINCI') {
          setHata('Zaten bir performer hesabın var.')
        } else {
          setHata('Başvuru gönderilemedi. Tekrar deneyin.')
        }
      } else {
        setHata('Bağlantı hatası. Tekrar deneyin.')
      }
    } finally {
      setGonderiyor(false)
    }
  }

  if (adim === 'gonderildi') {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-[#C9A84C]" />
          </div>
          <h1 className="db-baslik-1 text-[#F0EDE8] mb-3">Başvurun Alındı!</h1>
          <p className="db-govde text-[#5A5050] mb-8">
            Ekibimiz başvurunu inceleyecek. Sonuç en geç 48 saat içinde bildirim olarak iletilecek.
          </p>
          <button
            onClick={() => router.push('/salon')}
            className="px-8 py-3 bg-[rgba(201,168,76,0.15)] text-[#C9A84C] rounded-xl font-medium hover:bg-[rgba(201,168,76,0.25)] transition-colors"
          >
            Salona Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mesh-bg px-4 py-8">
      <div className="max-w-lg mx-auto">

        {/* Başlık */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center mx-auto mb-4">
            <Mic2 size={28} className="text-[#C9A84C]" />
          </div>
          <h1 className="db-baslik-1 text-[#F0EDE8] mb-2">Yayıncı Ol</h1>
          <p className="db-govde text-[#5A5050]">
            Başvurunu gönder, onaylandığında yayına başla.
          </p>
        </div>

        <form onSubmit={gonder} className="flex flex-col gap-5">

          {/* Sahne Adı */}
          <div>
            <label className="db-etiket text-[#5A5050] block mb-2">SAHNE ADI *</label>
            <input
              type="text"
              placeholder="Sahne adın (2-50 karakter)"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              maxLength={50}
              required
              className="w-full bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3.5 text-[#F0EDE8] placeholder-[#3A3030] focus:outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="db-etiket text-[#5A5050] block mb-2">KATEGORİ *</label>
            <div className="grid grid-cols-2 gap-2">
              {KATEGORILER.map(({ value, label, aciklama, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKategori(value)}
                  className={[
                    'flex items-start gap-3 p-3.5 rounded-[12px] border text-left transition-all',
                    kategori === value
                      ? 'border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)]'
                      : 'border-[rgba(255,255,255,0.06)] bg-[#111111] hover:border-[rgba(255,255,255,0.12)]',
                  ].join(' ')}
                >
                  <Icon
                    size={16}
                    className={kategori === value ? 'text-[#C9A84C] mt-0.5 shrink-0' : 'text-[#5A5050] mt-0.5 shrink-0'}
                  />
                  <div>
                    <p className={`text-sm font-medium ${kategori === value ? 'text-[#C9A84C]' : 'text-[#A09080]'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-[#3A3030] mt-0.5">{aciklama}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="db-etiket text-[#5A5050] block mb-2">
              BİO <span className="text-[#3A3030] normal-case font-normal">(isteğe bağlı)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Kendini kısaca tanıt... (max 500 karakter)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              className="w-full bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3.5 text-[#F0EDE8] placeholder-[#3A3030] focus:outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors resize-none"
            />
            <p className="text-xs text-[#3A3030] mt-1 text-right">{bio.length}/500</p>
          </div>

          {/* Şehir */}
          <div>
            <label className="db-etiket text-[#5A5050] block mb-2">
              ŞEHİR <span className="text-[#3A3030] normal-case font-normal">(isteğe bağlı)</span>
            </label>
            <input
              type="text"
              placeholder="İstanbul, Ankara..."
              value={sehir}
              onChange={(e) => setSehir(e.target.value)}
              maxLength={50}
              className="w-full bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3.5 text-[#F0EDE8] placeholder-[#3A3030] focus:outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
            />
          </div>

          {/* Hata */}
          {hata && (
            <p className="text-sm text-red-400 bg-red-500/10 px-4 py-3 rounded-xl">{hata}</p>
          )}

          {/* Gönder */}
          <button
            type="submit"
            disabled={!stageName.trim() || !kategori || gonderiyor}
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#C9A84C] text-black font-semibold rounded-[12px] hover:bg-[#D4B860] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {gonderiyor ? (
              <DBLoadingSpinner size={18} />
            ) : (
              <>
                Başvuruyu Gönder
                <ChevronRight size={18} />
              </>
            )}
          </button>

          <p className="text-xs text-[#3A3030] text-center">
            Başvurun ekibimiz tarafından incelenir. Onaylandığında bildirim alacaksın.
          </p>
        </form>
      </div>
    </div>
  )
}
