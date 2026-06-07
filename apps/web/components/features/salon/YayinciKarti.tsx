'use client'

import Link from 'next/link'
import { MapPin, Users } from 'lucide-react'
import { DBAvatar } from '@/components/ui/DBAvatar'
import type { Yayinci, YayinciDurumu } from '@/types/yayinci'

const durumEtiket: Record<YayinciDurumu, string> = {
  online:  'Çevrimiçi',
  musait:  'Müsait',
  mesgul:  'Meşgul',
  molada:  'Molada',
  offline: 'Çevrimdışı',
}

const durumRenk: Record<YayinciDurumu, string> = {
  online:  'text-[#4CAF50] bg-[rgba(76,175,80,0.12)]',
  musait:  'text-[#4CAF50] bg-[rgba(76,175,80,0.12)]',
  mesgul:  'text-[#F44336] bg-[rgba(244,67,54,0.12)]',
  molada:  'text-[#9C27B0] bg-[rgba(156,39,176,0.12)]',
  offline: 'text-[#616161] bg-[rgba(97,97,97,0.12)]',
}

interface Props {
  yayinci: Yayinci
}

export function YayinciKarti({ yayinci }: Props) {
  return (
    <Link href={`/yayinci/${yayinci.id}`} className="block group">
      <div className="relative bg-[#111111] border border-[rgba(201,168,76,0.12)] rounded-[16px] p-4 flex flex-col gap-3 transition-all duration-200 hover:border-[rgba(201,168,76,0.35)] hover:bg-[#141414] hover:shadow-[0_0_24px_rgba(201,168,76,0.08)]">

        {/* VIP rozeti */}
        {yayinci.vipSeviye >= 2 && (
          <div className="absolute top-3 right-3">
            <span className="db-etiket text-[#C9A84C] bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] px-2 py-0.5 rounded-full">
              {yayinci.vipSeviye === 3 ? '👑 VIP' : '⭐ VIP'}
            </span>
          </div>
        )}

        {/* Avatar + isim */}
        <div className="flex items-center gap-3">
          <DBAvatar
            src={yayinci.avatarUrl || null}
            initials={yayinci.displayName}
            size={52}
            status={yayinci.durum}
          />
          <div className="min-w-0 flex-1">
            <p className="db-baslik-3 text-[#F0EDE8] truncate leading-tight">
              {yayinci.displayName}
            </p>
            <span className={['db-etiket px-2 py-0.5 rounded-full mt-1 inline-block', durumRenk[yayinci.durum]].join(' ')}>
              {durumEtiket[yayinci.durum]}
            </span>
          </div>
        </div>

        {/* Bio */}
        {yayinci.bio && (
          <p className="db-kucuk text-[#A09080] line-clamp-2 leading-relaxed">
            {yayinci.bio}
          </p>
        )}

        {/* Şehir + izleyici */}
        <div className="flex items-center gap-3 text-[#5A5050]">
          {yayinci.city && (
            <span className="flex items-center gap-1 db-kucuk">
              <MapPin size={11} />
              {yayinci.city}
            </span>
          )}
          {yayinci.aktifIzleyici > 0 && (
            <span className="flex items-center gap-1 db-kucuk">
              <Users size={11} />
              {yayinci.aktifIzleyici} izleyici
            </span>
          )}
        </div>

        {/* Etiketler */}
        {yayinci.etiketler?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {yayinci.etiketler.slice(0, 3).map((etiket) => (
              <span
                key={etiket}
                className="db-etiket text-[#5A5050] bg-[#1A1A1A] border border-[rgba(255,255,255,0.06)] px-2 py-0.5 rounded-full"
              >
                {etiket}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
