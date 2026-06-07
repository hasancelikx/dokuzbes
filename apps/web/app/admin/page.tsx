'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/apiClient'
import { Users, Mic2, Clock, Table2, Activity, Ban } from 'lucide-react'

interface Istatistikler {
  toplamKullanici: number
  toplamPerformer: number
  bekleyenBasvuru: number
  toplamMasa: number
  aktifMasa: number
  banliKullanici: number
}

function StatKart({
  label,
  deger,
  icon: Icon,
  renk,
}: {
  label: string
  deger: number
  icon: React.ElementType
  renk: string
}) {
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`p-2 rounded-lg ${renk}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{deger.toLocaleString('tr-TR')}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [istatistikler, setIstatistikler] = useState<Istatistikler | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState<string | null>(null)

  useEffect(() => {
    api.admin
      .get<Istatistikler>('/admin/istatistikler')
      .then(setIstatistikler)
      .catch(() => setHata('İstatistikler yüklenemedi.'))
      .finally(() => setYukleniyor(false))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Platforma genel bakış</p>

      {yukleniyor && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#12121a] border border-white/10 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      )}

      {hata && <p className="text-red-400">{hata}</p>}

      {istatistikler && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatKart
            label="Toplam Kullanıcı"
            deger={istatistikler.toplamKullanici}
            icon={Users}
            renk="bg-blue-500/15 text-blue-400"
          />
          <StatKart
            label="Toplam Performer"
            deger={istatistikler.toplamPerformer}
            icon={Mic2}
            renk="bg-[#d4af37]/15 text-[#d4af37]"
          />
          <StatKart
            label="Bekleyen Başvuru"
            deger={istatistikler.bekleyenBasvuru}
            icon={Clock}
            renk="bg-orange-500/15 text-orange-400"
          />
          <StatKart
            label="Toplam Masa"
            deger={istatistikler.toplamMasa}
            icon={Table2}
            renk="bg-purple-500/15 text-purple-400"
          />
          <StatKart
            label="Aktif Masa"
            deger={istatistikler.aktifMasa}
            icon={Activity}
            renk="bg-green-500/15 text-green-400"
          />
          <StatKart
            label="Banlı Kullanıcı"
            deger={istatistikler.banliKullanici}
            icon={Ban}
            renk="bg-red-500/15 text-red-400"
          />
        </div>
      )}
    </div>
  )
}
