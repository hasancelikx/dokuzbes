'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Mic2,
  LogOut,
  Wallet,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/basvurular', label: 'Başvurular', icon: UserCheck },
  { href: '/admin/performerlar', label: 'Performerlar', icon: Mic2 },
  { href: '/admin/cekimler', label: 'Çekimler', icon: Wallet },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { kullanici } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (kullanici && kullanici.role !== 'admin') {
      router.replace('/')
    }
  }, [kullanici, router])

  if (!kullanici || kullanici.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-gray-400">Yetki kontrol ediliyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#12121a] border-r border-white/10 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <span className="text-[#d4af37] font-bold text-lg tracking-wide">DokuzBeş</span>
          <p className="text-xs text-gray-500 mt-0.5">Yönetim Paneli</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-[#d4af37]/15 text-[#d4af37]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-gray-500">{kullanici.email}</div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 w-full transition-colors"
          >
            <LogOut size={16} />
            Ana Sayfaya Dön
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
