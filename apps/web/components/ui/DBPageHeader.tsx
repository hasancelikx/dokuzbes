'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, type LucideIcon } from 'lucide-react'

interface DBPageHeaderProps {
  baslik: string
  aciklama?: string
  icon?: LucideIcon
  geri?: boolean | string
  aksiyon?: React.ReactNode
}

export function DBPageHeader({ baslik, aciklama, icon: Icon, geri, aksiyon }: DBPageHeaderProps) {
  const router = useRouter()

  function handleGeri() {
    if (typeof geri === 'string') router.push(geri)
    else router.back()
  }

  return (
    <div className="flex items-center gap-3 mb-1">
      {geri && (
        <button
          onClick={handleGeri}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
      )}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center shrink-0">
            <Icon size={17} className="text-[#C9A84C]" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-white font-bold text-lg leading-tight truncate">{baslik}</h1>
          {aciklama && <p className="text-gray-600 text-xs mt-0.5">{aciklama}</p>}
        </div>
      </div>
      {aksiyon && <div className="shrink-0">{aksiyon}</div>}
    </div>
  )
}
