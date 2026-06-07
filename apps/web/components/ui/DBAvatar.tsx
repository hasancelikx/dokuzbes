import Image from 'next/image'

type StatusRenk = 'online' | 'musait' | 'mesgul' | 'molada' | 'offline'

const statusColors: Record<StatusRenk, string> = {
  online:  '#4CAF50',
  musait:  '#4CAF50',
  mesgul:  '#F44336',
  molada:  '#9C27B0',
  offline: '#616161',
}

interface DBAvatar {
  src?: string | null
  initials?: string
  size?: number
  status?: StatusRenk
  className?: string
}

export function DBAvatar({ src, initials = '?', size = 48, status, className = '' }: DBAvatar) {
  return (
    <div
      className={['relative inline-flex shrink-0', className].join(' ')}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={initials}
          fill
          className="rounded-full object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-[#1A1A1A] border border-[rgba(201,168,76,0.3)] flex items-center justify-center"
          style={{ fontSize: size * 0.36 }}
        >
          <span className="text-[#C9A84C] font-semibold">{initials.slice(0, 2).toUpperCase()}</span>
        </div>
      )}

      {status && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-[#0A0A0A]"
          style={{
            width: size * 0.28,
            height: size * 0.28,
            backgroundColor: statusColors[status],
          }}
        />
      )}
    </div>
  )
}
