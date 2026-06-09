'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { LayoutDashboard, Users, UserCheck, Mic2, LogOut, Wallet, Menu, X, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/admin',              label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: Users           },
  { href: '/admin/basvurular',   label: 'Başvurular',  icon: UserCheck       },
  { href: '/admin/performerlar', label: 'Performerlar', icon: Mic2            },
  { href: '/admin/cekimler',     label: 'Çekimler',    icon: Wallet          },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { kullanici, yukleniyor } = useAuthStore()
  const router   = useRouter()
  const pathname = usePathname()
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    if (yukleniyor) return
    if (!kullanici) { router.replace('/giris'); return }
    if (kullanici.role !== 'admin') router.replace('/salon')
  }, [kullanici, yukleniyor, router])

  // Drawer'ı sayfa değişince kapat
  useEffect(() => { setDrawer(false) }, [pathname])

  if (yukleniyor || !kullanici || kullanici.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Yetki kontrol ediliyor...</p>
      </div>
    )
  }

  const aktifSayfa = navItems.find(n => n.href === pathname)?.label ?? 'Admin'

  return (
    <div className="min-h-screen bg-[#050508] flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 flex-col fixed left-0 top-0 h-screen"
        style={{ background: 'rgba(10,10,16,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-5 border-b border-white/[0.06]">
          <span className="text-[#C9A84C] font-bold text-lg tracking-wide">DokuzBeş</span>
          <p className="text-[11px] text-white/25 mt-0.5">Yönetim Paneli</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                    : 'text-white/35 hover:text-white/80 hover:bg-white/[0.04]'
                }`}>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#C9A84C]" />
                )}
                <Icon size={15} strokeWidth={active ? 2.2 : 1.6} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="px-3 py-2 text-[11px] text-white/20 truncate">{kullanici.email}</div>
          <button onClick={() => router.push('/salon')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/70 hover:bg-white/[0.04] w-full transition-all">
            <LogOut size={15} />
            Ana Sayfaya Dön
          </button>
        </div>
      </aside>

      {/* ── Mobil Top Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setDrawer(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Menu size={18} className="text-white/70" />
          </button>
          <div>
            <span className="text-[#C9A84C] font-bold text-[13px] tracking-wide">Admin</span>
            <p className="text-[#F0EDE8]/70 text-[11px] leading-none font-medium">{aktifSayfa}</p>
          </div>
        </div>
        <button onClick={() => router.push('/salon')}
          className="flex items-center gap-1.5 text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors px-2.5 py-1.5 rounded-lg">
          <LogOut size={12} />
          Siteye Dön
        </button>
      </div>

      {/* ── Mobil Drawer ── */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="md:hidden fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col"
              style={{ background: 'rgba(10,10,16,0.98)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
                <div>
                  <span className="text-[#C9A84C] font-bold text-lg">DokuzBeş</span>
                  <p className="text-white/25 text-[11px]">Yönetim Paneli</p>
                </div>
                <button onClick={() => setDrawer(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X size={15} className="text-white/50" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link key={href} href={href}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all ${
                        active
                          ? 'bg-[#C9A84C]/12 text-[#C9A84C]'
                          : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                      }`}>
                      <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
                      <span className="flex-1">{label}</span>
                      {active && <ChevronRight size={14} className="text-[#C9A84C]/50" />}
                    </Link>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-white/[0.06]">
                <div className="px-4 py-2 text-[12px] text-white/20 truncate mb-1">{kullanici.email}</div>
                <button onClick={() => router.push('/salon')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] text-white/35 hover:text-white/70 hover:bg-white/[0.04] w-full transition-all">
                  <LogOut size={16} />
                  Ana Sayfaya Dön
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── İçerik ── */}
      <main className="flex-1 md:ml-56 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
