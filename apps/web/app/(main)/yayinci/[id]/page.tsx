'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, ArrowLeft, Heart, MessageSquare, Star, Clock, Bell, BellOff, Coins, CheckCircle } from 'lucide-react'
import { DBButton } from '@/components/ui/DBButton'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { DBKonfeti } from '@/components/ui/DBKonfeti'
import { useYayinci } from '@/hooks/useYayinci'
import { useAuth } from '@/hooks/useAuth'
import { masaAc } from '@/services/masaService'
import { api } from '@/lib/apiClient'
import { toast } from 'sonner'
import type { YayinciDurumu } from '@/types/yayinci'

const durumRenk: Record<YayinciDurumu, string> = {
  online:  'bg-[#4CAF50]',
  musait:  'bg-[#4CAF50]',
  mesgul:  'bg-[#F44336]',
  molada:  'bg-[#9C27B0]',
  offline: 'bg-[#616161]',
}

const durumEtiket: Record<YayinciDurumu, string> = {
  online:  'Çevrimiçi',
  musait:  'Müsait',
  mesgul:  'Şu an meşgul',
  molada:  'Molada',
  offline: 'Çevrimdışı',
}

/* Masa fiyatları */
const MASA_TIPLERI = [
  { id: 'kisa',  label: '5 dk',  gold: 50,  sure: 5  },
  { id: 'uzun',  label: '15 dk', gold: 120, sure: 15 },
  { id: 'ozel',  label: '30 dk', gold: 250, sure: 30 },
]

type Sekme = 'hakkinda' | 'yayinlar' | 'hediyeler' | 'rozetler'

const sekmeler: { id: Sekme; label: string }[] = [
  { id: 'hakkinda',  label: 'Hakkında'  },
  { id: 'yayinlar',  label: 'Yayınlar'  },
  { id: 'hediyeler', label: 'Hediyeler' },
  { id: 'rozetler',  label: 'Rozetler'  },
]

const yayinProgrami = [
  { gun: 'Pazartesi', saat: '21:00 – 01:00', aktif: true  },
  { gun: 'Salı',      saat: 'Yayın yok',     aktif: false },
  { gun: 'Çarşamba',  saat: '21:00 – 01:00', aktif: true  },
  { gun: 'Perşembe',  saat: 'Yayın yok',     aktif: false },
  { gun: 'Cuma',      saat: '21:00 – 01:00', aktif: true  },
  { gun: 'Cumartesi', saat: '22:00 – 02:00', aktif: true  },
  { gun: 'Pazar',     saat: 'Yayın yok',     aktif: false },
]

const HEDIYE_KATALOG = [
  { emoji: '🌹', isim: 'Gül',           gold: 10,  kategori: 'temel'   },
  { emoji: '👏', isim: 'Alkış',         gold: 5,   kategori: 'temel'   },
  { emoji: '🍫', isim: 'Çikolata',      gold: 20,  kategori: 'orta'    },
  { emoji: '🌸', isim: 'Parfüm',        gold: 50,  kategori: 'orta'    },
  { emoji: '💛', isim: 'Gold Bilezik',  gold: 150, kategori: 'premium' },
  { emoji: '💍', isim: 'Elmas Yüzük',  gold: 500, kategori: 'luks'    },
]

