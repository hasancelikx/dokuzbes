'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Radio, Gift, UserPlus, Megaphone, Trash2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { useBildirimler, Bildirim } from '@/hooks/useBildirimler'

/* ── Tip → görsel config ─────────────────────────────────── */
type UiTip = 'canli' | 'hediye' | 'takip' | 'sistem' | 'masa'

const TIP_CONFIG: Record<UiTip, {
  bg: string; border: string; iconBg: string; icon: React.ElementType; iconColor: string
}> = {
  canli:  { bg: 'rgba(139,26,42,0.08)',  border: 'rgba(139,26,42,0.3)',  iconBg: 'rgba(139,26,42,0.2)',  icon: Radio,     iconColor: '#FF4444' },
  hediye: { bg: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.2)', iconBg: 'rgba(201,168,76,0.15)',icon: Gift,      iconColor: '#C9A84C' },
  takip:  { bg: 'rgba(76,175,80,0.05)',  border: 'rgba(76,175,80,0.18)', iconBg: 'rgba(76,175,80,0.15)', icon: UserPlus,  iconColor: '#4CAF50' },
  sistem: { bg: 'rgba(255,152,0,0.05)',  border: 'rgba(255,152,0,0.18)', iconBg: 'rgba(255,152,0,0.12)', icon: Megaphone, iconColor: '#FF9800' },
  masa:   { bg: 'rgba(91,140,255,0.05)', border: 'rgba(91,140,255,0.18)',iconBg: 'rgba(91,140,255,0.12)',icon: Radio,     iconColor: '#5B8CFF' },
}

/* Servis tipi → UI tipi dönüşümü */
function uiTip(tip: string): UiTip {
  if (tip === 'HEDIYE_ALINDI' || tip === 'hediye')           return 'hediye'
  if (tip === 'MASA_KABUL' || tip === 'MASA_RED' || tip === 'masa') return 'masa'
  if (tip === 'canli')                                        return 'canli'
  if (tip === 'takip')                                        return 'takip'
  return 'sistem'
}

/* Servis tipi → buton metni */
function butonMetni(tip: string): string {
  const MAP: Record<string, string> = {
    MASA_KABUL:         'Masaya Git',
    MASA_RED:           'Salona Dön',
    HEDIYE_ALINDI:      'Geçmişe Git',
    GOLD_YUKLENDI:      'Geçmişe Git',
    BASVURU_ONAYLANDI:  'Panele Git',
    BASVURU_REDDEDILDI: 'Başvur',
    canli:              'Katıl',
    hediye:             'Geçmişe Git',
    takip:              'Profil',
    sistem:             'İncele',
  }
  return MAP[tip] ?? 'Gör'
}

/* Bildirim tipi → navigasyon hedefi */
function hedef(b: Bildirim): string {
  const veri = b.veri as Record<string, string> | null
  switch (b.tip) {
    case 'MASA_KABUL':         return `/masa/${veri?.masaId ?? ''}`
    case 'MASA_RED':           return '/salon'
    case 'HEDIYE_ALINDI':      return '/hesabim/gecmis'
    case 'GOLD_YUKLENDI':      return '/hesabim/gecmis'
    case 'BASVURU_ONAYLANDI':  return '/hesabim'
    case 'BASVURU_REDDEDILDI': return '/yayinci-ol'
    case 'canli':              return '/salon'
    case 'hediye':             return '/hesabim/gecmis'
    case 'takip':              return '/salon'
    case 'sistem':             return '/gold'
    default:                   return '/bildirimler'
  }
}

/* Göreli zaman */
function gorelliZaman(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const dk = Math.floor(diff / 60000)
  if (dk < 1)  return 'Az önce'
  if (dk < 60) return `${dk} dk önce`
  const sa = Math.floor(dk / 60)
  if (sa < 24) return `${sa} saat önce`
  return `${Math.floor(sa / 24)} gün önce`
}

export default function BildirimlerPage() {
  useAuth()
  const router = useRouter()
  const { bildirimler, okunmamis, tumunuOku, bildirimOku, bildirimSil } = useBildirimler()

  const yukleniyor = bildirimler.length === 0 && okunmamis === 0

  function tikla(b: Bildirim) {
    if (!b.okundu) bildirimOku(b.id).catch(() => {})
    const url = hedef(b)
    if (url) router.push(url)
  }

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-[600px] mx-auto px-4 pt-6 pb-10">

        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell size={21} className="text-[#F0EDE8]" />
              <AnimatePresence>
                {okunmamis > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#8B1A2A] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  >
                    {okunmamis > 9 ? '9+' : okunmamis}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <h1 className="text-[#F0EDE8] font-bold text-xl"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Bildirimler
            </h1>
            {okunmamis > 0 && (
              <span className="text-[11px] text-[#5A5050]">{okunmamis} yeni</span>
            )}
          </div>

          {okunmamis > 0 && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => tumunuOku()}
              className="flex items-center gap-1.5 text-[11px] text-[#C9A84C] hover:text-[#E0C070] transition-colors"
            >
              <CheckCheck size={13} />
              Tümünü oku
            </motion.button>
          )}
        </motion.div>

        {/* Liste */}
        {yukleniyor ? (
          <div className="flex justify-center py-16">
            <DBLoadingSpinner size={36} />
          </div>
        ) : bildirimler.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-20"
          >
            <Bell size={36} className="text-white/10" />
            <p className="text-white/20 text-sm">Henüz bildirim yok</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            {bildirimler.map((b, i) => {
              const tip = uiTip(b.tip)
              const cfg = TIP_CONFIG[tip]
              const Icon = cfg.icon
              const zaman = b.createdAt ? gorelliZaman(b.createdAt) : ''
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.04, ease: 'easeOut', duration: 0.24 }}
                  className="flex items-center gap-3.5 rounded-2xl p-4 transition-opacity group cursor-pointer"
                  style={{
                    background: b.okundu ? 'rgba(255,255,255,0.02)' : cfg.bg,
                    border: `1px solid ${b.okundu ? 'rgba(255,255,255,0.05)' : cfg.border}`,
                    opacity: b.okundu ? 0.6 : 1,
                  }}
                  onClick={() => tikla(b)}
                >
                  {/* Avatar + tip ikonu */}
                  <div className="relative shrink-0">
                    <DBAvatar src={null} initials={b.baslik ?? '?'} size={44} />
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: cfg.iconBg, border: '1.5px solid rgba(0,0,0,0.6)' }}
                    >
                      <Icon size={11} style={{ color: cfg.iconColor }} />
                    </div>
                  </div>

                  {/* Metin */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#F0EDE8] leading-snug font-semibold truncate">
                      {b.baslik}
                    </p>
                    <p className="text-[12px] text-[#A09080] mt-0.5 leading-snug line-clamp-2">
                      {b.metin}
                    </p>
                    <p className="text-[10px] text-[#5A5050] mt-1">{zaman}</p>
                  </div>

                  {/* Aksiyon */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span
                      className="text-[11px] font-bold px-3 h-7 rounded-xl flex items-center gap-1 transition-all"
                      style={{
                        background: cfg.iconBg,
                        color: cfg.iconColor,
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      {butonMetni(b.tip)}
                      <ArrowRight size={9} />
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); bildirimSil(b.id).catch(() => {}) }}
                      className="w-7 h-7 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                      title="Sil"
                    >
                      <Trash2 size={12} className="text-[#5A5050]" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
