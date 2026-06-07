import { type LucideIcon } from 'lucide-react'

interface DBEmptyProps {
  icon?: LucideIcon
  baslik: string
  aciklama?: string
  aksiyon?: { label: string; onClick: () => void }
}

export function DBEmpty({ icon: Icon, baslik, aciklama, aksiyon }: DBEmptyProps) {
  return (
    <div className="flex flex-col items-center py-16 gap-3 text-center fade-in-scale">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mb-1">
          <Icon size={24} className="text-gray-700" />
        </div>
      )}
      <p className="text-white font-semibold text-sm">{baslik}</p>
      {aciklama && <p className="text-gray-600 text-xs max-w-[220px] leading-relaxed">{aciklama}</p>}
      {aksiyon && (
        <button
          onClick={aksiyon.onClick}
          className="mt-1 text-xs text-[#C9A84C] hover:underline transition-colors"
        >
          {aksiyon.label}
        </button>
      )}
    </div>
  )
}