export default function YayinciProfil({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { kullanici } = useAuth()
  const { yayinci, yukleniyor, hata } = useYayinci(id)
  const router = useRouter()
  const [aktifSekme, setAktifSekme] = useState<Sekme>('hakkinda')
  const [takipEdiliyor, setTakipEdiliyor] = useState(false)
  const [takipSayisi, setTakipSayisi] = useState(128)
  const [haberVerilsin, setHaberVerilsin] = useState(false)
  const [konfeti, setKonfeti] = useState(false)
  const [secilenMasa, setSecilenMasa] = useState<string | null>(null)
  const [hatirlatSet, setHatirlatSet] = useState<string | null>(null)
  const [masaYukleniyor, setMasaYukleniyor] = useState(false)

  async function handleTakip() {
    const yeni = !takipEdiliyor
    setTakipEdiliyor(yeni)
    setTakipSayisi(p => yeni ? p + 1 : p - 1)
    try {
      await api.user[yeni ? 'post' : 'delete'](`/takip/${id}`)
    } catch {
      setTakipEdiliyor(!yeni)
      setTakipSayisi(p => yeni ? p - 1 : p + 1)
      toast.error('İşlem başarısız.')
    }
  }

  function handleHediyeGonder(isim: string, gold: number) {
    toast.success(`${isim} hediyesi gönderildi! −${gold} 🪙`)
  }

  function handleHaberVer() {
    const yeni = !haberVerilsin
    setHaberVerilsin(yeni)
    toast[yeni ? 'success' : 'info'](yeni ? 'Masa boşalınca sizi haberdar edeceğiz.' : 'Bildirim iptal edildi.')
  }

  function handleHatirlatToggle(gun: string) {
    const yeni = gun === hatirlatSet ? null : gun
    setHatirlatSet(yeni)
    toast[yeni ? 'success' : 'info'](yeni ? `${gun} için hatırlatıcı kuruldu.` : 'Hatırlatıcı kaldırıldı.')
  }

  async function handleMasaAc() {
    if (!yayinci || !secilenMasa) return
    setMasaYukleniyor(true)
    try {
      const sonuc = await masaAc(yayinci.id, secilenMasa as 'kisa' | 'uzun' | 'ozel')
      toast.success(`Masa açıldı! ${sonuc.goldMaliyet} gold düşüldü`)
      router.push(`/masa/${sonuc.id}`)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'YETERSIZ_GOLD') toast.error('Yetersiz gold.')
      else if (code === 'YAYINCI_MUSAIT_DEGIL') toast.error('Yayıncı şu an müsait değil.')
      else if (code === 'ZATEN_MASADA') toast.error('Zaten aktif bir masadasınız.')
      else toast.error('Masa açılamadı. Tekrar deneyin.')
    } finally {
      setMasaYukleniyor(false)
    }
  }

  /* VIP giriş konfetisi — yalnızca ilk render'da */
  useEffect(() => {
    if (!kullanici || !yayinci) return
    if ((kullanici.vipLevel ?? 1) >= 3) {
      const timer = setTimeout(() => setKonfeti(true), 500)
      return () => clearTimeout(timer)
    }
  }, [kullanici, yayinci])

  if (yukleniyor) {
    return <div className="flex items-center justify-center min-h-screen"><DBLoadingSpinner size={44} /></div>
  }

  if (hata || !yayinci) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="db-govde text-[#F44336]">{hata ?? 'Yayıncı bulunamadı.'}</p>
        <Link href="/salon"><DBButton variant="secondary" size="sm">Salona Dön</DBButton></Link>
      </div>
    )
  }

  const canli      = ['online', 'musait', 'mesgul'].includes(yayinci.durum)
  const mesgul     = yayinci.durum === 'mesgul'
  const musait     = yayinci.durum === 'musait' || yayinci.durum === 'online'
  const isVip      = (kullanici?.vipLevel ?? 0) >= 3

  return (
    <div className="min-h-screen mesh-bg">

      {/* Konfeti — VIP giriş efekti */}
      <DBKonfeti aktif={konfeti} sure={3500} sayi={50} onBitti={() => setKonfeti(false)} />

      {/* VIP giriş mesajı */}
      {konfeti && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-[9997] bg-[rgba(10,10,10,0.92)] backdrop-blur-md border border-[rgba(201,168,76,0.4)] rounded-[16px] px-6 py-3 flex items-center gap-3 fade-in-scale">
          <span className="text-2xl">{kullanici?.vipLevel === 5 ? '👑' : kullanici?.vipLevel === 4 ? '💎' : '⭐'}</span>
          <div>
            <p className="db-govde-kck font-bold text-[#C9A84C] vip-glow">VIP Giriş</p>
            <p className="db-kucuk text-[#A09080]">{yayinci.displayName} sizi gördü!</p>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="relative w-full h-[340px] sm:h-[420px]">
        {yayinci.avatarUrl ? (
          <Image src={yayinci.avatarUrl} alt={yayinci.displayName} fill className="object-cover" sizes="700px" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A10] to-[#0A0A0A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[rgba(0,0,0,0.35)] to-[rgba(0,0,0,0.1)]" />

        <Link href="/salon" className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[rgba(0,0,0,0.55)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
          <ArrowLeft size={16} className="text-[#F0EDE8]" />
        </Link>

        {canli && (
          <div className={['absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1', mesgul ? 'bg-[#F44336]' : 'bg-[#8B1A2A] pulse-border-live'].join(' ')}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[11px] font-bold tracking-wider">{mesgul ? 'MEŞGUL' : 'CANLI'}</span>
            {!mesgul && yayinci.aktifIzleyici > 0 && (
              <span className="text-white text-[11px] font-bold">· {yayinci.aktifIzleyici}</span>
            )}
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="db-baslik-2 text-[#F0EDE8]">{yayinci.displayName}</h1>
            <span className="text-[#C9A84C] text-lg">✓</span>
            {yayinci.vipSeviye >= 2 && (
              <span className="db-etiket text-[#C9A84C] bg-[rgba(201,168,76,0.2)] border border-[rgba(201,168,76,0.4)] px-2 py-0.5 rounded-full vip-glow">
                {yayinci.vipSeviye === 3 ? '👑 VIP' : '⭐ VIP'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${durumRenk[yayinci.durum]}`} />
            <span className="db-kucuk text-[#A09080]">{durumEtiket[yayinci.durum]}</span>
            {yayinci.city && (
              <>
                <span className="text-[#3A3030]">·</span>
                <span className="flex items-center gap-1 db-kucuk text-[#A09080]"><MapPin size={10} />{yayinci.city}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 pb-10 flex flex-col gap-5">

        {/* ── Aksiyon Butonları ── */}
        <div className="flex gap-2 pt-4">
          <DBButton
            variant={takipEdiliyor ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1"
            icon={<Heart size={14} fill={takipEdiliyor ? '#C9A84C' : 'none'} />}
            onClick={handleTakip}
          >
            {takipEdiliyor ? 'Takip Ediliyor' : 'Takip Et'}
          </DBButton>

          <DBButton variant="secondary" size="sm" className="flex-1" icon={<MessageSquare size={14} />}
            onClick={() => router.push(`/mesajlar?performer=${encodeURIComponent(yayinci.displayName)}`)}>
            Mesaj
          </DBButton>
        </div>

        {/* ── Masa seçici (müsaitse) ── */}
        {musait && (
          <div className="vip-card p-4 flex flex-col gap-3">
            <p className="db-etiket text-[#5A5050]">MASA SÜRESİ SEÇ</p>
            <div className="grid grid-cols-3 gap-2">
              {MASA_TIPLERI.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSecilenMasa(m.id === secilenMasa ? null : m.id)}
                  className={[
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-[12px] border transition-all cursor-pointer',
                    secilenMasa === m.id
                      ? 'bg-[rgba(139,26,42,0.2)] border-[#8B1A2A] text-[#F0EDE8]'
                      : 'bg-[#0A0A0A] border-[rgba(255,255,255,0.06)] text-[#5A5050] hover:border-[rgba(201,168,76,0.25)]',
                  ].join(' ')}
                >
                  <Clock size={14} className={secilenMasa === m.id ? 'text-[#C9A84C]' : ''} />
                  <span className="db-etiket">{m.label}</span>
                  <div className="flex items-center gap-1">
                    <Coins size={10} className="text-[#C9A84C]" />
                    <span className="text-[11px] text-[#C9A84C] font-bold">{m.gold}</span>
                  </div>
                </button>
              ))}
            </div>
            {secilenMasa && (
              <DBButton
                variant="primary"
                size="md"
                className="w-full fade-in-up"
                onClick={handleMasaAc}
                yukleniyor={masaYukleniyor}
              >
                Masaya Otur · {MASA_TIPLERI.find(m => m.id === secilenMasa)?.gold} 🪙
              </DBButton>
            )}
          </div>
        )}

        {/* ── Meşgulse: "Masa Boşaldı Bildirimi" ── */}
        {mesgul && (
          <div className="vip-card p-4 flex flex-col gap-3 fade-in-scale" style={{ borderColor: 'rgba(244,67,54,0.2)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F44336]" />
              <p className="db-govde-kck text-[#F0EDE8] font-semibold">{yayinci.displayName} şu an meşgul</p>
            </div>
            <p className="db-kucuk text-[#5A5050]">Masa boşaldığında sizi bilgilendirmemizi ister misiniz?</p>
            <button
              onClick={handleHaberVer}
              className={[
                'flex items-center gap-2.5 py-3 px-4 rounded-[12px] border transition-all cursor-pointer w-full',
                haberVerilsin
                  ? 'bg-[rgba(76,175,80,0.12)] border-[rgba(76,175,80,0.35)] text-[#4CAF50]'
                  : 'bg-[#0A0A0A] border-[rgba(255,255,255,0.08)] text-[#A09080] hover:border-[rgba(201,168,76,0.25)]',
              ].join(' ')}
            >
              {haberVerilsin ? (
                <CheckCircle size={16} className="text-[#4CAF50] shrink-0" />
              ) : (
                <Bell size={16} className="shrink-0" />
              )}
              <span className="db-govde-kck font-medium">
                {haberVerilsin ? 'Bildirim kuruldu — masa boşalınca haber vereceğiz' : 'Masa boşalınca bana haber ver'}
              </span>
              {haberVerilsin && <BellOff size={14} className="ml-auto text-[#5A5050]" />}
            </button>
          </div>
        )}

        {/* ── İstatistikler ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Takipçi', value: yayinci.toplamGorusme > 0 ? `${(yayinci.toplamGorusme * 80).toLocaleString('tr-TR')}` : '0' },
            { label: 'Takip',   value: takipSayisi.toLocaleString('tr-TR') },
            { label: 'Yayın',   value: yayinci.toplamGorusme.toString() },
            { label: 'Hediye',  value: yayinci.toplamHediye.toLocaleString('tr-TR') },
          ].map(({ label, value }) => (
            <div key={label} className="vip-card p-3 text-center">
              <p className="font-bold text-[#F0EDE8] tabular-nums" style={{ fontSize: 17 }}>{value}</p>
              <p className="text-[10px] text-[#5A5050] mt-0.5 tracking-wide uppercase">{label}</p>
            </div>
          ))}
        </div>

        {/* Yıldız puanı */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < yayinci.puan ? 'text-[#C9A84C]' : 'text-[#3A3030]'} fill={i < yayinci.puan ? '#C9A84C' : 'transparent'} />
          ))}
          <span className="db-kucuk text-[#5A5050] ml-1">{yayinci.puan}.0</span>
        </div>

        {/* ── Sekmeler ── */}
        <div className="flex relative border-b border-[rgba(255,255,255,0.06)]">
          {sekmeler.map(({ id: sid, label }) => (
            <button
              key={sid}
              onClick={() => setAktifSekme(sid)}
              className="relative flex-1 py-3 text-[11px] font-semibold tracking-[0.05em] transition-colors duration-150 cursor-pointer"
              style={{ color: aktifSekme === sid ? '#C9A84C' : '#5A5050' }}
            >
              {label}
              {aktifSekme === sid && (
                <motion.div
                  layoutId="yayinci-tab-indicator"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Sekme içeriği ── */}
        {aktifSekme === 'hakkinda' && (
          <div className="flex flex-col gap-5">
            {yayinci.bio && (
              <div className="bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-[14px] p-4">
                <p className="db-govde-kck text-[#A09080] leading-relaxed">{yayinci.bio}</p>
              </div>
            )}

            {yayinci.etiketler?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {yayinci.etiketler.map(e => (
                  <span key={e} className="db-etiket text-[#C9A84C] bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] px-3 py-1.5 rounded-full">
                    {e}
                  </span>
                ))}
              </div>
            )}

            {/* Yayın Programı — geliştirilmiş */}
            <div className="bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-[14px] overflow-hidden">
              <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                <p className="db-etiket text-[#5A5050] flex items-center gap-2">
                  <Clock size={11} /> YAYIN PROGRAMI
                </p>
                <span className="db-kucuk text-[#5A5050]">4 gün / hafta</span>
              </div>
              <div className="flex flex-col">
                {yayinProgrami.map(({ gun, saat, aktif }) => (
                  <div
                    key={gun}
                    className={[
                      'flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.03)] last:border-0',
                      aktif ? '' : 'opacity-35',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      {aktif && <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />}
                      <span className={['db-kucuk', aktif ? 'text-[#F0EDE8]' : 'text-[#5A5050]'].join(' ')}>{gun}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={['db-kucuk font-medium', aktif ? 'text-[#C9A84C]' : 'text-[#3A3030]'].join(' ')}>{saat}</span>
                      {aktif && (
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                          title="Hatırlat"
                          onClick={() => handleHatirlatToggle(gun)}
                        >
                          {hatirlatSet === gun
                            ? <BellOff size={13} className="text-[#C9A84C]" />
                            : <Bell size={13} className="text-[#3A3030]" />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {aktifSekme === 'yayinlar' && (
          <div className="flex flex-col items-center py-8 gap-3">
            <p className="db-baslik-3 text-[#5A5050]">Henüz yayın yok</p>
            <p className="db-kucuk text-[#3A3030]">Geçmiş yayınlar burada görünecek.</p>
          </div>
        )}

        {aktifSekme === 'hediyeler' && (
          <div className="flex flex-col gap-4">
            <p className="db-etiket text-[#5A5050]">HEDİYE KATALOĞU</p>
            <div className="grid grid-cols-3 gap-3">
              {HEDIYE_KATALOG.map(h => (
                <button
                  key={h.isim}
                  onClick={() => handleHediyeGonder(h.isim, h.gold)}
                  className="flex flex-col items-center gap-2 p-3 bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-[14px] hover:border-[rgba(201,168,76,0.3)] hover:bg-[rgba(201,168,76,0.04)] transition-all card-hover cursor-pointer"
                >
                  <span className="text-3xl leading-none">{h.emoji}</span>
                  <span className="db-kucuk text-[#A09080]">{h.isim}</span>
                  <div className="flex items-center gap-1">
                    <Coins size={10} className="text-[#C9A84C]" />
                    <span className="text-[11px] text-[#C9A84C] font-bold">{h.gold}</span>
                  </div>
                </button>
              ))}
            </div>
            {!musait && (
              <p className="db-kucuk text-[#5A5050] text-center">Hediye göndermek için yayıncının masasına oturun</p>
            )}
          </div>
        )}

        {aktifSekme === 'rozetler' && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: '⭐', label: 'VIP Yayıncı',  aktif: yayinci.vipSeviye >= 2 },
              { emoji: '💎', label: 'Cömert',        aktif: yayinci.toplamHediye > 100 },
              { emoji: '🎵', label: 'Müzisyen',      aktif: yayinci.etiketler?.includes('müzik') },
              { emoji: '💬', label: 'Sohbet Ustası', aktif: yayinci.etiketler?.includes('sohbet') },
              { emoji: '🏆', label: 'Top Yayıncı',   aktif: yayinci.puan >= 5 },
              { emoji: '✅', label: 'Doğrulandı',    aktif: false },
            ].map(({ emoji, label, aktif }) => (
              <div
                key={label}
                className={[
                  'flex flex-col items-center gap-2 p-4 rounded-[12px] border transition-all',
                  aktif
                    ? 'bg-[rgba(201,168,76,0.08)] border-[rgba(201,168,76,0.2)] pulse-border-gold'
                    : 'bg-[#111111] border-[rgba(255,255,255,0.04)] opacity-35',
                ].join(' ')}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="db-etiket text-[#A09080] text-center">{label}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
