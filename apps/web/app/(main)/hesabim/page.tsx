'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Edit2, LogOut, Settings, Shield, Bell, MapPin, Calendar,
  Crown, Star, Wallet, ChevronRight, Phone, PhoneOff,
  BarChart2, Gift, ExternalLink, UserCheck, Mic2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import type { DBUser } from '@/types/user'
import { api, ApiError } from '@/lib/apiClient'
import { cikisYap } from '@/lib/firebase/auth'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { DBGoldBadge } from '@/components/ui/DBGoldBadge'
import { toast } from 'sonner'

/* ─── Tipler ──────────────────────────────────────── */
interface BekleyenMasa {
  id: string; tur: 'kisa' | 'uzun' | 'ozel'; goldMaliyet: number; createdAt: string
  musteri: { nickname: string | null; avatarUrl: string | null; vipLevel: number | null }
}
interface PerformerBilgi {
  id: string; stageName: string; bio: string | null; category: string | null
  city: string | null; durum: string; toplamHediye: number; toplamGorusme: number
  aktifIzleyici: number; puan: number; vipSeviye: number
}

/* ─── Yardımcı ──────────────────────────────────────── */
const MASA_TUR_SURE: Record<string, string> = { kisa: '15 dk', uzun: '45 dk', ozel: 'Özel' }

function Avatar({ src, initials, size = 80, editHref }: { src?: string | null; initials: string; size?: number; editHref?: string }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full bg-[#1A1A1A] border-2 border-[rgba(201,168,76,0.3)] flex items-center justify-center overflow-hidden">
        {src
          ? <img src={src} alt={initials} className="w-full h-full object-cover" />
          : <span className="text-[#C9A84C] font-bold" style={{ fontSize: size * 0.28 }}>{initials.slice(0, 2).toUpperCase()}</span>
        }
      </div>
      {editHref && (
        <Link href={editHref} className="absolute bottom-0 right-0 w-6 h-6 bg-[#C9A84C] rounded-full flex items-center justify-center">
          <Edit2 size={11} className="text-black" />
        </Link>
      )}
    </div>
  )
}

