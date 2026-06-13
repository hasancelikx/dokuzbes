'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, User, MessageSquare, Crown, Compass, Bell, Trophy } from 'lucide-react'
import { DBGoldBadge } from '@/components/ui/DBGoldBadge'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { useAuth } from '@/hooks/useAuth'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { Logo } from '@/components/layout/Logo'
import { BildirimZili } from '@/components/ui/BildirimZili'
import { useBildirimler } from '@/hooks/useBildirimler'

interface NavItem {
  href: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  aktif: boolean
  badge?: number
  yakinda?: boolean
  premium?: boolean
}

const navItems: NavItem[] = [
  { href: '/salon',       icon: Home,          label: 'Salon',       aktif: true                },
  { href: '/kesfet',      icon: Compass,       label: 'Keşfet',      aktif: true                },
  { href: '/bildirimler', icon: Bell,          label: 'Bildirimler', aktif: true, badge: 0      },
  { href: '/mesajlar',    icon: MessageSquare, label: 'Mesajlar',    aktif: true, badge: 0      },
  { href: '/gold',        icon: Crown,         label: 'Gold',        aktif: true, premium: true },
  { href: '/siralama',    icon: Trophy,        label: 'Sıralama',    aktif: true                },
  { href: '/hesabim',     icon: User,          label: 'Profil',      aktif: true                },
]

