'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/apiClient'
import { Users, Mic2, Clock, Table2, Activity, Ban, TrendingUp, TrendingDown } from 'lucide-react'

interface Istatistikler {
  toplamKullanici: number
  toplamPerformer: number
  bekleyenBasvuru: number
  toplamMasa: number
  aktifMasa: number
  banliKullanici: number
}

const MOCK: Istatistikler = {
  toplamKullanici:  2_841,
  toplamPerformer:  138,
  bekleyenBasvuru:  7,
  toplamMasa:       4_209,
  aktifMasa:        23,
  banliKullanici:   14,
}

const STAT_CFG = [
  { key: 'toplamKullanici', label: 'Kullanıcı',        icon: Users,    color: '#5B8CFF', bg: 'rgba(91,140,255,0.1)',   trend: '+12%' },
  { key: 'toplamPerformer', label: 'Performer',         icon: Mic2,     color: '#C9A84C', bg: 'rgba(201,168,76,0.1)',  trend: '+5%'  },
  { key: 'bekleyenBasvuru', label: 'Bekleyen Başvuru',  icon: Clock,    color: '#FF9800', bg: 'rgba(255,152,0,0.1)',   trend: null   },
  { key: 'toplamMasa',      label: 'Toplam Masa',       icon: Table2,   color: '#AB47BC', bg: 'rgba(171,71,188,0.1)',  trend: '+8%'  },
  { key: 'aktifMasa',       label: 'Aktif Masa',        icon: Activity, color: '#4CAF50', bg: 'rgba(76,175,80,0.1)',   trend: null   },
  { key: 'banliKullanici',  label: 'Banlı Kullanıcı',  icon: Ban,      color: '#F44336', bg: 'rgba(244,67,54,0.1)',   trend: null   },
] as const

function StatKart({
  label, deger, icon: Icon, color, bg, trend, delay,
}: {
  label: string; deger: number; icon: React.ElementType
  color: string; bg: string; trend: string | null; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: 'easeOut', duration: 0.28 }}
      className="vip-card p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-green-400">
            <TrendingUp size={11} />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="font-bold tabular-nums text-[#F0EDE8]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 30 }}>
          {deger.toLocaleString('tr-TR')}
        </p>
        <p className="text-[11px] text-[#5A5050] mt-0.5 tracking-wide">{label}</p>
      </div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [istatistikler, setIstatistikler] = useState<Istatistikler>(MOCK)
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    api.admin
      .get<Istatistikler>('/admin/istatistikler')
      .then(setIstatistikler)
      .catch(() => { /* MOCK already set */ })
      .finally(() => setYukleniyor(false))
  }, [])

  return (
    <div className="p-6 md:p-8 min-h-screen mesh-bg">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8">
        <h1 className="font-bold text-[#F0EDE8]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}>
          Dashboard
        </h1>
        <p className="text-[#5A5050] text-sm mt-0.5">Platforma genel bakış</p>
      </motion.div>

      {yukleniyor ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vip-card h-[116px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {STAT_CFG.map(({ key, label, icon, color, bg, trend }, i) => (
            <StatKart
              key={key}
              label={label}
              deger={istatistikler[key]}
              icon={icon}
              color={color}
              bg={bg}
              trend={trend}
              delay={i * 0.06}
            />
          ))}
        </div>
      )}

      {/* Hızlı özet */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="mt-6 vip-card p-5"
      >
        <p className="text-[10px] font-bold tracking-[0.15em] text-[#3A3030] uppercase mb-4">BUGÜN</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Yeni kayıt',     value: '+24',   color: '#4CAF50', up: true  },
            { label: 'Gold işlemi',    value: '₺8,420', color: '#C9A84C', up: true  },
            { label: 'Kapatılan masa', value: '91',    color: '#F0EDE8', up: null  },
            { label: 'Raporlama',      value: '3',     color: '#FF9800', up: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[12px] text-[#5A5050]">{r.label}</span>
              <span className="flex items-center gap-1 text-[13px] font-bold" style={{ color: r.color }}>
                {r.up === true && <TrendingUp size={10} />}
                {r.up === false && <TrendingDown size={10} />}
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