function TabBar({ tabs, aktif, onChange }: { tabs: { id: string; label: string }[]; aktif: string; onChange: (id: string) => void }) {
  return (
    <div className="flex bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-xl p-1 gap-1">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={['flex-1 py-2 rounded-lg text-xs font-medium transition-all',
            aktif === t.id
              ? 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.25)]'
              : 'text-[#5A5050] hover:text-[#A09080]'].join(' ')}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function MenuGrubu({ baslik, items }: { baslik?: string; items: { icon: React.ElementType; label: string; aciklama?: string; href?: string; onClick?: () => void; tehlikeli?: boolean }[] }) {
  return (
    <div className="bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-2xl overflow-hidden">
      {baslik && <p className="text-[10px] font-semibold text-[#5A5050] tracking-widest uppercase px-5 pt-4 pb-2">{baslik}</p>}
      {items.map(({ icon: Icon, label, aciklama, href, onClick, tehlikeli }, i) => {
        const cls = ['flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#1A1A1A]',
          i < items.length - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : '',
          tehlikeli ? 'text-red-400' : 'text-[#F0EDE8]'].join(' ')
        const inner = (
          <>
            <div className={['w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 border',
              tehlikeli ? 'bg-red-500/8 border-red-500/15' : 'bg-[#1A1A1A] border-[rgba(255,255,255,0.06)]'].join(' ')}>
              <Icon size={16} className={tehlikeli ? 'text-red-400' : 'text-[#A09080]'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{label}</p>
              {aciklama && <p className="text-xs text-[#5A5050] mt-0.5">{aciklama}</p>}
            </div>
            <ChevronRight size={14} className="text-[#3A3030] shrink-0" />
          </>
        )
        return href
          ? <Link key={label} href={href} className={cls}>{inner}</Link>
          : <button key={label} onClick={onClick} className={cls + ' w-full text-left'}>{inner}</button>
      })}
    </div>
  )
}

/* ─── Sekmeler ──────────────────────────────────────── */

function ProfilSekmesi({ kullanici, onCikis }: { kullanici: DBUser; onCikis: () => void }) {
  const kayitTarihi = kullanici.createdAt
    ? new Date(kullanici.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="space-y-3">
      {/* İstatistik satırı */}
      <div className="bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-2xl p-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Toplam Harcanan',   value: kullanici.totalSpent?.toLocaleString('tr-TR') ?? '0', suffix: '🪙' },
            { label: 'VIP Seviye',         value: `VIP ${kullanici.vipLevel ?? 1}`,                   suffix: ''   },
            { label: 'Üyelik',             value: kayitTarihi ?? '—',                                 suffix: ''   },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="text-center">
              <p className="text-white font-bold text-sm">{value} {suffix}</p>
              <p className="text-[10px] text-[#5A5050] mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meta bilgi */}
      <div className="bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-2xl px-5 py-4 flex flex-col gap-2">
        {kullanici.city && (
          <div className="flex items-center gap-2 text-sm text-[#A09080]">
            <MapPin size={13} className="text-[#5A5050]" />{kullanici.city}
          </div>
        )}
        {kayitTarihi && (
          <div className="flex items-center gap-2 text-sm text-[#A09080]">
            <Calendar size={13} className="text-[#5A5050]" />{kayitTarihi}'dan beri üye
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-[#A09080]">
          <UserCheck size={13} className="text-[#5A5050]" />
          <span className="capitalize">{kullanici.role === 'customer' ? 'Müşteri' : kullanici.role === 'performer' ? 'Yayıncı' : 'Admin'}</span>
        </div>
      </div>

      {/* Yayıncı Ol (sadece customer) */}
      {kullanici.role === 'customer' && (
        <Link href="/yayinci-ol">
          <div className="flex items-center gap-4 bg-[#111111] border border-[rgba(201,168,76,0.2)] rounded-2xl px-5 py-4 hover:bg-[#1A1A1A] hover:border-[rgba(201,168,76,0.35)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[rgba(201,168,76,0.1)] flex items-center justify-center shrink-0">
              <Mic2 size={18} className="text-[#C9A84C]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#C9A84C]">Yayıncı Ol</p>
              <p className="text-xs text-[#5A5050]">Başvur, onaylanınca yayına başla</p>
            </div>
            <ChevronRight size={14} className="text-[#C9A84C]" />
          </div>
        </Link>
      )}

      {/* Admin linki */}
      {kullanici.role === 'admin' && (
        <Link href="/admin">
          <div className="flex items-center gap-4 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.25)] rounded-2xl px-5 py-4 hover:bg-[rgba(201,168,76,0.1)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[rgba(201,168,76,0.1)] flex items-center justify-center shrink-0">
              <Shield size={18} className="text-[#C9A84C]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#C9A84C]">Yönetim Paneli</p>
              <p className="text-xs text-[#5A5050]">Kullanıcılar, başvurular, çekimler</p>
            </div>
            <ExternalLink size={14} className="text-[#C9A84C]" />
          </div>
        </Link>
      )}

      <MenuGrubu baslik="Hesap Ayarları" items={[
        { icon: Edit2,   label: 'Profil Bilgileri',  aciklama: 'İsim, şehir ve biyografi',    href: '/hesabim/duzenle'     },
        { icon: Shield,  label: 'Güvenlik',           aciklama: 'Şifre ve hesap güvenliği',    href: '/hesabim/guvenlik'    },
        { icon: Bell,    label: 'Bildirimler',        aciklama: 'Bildirim tercihlerini yönet', href: '/hesabim/bildirimler' },
        { icon: Settings,label: 'Uygulama Ayarları',  aciklama: 'Tema, dil ve görünüm',        href: '/hesabim/ayarlar'    },
      ]} />

      <button onClick={onCikis}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/8 transition-colors">
        <LogOut size={15} />Çıkış Yap
      </button>
    </div>
  )
}

/* Performer Panel Sekmesi */
function PanelSekmesi({ performerBilgi }: { performerBilgi: PerformerBilgi | null }) {
  const router = useRouter()
  const kullanici = useAuthStore((s) => s.kullanici)
  const [masalar, setMasalar] = useState<BekleyenMasa[]>([])
  const [islemId, setIslemId] = useState<string | null>(null)

  const masaCek = useCallback(async () => {
    try {
      const d = await api.mesa.get<{ masalar: BekleyenMasa[] }>('/mesa/bekleyen')
      setMasalar(d.masalar)
    } catch { }
  }, [])

  useEffect(() => {
    masaCek()
    const t = setInterval(masaCek, 5000)
    return () => clearInterval(t)
  }, [masaCek])

  async function kabul(id: string) {
    setIslemId(id)
    try {
      await api.mesa.post(`/mesa/${id}/kabul`)
      router.push(`/masa/${id}`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Hata')
    } finally { setIslemId(null) }
  }

  async function reddet(id: string) {
    setIslemId(id)
    try {
      await api.mesa.post(`/mesa/${id}/red`)
      setMasalar(p => p.filter(m => m.id !== id))
      toast.success('Masa reddedildi')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Hata')
    } finally { setIslemId(null) }
  }

  return (
    <div className="space-y-3">
      {/* İstatistikler */}
      {performerBilgi && (
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Toplam Hediye',    value: performerBilgi.toplamHediye.toLocaleString('tr-TR'),   ikon: Gift },
            { label: 'Toplam Görüşme',   value: performerBilgi.toplamGorusme.toLocaleString('tr-TR'),  ikon: BarChart2 },
            { label: 'Aktif İzleyici',   value: performerBilgi.aktifIzleyici.toLocaleString('tr-TR'),  ikon: Star },
            { label: 'Puan',             value: performerBilgi.puan.toFixed(1),                        ikon: Star },
          ].map(({ label, value, ikon: Ikon }) => (
            <div key={label} className="bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-[#5A5050]">{label}</p>
                <Ikon size={13} className="text-[#3A3030]" />
              </div>
              <p className="text-white font-bold text-lg">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bekleyen masalar */}
      <div className="bg-[#111111] border border-[rgba(201,168,76,0.12)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <p className="text-[10px] font-semibold text-[#5A5050] tracking-widest uppercase">Bekleyen Masalar</p>
          {masalar.length > 0 && (
            <span className="text-xs font-bold text-[#C9A84C] bg-[rgba(201,168,76,0.12)] px-2 py-0.5 rounded-full">
              {masalar.length}
            </span>
          )}
        </div>
        {masalar.length === 0 ? (
          <p className="text-sm text-[#5A5050] px-4 pb-4">Bekleyen masa isteği yok</p>
        ) : masalar.map((m, i) => (
          <div key={m.id} className={['flex items-center gap-3 px-4 py-3.5',
            i < masalar.length - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : ''].join(' ')}>
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-sm font-bold text-[#C9A84C] shrink-0">
              {(m.musteri.nickname ?? '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{m.musteri.nickname ?? 'Misafir'}
                {(m.musteri.vipLevel ?? 1) >= 2 && <span className="ml-1.5 text-xs text-[#C9A84C]">VIP{m.musteri.vipLevel}</span>}
              </p>
              <p className="text-xs text-[#5A5050]">{m.tur} · {MASA_TUR_SURE[m.tur]} · {m.goldMaliyet} 🪙</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => reddet(m.id)} disabled={islemId === m.id}
                className="p-2 rounded-xl bg-[rgba(139,26,42,0.2)] text-red-400 hover:bg-[rgba(139,26,42,0.35)] disabled:opacity-50 transition-colors">
                <PhoneOff size={15} />
              </button>
              <button onClick={() => kabul(m.id)} disabled={islemId === m.id}
                className="p-2 rounded-xl bg-[rgba(76,175,80,0.2)] text-green-400 hover:bg-[rgba(76,175,80,0.35)] disabled:opacity-50 transition-colors">
                {islemId === m.id
                  ? <span className="w-4 h-4 block border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  : <Phone size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Performer Kazanç Sekmesi */
function KazancSekmesi({ performerBilgi }: { performerBilgi: PerformerBilgi | null }) {
  return (
    <div className="space-y-3">
      {performerBilgi && (
        <div className="bg-[rgba(201,168,76,0.07)] border border-[rgba(201,168,76,0.2)] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#5A5050] mb-1">Toplam Alınan Hediye</p>
            <p className="text-3xl font-bold text-[#C9A84C]">{performerBilgi.toplamHediye.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-[#5A5050] mt-0.5">gold</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#5A5050] mb-1">TL Karşılığı</p>
            <p className="text-xl font-semibold text-white">₺{(performerBilgi.toplamHediye * 0.1).toFixed(2)}</p>
          </div>
        </div>
      )}

      <MenuGrubu items={[
        { icon: Wallet, label: 'Gold Çekimi', aciklama: 'IBAN\'ına para çek', href: '/yayinci-paneli/cekim' },
      ]} />

      <div className="bg-[#111111] border border-[rgba(201,168,76,0.08)] rounded-2xl p-4">
        <p className="text-[10px] font-semibold text-[#5A5050] tracking-widest uppercase mb-3">Kur Bilgisi</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#A09080]">1 gold</span>
          <span className="text-white font-semibold">= ₺0.10</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-[#A09080]">Min. çekim</span>
          <span className="text-white font-semibold">500 gold (₺50)</span>
        </div>
      </div>
    </div>
  )
}

/* Customer Gold Sekmesi */
function GoldSekmesi({ gold }: { gold: number }) {
  return (
    <div className="space-y-3">
      <div className="bg-[rgba(201,168,76,0.07)] border border-[rgba(201,168,76,0.2)] rounded-2xl p-5">
        <p className="text-xs text-[#5A5050] mb-1">Mevcut Bakiye</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-[#C9A84C]">{gold.toLocaleString('tr-TR')}</span>
          <span className="text-lg">🪙</span>
        </div>
      </div>

      <MenuGrubu items={[
        { icon: Crown,    label: 'Gold Satın Al',    aciklama: 'Paketler ve fiyatlar',      href: '/gold'          },
        { icon: BarChart2,label: 'Harcama Geçmişi',  aciklama: 'Tüm gold işlemlerin',       href: '/hesabim/gecmis' },
      ]} />
    </div>
  )
}

/* ─── Ana sayfa ──────────────────────────────────────── */
export default function HesabimPage() {
  const { kullanici, yukleniyor } = useAuth()
  const router = useRouter()
  const [aktifTab, setAktifTab] = useState('profil')
  const [cikisYapiliyor, setCikisYapiliyor] = useState(false)
  const [performerBilgi, setPerformerBilgi] = useState<PerformerBilgi | null>(null)

  useEffect(() => {
    if (kullanici?.role === 'performer') {
      api.performer.get<PerformerBilgi>('/performers/me').catch(() => null).then(d => d && setPerformerBilgi(d))
    }
  }, [kullanici?.role])

  async function handleCikis() {
    setCikisYapiliyor(true)
    try { await cikisYap(); router.replace('/giris') }
    catch { toast.error('Çıkış yapılamadı'); setCikisYapiliyor(false) }
  }

  if (yukleniyor) {
    return <div className="flex items-center justify-center py-32"><DBLoadingSpinner size={40} /></div>
  }
  if (!kullanici) return null

  const tabs =
    kullanici.role === 'performer' ? [
      { id: 'profil',  label: 'Profil'  },
      { id: 'panel',   label: 'Yayın'   },
      { id: 'kazanc',  label: 'Kazanç'  },
    ] : kullanici.role === 'admin' ? [
      { id: 'profil',  label: 'Profil'  },
    ] : [
      { id: 'profil',  label: 'Profil'  },
      { id: 'gold',    label: 'Gold'    },
    ]

  const displayName = kullanici.role === 'performer' && performerBilgi
    ? performerBilgi.stageName
    : (kullanici.nickname ?? '')

  const roleBadge =
    kullanici.role === 'performer' ? { label: 'Yayıncı', cls: 'text-[#C9A84C] bg-[rgba(201,168,76,0.12)] border-[rgba(201,168,76,0.25)]' }
    : kullanici.role === 'admin'   ? { label: 'Admin',    cls: 'text-purple-400 bg-purple-400/10 border-purple-400/25' }
    : null

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

      {/* ── Profil başlığı ── */}
      <div className="bg-[#111111] border border-[rgba(201,168,76,0.1)] rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <Avatar
            src={kullanici.avatarUrl}
            initials={displayName || '?'}
            size={72}
            editHref="/hesabim/duzenle"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white font-bold text-lg leading-tight">{displayName}</h1>
              {roleBadge && (
                <span className={['text-[10px] font-semibold px-2 py-0.5 rounded-full border', roleBadge.cls].join(' ')}>
                  {roleBadge.label}
                </span>
              )}
              {(kullanici.vipLevel ?? 1) >= 2 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-[#C9A84C] bg-[rgba(201,168,76,0.12)] border-[rgba(201,168,76,0.25)]">
                  👑 VIP {kullanici.vipLevel}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A5050] mt-0.5">@{kullanici.nickname}</p>
            {kullanici.role === 'performer' && performerBilgi?.puan && performerBilgi.puan > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={10} fill={i < Math.floor(performerBilgi.puan) ? '#C9A84C' : 'none'} className={i < Math.floor(performerBilgi.puan) ? 'text-[#C9A84C]' : 'text-[#3A3030]'} />
                ))}
                <span className="text-xs text-[#C9A84C] ml-0.5">{performerBilgi.puan.toFixed(1)}</span>
              </div>
            )}
            <div className="mt-2">
              <DBGoldBadge amount={kullanici.gold} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      {tabs.length > 1 && <TabBar tabs={tabs} aktif={aktifTab} onChange={setAktifTab} />}

      {/* ── Tab içeriği ── */}
      {aktifTab === 'profil' && <ProfilSekmesi kullanici={kullanici} onCikis={handleCikis} />}
      {aktifTab === 'panel'  && <PanelSekmesi performerBilgi={performerBilgi} />}
      {aktifTab === 'kazanc' && <KazancSekmesi performerBilgi={performerBilgi} />}
      {aktifTab === 'gold'   && <GoldSekmesi gold={kullanici.gold} />}

    </div>
  )
}