const mobileNav = navItems.filter(i =>
  ['salon', 'kesfet', 'gold', 'mesajlar', 'hesabim'].some(k => i.href.includes(k))
)

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { kullanici, yukleniyor } = useAuth()
  const pathname = usePathname()
  const { okunmamis } = useBildirimler()

  if (yukleniyor) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <DBLoadingSpinner size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen mesh-bg flex">

      {/* ── Sol Sidebar ── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[275px] z-40"
        style={{
          background: 'linear-gradient(180deg, rgba(8,8,14,0.97) 0%, rgba(5,5,10,0.99) 100%)',
          backdropFilter: 'blur(32px) saturate(160%)',
          WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          borderRight: '1px solid rgba(201,168,76,0.1)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Ambient orb — logo arkası */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)',
            transform: 'translate(-30%, -30%)',
          }} />
        <div className="absolute bottom-1/3 left-0 w-48 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,26,42,0.06) 0%, transparent 70%)' }} />

        {/* Logo bölümü */}
        <div className="relative z-10 px-5 pt-6 pb-5">
          <Logo variant="sidebar" />
          <div className="mt-5 gold-divider" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1 relative z-10 px-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {navItems.map(({ href, icon: Icon, label, aktif, premium }) => {
            const secili = pathname === href || pathname.startsWith(href + '/')
            const badge = href === '/bildirimler' ? okunmamis : 0

            if (!aktif) {
              return (
                <div key={href} className="flex items-center gap-3 px-4 py-2.5 rounded-xl opacity-20 cursor-not-allowed">
                  <Icon size={18} strokeWidth={1.6} className="text-[#5A5050]" />
                  <span className="text-[14px] font-medium text-[#5A5050]">{label}</span>
                </div>
              )
            }

            return (
              <Link key={href} href={href} className="relative group">
                {secili && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl sidebar-nav-active"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <div className={[
                  'relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150',
                  secili
                    ? 'text-[#C9A84C]'
                    : premium
                      ? 'text-[#C9A84C]/50 hover:text-[#C9A84C]/80 hover:bg-[rgba(201,168,76,0.04)]'
                      : 'text-[#5A5050] hover:text-[#D0C8BC] hover:bg-white/[0.03]',
                ].join(' ')}>
                  <span style={secili ? { filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.5))' } : undefined}>
                    <Icon size={18} strokeWidth={secili ? 2.3 : premium ? 1.8 : 1.6} />
                  </span>
                  <span className="text-[14px] font-medium">{label}</span>
                  {premium && !secili && (
                    <span className="ml-auto text-[8px] font-black tracking-[0.15em] text-[#C9A84C]/40 uppercase">vip</span>
                  )}
                  {badge !== undefined && badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto min-w-[18px] h-[18px] bg-[#8B1A2A] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                    >
                      {badge}
                    </motion.span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Kullanıcı bölümü */}
        <div className="relative z-10 px-4 pt-4 pb-5">
          <div className="gold-divider mb-4" />

          {kullanici && (
            <div className="rounded-2xl p-3 flex flex-col gap-2.5"
              style={{
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.12)',
              }}>
              {/* Gold bakiye */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] text-[#5A5050] font-bold tracking-[0.18em] uppercase">Bakiye</span>
                <DBGoldBadge amount={kullanici.gold} size="sm" />
              </div>

              {/* Kullanıcı satırı */}
              <div className="flex items-center gap-2.5">
                <DBAvatar src={kullanici?.avatarUrl || null} initials={kullanici?.nickname || '?'} size={34} status="online" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#D0C8BC] font-semibold truncate">{kullanici?.nickname || ''}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" style={{ boxShadow: '0 0 4px #4CAF5080' }} />
                    <span className="text-[10px] text-[#5A5050]">Çevrimiçi</span>
                  </div>
                </div>
                <BildirimZili />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Merkez içerik — page-safe-pad safe area'yı otomatik yönetir */}
      <main className="flex-1 min-w-0 overflow-x-hidden md:ml-[275px] xl:mr-[350px] page-safe-pad md:pb-0"
        style={{ borderRight: '1px solid rgba(201,168,76,0.06)' }}>
        {/* Sayfalar arası geçiş animasyonu kaldırıldı — anlık, snappy navigasyon */}
        <div className="w-full">{children}</div>
      </main>

      {/* Sağ Sidebar */}
      <RightSidebar />

      {/* ── Mobil Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.7)' }}>
        {/* Gold şerit — tüm nav genişliğinde */}
        <div className="h-[1.5px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(201,168,76,0.55) 30%, rgba(201,168,76,0.75) 50%, rgba(201,168,76,0.55) 70%, transparent 95%)' }} />

        {/* Nav body + safe area */}
        <div
          style={{
            background: 'rgba(5,5,9,0.97)',
            backdropFilter: 'blur(48px) saturate(220%)',
            WebkitBackdropFilter: 'blur(48px) saturate(220%)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
          <div className="flex mob-nav-inner">
          {mobileNav.map(({ href, icon: Icon, label, premium }) => {
            const secili = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-[3px] relative"
              >
                {/* Aktif üst çizgi — per-item, kayıyor */}
                {secili && (
                  <motion.div
                    layoutId="mob-top-line"
                    className="absolute top-0 left-2 right-2 h-[2px] rounded-b-full"
                    style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }}
                    transition={{ type: 'spring', stiffness: 440, damping: 36 }}
                  />
                )}

                {/* İkon kutusu */}
                <div className="relative flex items-center justify-center" style={{ width: 44, height: 36 }}>
                  {/* Aktif kutu arka planı */}
                  {secili && (
                    <motion.div
                      layoutId="mob-icon-pill"
                      className="absolute inset-0 rounded-[11px] mobile-nav-active-pill"
                      transition={{ type: 'spring', stiffness: 440, damping: 36 }}
                    />
                  )}

                  <motion.span
                    className="relative z-10"
                    animate={secili ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={secili ? { filter: 'drop-shadow(0 0 7px rgba(201,168,76,0.65))' } : undefined}
                  >
                    <Icon
                      size={secili ? 22 : 19}
                      strokeWidth={secili ? 2.2 : 1.5}
                      className={secili
                        ? 'text-[#C9A84C]'
                        : premium ? 'text-[#C9A84C]/28' : 'text-[#42404C]'
                      }
                    />
                  </motion.span>
                </div>

                {/* Label */}
                <span
                  className={[
                    'relative z-10 text-[9px] tracking-[0.04em] transition-all duration-200',
                    secili
                      ? 'text-[#C9A84C]'
                      : premium ? 'text-[#C9A84C]/40' : 'text-[#4A4455]',
                  ].join(' ')}
                >
                  {label}
                </span>
              </Link>
            )
          })}
          </div>
        </div>
      </nav>
    </div>
  )
}
