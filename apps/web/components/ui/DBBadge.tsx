interface DBBadgeProps {
  tip: 'canli' | 'vip' | 'online' | 'mesgul' | 'molada' | 'offline' | 'musait' | 'beklemede' | 'onaylandi' | 'reddedildi' | 'yeni' | 'performer' | 'admin'
  size?: 'sm' | 'md'
  className?: string
}

const BADGE_CONF: Record<DBBadgeProps['tip'], { label: string; cls: string; dot?: boolean; pulse?: boolean }> = {
  canli:      { label: 'CANLI',       cls: 'bg-[#8B1A2A] text-white border-[rgba(255,68,68,0.3)]',                      dot: true, pulse: true  },
  vip:        { label: 'VIP',         cls: 'bg-[rgba(201,168,76,0.15)] text-[#C9A84C] border-[rgba(201,168,76,0.35)]'              },
  online:     { label: 'Çevrimiçi',   cls: 'bg-green-400/10 text-green-400 border-green-400/25',                         dot: true             },
  musait:     { label: 'Müsait',      cls: 'bg-green-400/10 text-green-400 border-green-400/25',                         dot: true, pulse: true },
  mesgul:     { label: 'Meşgul',      cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25',                      dot: true             },
  molada:     { label: 'Molada',      cls: 'bg-purple-400/10 text-purple-400 border-purple-400/25',                      dot: true             },
  offline:    { label: 'Çevrimdışı',  cls: 'bg-white/5 text-gray-600 border-white/8'                                                },
  beklemede:  { label: 'Bekliyor',    cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25'                                  },
  onaylandi:  { label: 'Onaylandı',   cls: 'bg-green-400/10 text-green-400 border-green-400/25'                                     },
  reddedildi: { label: 'Reddedildi',  cls: 'bg-red-400/10 text-red-400 border-red-400/25'                                          },
  yeni:       { label: 'YENİ',        cls: 'bg-[rgba(201,168,76,0.15)] text-[#C9A84C] border-[rgba(201,168,76,0.35)]'              },
  performer:  { label: 'Yayıncı',     cls: 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border-[rgba(201,168,76,0.25)]'             },
  admin:      { label: 'Admin',       cls: 'bg-purple-400/10 text-purple-400 border-purple-400/25'                                  },
}

export function DBBadge({ tip, size = 'md', className = '' }: DBBadgeProps) {
  const conf = BADGE_CONF[tip]
  const sizeCs = size === 'sm'
    ? 'text-[9px] px-1.5 py-0.5 gap-1'
    : 'text-[10px] px-2 py-0.5 gap-1.5'

  return (
    <span className={[
      'inline-flex items-center font-bold tracking-wide rounded-full border',
      sizeCs, conf.cls, className,
    ].join(' ')}>
      {conf.dot && (
        <span className={['w-1.5 h-1.5 rounded-full bg-current shrink-0', conf.pulse ? 'animate-pulse' : ''].join(' ')} />
      )}
      {conf.label}
    </span>
  )
}
