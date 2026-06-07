import Link from 'next/link'
import { Users, Star } from 'lucide-react'
import { DBBadge } from './DBBadge'

interface DBPerformerCardProps {
  id: string
  displayName: string
  avatarUrl?: string | null
  durum: string
  kategori?: string | null
  sehir?: string | null
  puan?: number
  aktifIzleyici?: number
  vipSeviye?: number
  toplamHediye?: number
  href?: string
}

export function DBPerformerCard({
  id, displayName, avatarUrl, durum, kategori, sehir,
  puan = 0, aktifIzleyici = 0, vipSeviye = 1, href,
}: DBPerformerCardProps) {
  const isMusait = durum === 'online' || durum === 'musait'
  const isCanli = durum === 'canli'
  const link = href ?? `/yayinci/${id}`

  return (
    <Link href={link}>
      <div className={[
        'group relative bg-[#0f0f18] border rounded-2xl overflow-hidden cursor-pointer',
        'transition-all duration-200',
        isCanli
          ? 'border-[rgba(201,168,76,0.35)] pulse-border-gold'
          : isMusait
          ? 'border-[rgba(201,168,76,0.15)] hover:border-[rgba(201,168,76,0.3)]'
          : 'border-white/6 hover:border-white/10',
        'hover:shadow-[0_0_24px_rgba(201,168,76,0.07)]',
      ].join(' ')}>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080810]/90 pointer-events-none z-10" />

        {/* Avatar alanı */}
        <div className="relative aspect-[3/4] bg-[#0a0a12] flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#C9A84C]">{displayName.slice(0, 1)}</span>
            </div>
          )}

          {/* Badges — sağ üst */}
          <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
            {isCanli && <DBBadge tip="canli" size="sm" />}
            {!isCanli && isMusait && <DBBadge tip="musait" size="sm" />}
            {!isMusait && !isCanli && durum === 'mesgul' && <DBBadge tip="mesgul" size="sm" />}
          </div>

          {/* VIP — sol üst */}
          {vipSeviye >= 2 && (
            <div className="absolute top-2 left-2 z-20 bg-[#C9A84C] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wide">
              VIP {vipSeviye}
            </div>
          )}

          {/* İzleyici — sol alt */}
          {aktifIzleyici > 0 && (
            <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Users size={9} className="text-gray-400" />
              <span className="text-[10px] text-gray-300">{aktifIzleyici.toLocaleString('tr-TR')}</span>
            </div>
          )}
        </div>

        {/* Alt bilgi */}
        <div className="relative z-20 p-3">
          <p className="text-white font-semibold text-sm leading-tight truncate">{displayName}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-gray-600 capitalize">{kategori ?? '—'}</span>
            {puan > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-[#C9A84C]">
                <Star size={9} fill="currentColor" />
                {puan.toFixed(1)}
              </span>
            )}
          </div>
          {sehir && <p className="text-[10px] text-gray-700 mt-0.5 truncate">{sehir}</p>}
        </div>
      </div>
    </Link>
  )
}
