import { type LucideIcon } from 'lucide-react'

interface DBStatCardProps {
  label: string
  deger: string | number
  suffix?: string
  icon?: LucideIcon
  degisim?: { yuzde: number; pozitif: boolean }
  vurgu?: boolean
  className?: string
}

export function DBStatCard({ label, deger, suffix, icon: Icon, degisim, vurgu, className = '' }: DBStatCardProps) {
  return (
    <div className={[
      'bg-[#0f0f18] border rounded-2xl p-4 flex flex-col gap-2',
      vurgu ? 'border-[rgba(201,168,76,0.25)]' : 'border-white/6',
      className,
    ].join(' ')}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-600 tracking-wide uppercase leading-tight">{label}</p>
        {Icon && <Icon size={13} className="text-gray-700" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={['font-bold text-2xl leading-none', vurgu ? 'text-[#C9A84C]' : 'text-white'].join(' ')}>
          {typeof deger === 'number' ? deger.toLocaleString('tr-TR') : deger}
        </span>
        {suffix && <span className="text-gray-600 text-xs">{suffix}</span>}
      </div>
      {degisim && (
        <p className={['text-xs font-medium', degisim.pozitif ? 'text-green-400' : 'text-red-400'].join(' ')}>
          {degisim.pozitif ? '+' : ''}{degisim.yuzde}% bu hafta
        </p>
      )}
    </div>
  )
}

export function DBStatGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const colCls = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' }
  return <div className={['grid gap-2.5', colCls[cols]].join(' ')}>{children}</div>
}
