'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, MessageSquare, Crown, Compass, Bell, Trophy } from 'lucide-react'
import { DBGoldBadge } from '@/components/ui/DBGoldBadge'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { useAuth } from '@/hooks/useAuth'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { Logo } from '@/components/layout/Logo'
import { BildirimZili } from '@/components/ui/BildirimZili'

interface NavItem {
  href: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  aktif: boolean
  badge?: number
  yakinda?: boolean
}

const navItems: NavItem[] = [
  { href: '/salon',       icon: Home,          label: 'Salon',       aktif: true       },
  { href: '/kesfet',      icon: Compass,       label: 'Keşfet',      aktif: true       },
  { href: '/bildirimler', icon: Bell,          label: 'Bildirimler', aktif: true, badge: 0 },
  { href: '/mesajlar',    icon: MessageSquare, label: 'Mesajlar',    aktif: true, badge: 0 },
  { href: '/gold',        icon: Crown,         label: 'Gold',        aktif: true       },
  { href: '/siralama',    icon: Trophy,        label: 'Sıralama',    aktif: true       },
  { href: '/hesabim',     icon: User,          label: 'Profil',      aktif: true       },
]

const mobileNav = navItems.filter(i =>
  ['kesfet', 'gold', 'siralama', 'hesabim'].some(k => i.href.includes(k))
)

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { kullanici, yukleniyor } = useAuth()
  const pathname = usePathname()

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <DBLoadingSpinner size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">

      {/* Sol Sidebar — 275px */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[275px] border-r border-[rgba(201,168,76,0.08)] bg-[#0A0A0A] px-4 py-6 z-40">

        {/* Logo */}
        <Logo variant="sidebar" className="mb-8 px-1" />

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(({ href, icon: Icon, label, aktif, badge, yakinda }) => {
            const secili = pathname === href || pathname.startsWith(href + '/')

            if (!aktif) {
              return (
                <div
                  key={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] opacity-30 cursor-not-allowed"
                >
                  <Icon size={20} strokeWidth={1.8} className="text-[#5A5050]" />
                  <span className="db-govde font-medium text-[#5A5050]">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] bg-[#8B1A2A] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                  {yakinda && badge === undefined && (
                    <span className="ml-auto text-[9px] text-[#3A3030] font-medium tracking-wide uppercase">yakında</span>
                  )}
                  {yakinda && badge !== undefined && badge === 0 && (
                    <span className="ml-auto text-[9px] text-[#3A3030] font-medium tracking-wide uppercase">yakında</span>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-150',
                  secili
                    ? 'bg-[rgba(201,168,76,0.1)] text-[#C9A84C]'
                    : 'text-[#5A5050] hover:text-[#F0EDE8] hover:bg-[#111111]',
                ].join(' ')}
              >
                <Icon size={20} strokeWidth={secili ? 2.5 : 1.8} />
                <span className="db-govde font-medium">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] bg-[#8B1A2A] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Kullanıcı bilgisi */}
        <div className="flex flex-col gap-3 border-t border-[rgba(201,168,76,0.08)] pt-4 px-1">
          {kullanici && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#C9A84C] font-semibold tracking-wide uppercase">Gold</span>
              <DBGoldBadge amount={kullanici.gold} size="sm" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <DBAvatar
              src={kullanici?.avatarUrl || null}
              initials={kullanici?.nickname || '?'}
              size={34}
              status="online"
            />
            <span className="db-kucuk text-[#A09080] truncate flex-1">
              {kullanici?.nickname || ''}
            </span>
            <BildirimZili />
          </div>
        </div>
      </aside>

      {/* Merkez içerik */}
      <main className="flex-1 md:ml-[275px] xl:mr-[350px] pb-[53px] md:pb-0 border-r border-[rgba(201,168,76,0.06)]">
        {children}
      </main>

      {/* Sağ Sidebar */}
      <RightSidebar />

      {/* Mobil Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[53px] bg-[#111111] border-t border-[rgba(201,168,76,0.12)] flex z-40">
        {mobileNav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors duration-150',
              pathname === href ? 'text-[#C9A84C]' : 'text-[#5A5050]',
            ].join(' ')}
          >
            <Icon size={20} />
            <span className="text-[9px] font-medium tracking-wide">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
