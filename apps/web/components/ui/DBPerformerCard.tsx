'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Users } from 'lucide-react'

const GRADIENTS = [
  'linear-gradient(160deg, #2D0A15 0%, #8B1A2A 100%)',
  'linear-gradient(160deg, #0A0A2D 0%, #1A1066 100%)',
  'linear-gradient(160deg, #0A1A0A 0%, #1A4D28 100%)',
  'linear-gradient(160deg, #1A0A2D 0%, #3D1466 100%)',
  'linear-gradient(160deg, #1A1205 0%, #5C3D00 100%)',
  'linear-gradient(160deg, #051A1A 0%, #005C5C 100%)',
]

function hashGradient(id: string) {
  const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[n % GRADIENTS.length]
}

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
  href?: string
  featured?: boolean
}

export function DBPerformerCard({
  id, displayName, avatarUrl, durum, kategori, sehir,
  puan = 0, aktifIzleyici = 0, vipSeviye = 1, href, featured = false,
}: DBPerformerCardProps) {
  const isCanli  = durum === 'canli' || durum === 'online'
  const isMusait = durum === 'musait' || durum === 'online'
  const link = href ?? `/yayinci/${id}`

  return (
    <Link href={link} className="block group">
      <motion.div
        className={[
          'relative rounded-3xl overflow-hidden cursor-pointer select-none',
          featured ? 'aspect-[3/2]' : 'aspect-[3/4] sm:aspect-[9/16]',
          isCanli  ? 'live-card-glow'   : '',
          !isCanli && isMusait ? 'musait-card-glow' : '',
        ].join(' ')}
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      >
        {/* Arka plan görseli */}
        <div className="absolute inset-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.07]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: hashGradient(id) }}>
              <span className="text-[#C9A84C]/70 font-bold select-none"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 72, lineHeight: 1 }}>
                {displayName.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Gradient overlay — daha derin karartma */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.95)] via-[rgba(0,0,0,0.12)] to-[rgba(0,0,0,0.28)]" />
        {/* Hafif vignette kenarlarda */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.4) 100%)' }} />

        {/* Üst badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
          {vipSeviye >= 2 ? (
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96A)', backdropFilter: 'blur(8px)' }}>
              <span className="text-black text-[8px] font-black tracking-widest">
                {vipSeviye === 3 ? '✦ VIP' : 'VIP'}
              </span>
            </div>
          ) : <div />}

          {isCanli ? (
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-lg"
              style={{ background: 'rgba(120,0,20,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,68,68,0.35)' }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#FF4444]"
              />
              <span className="text-white text-[9px] font-black tracking-widest">CANLI</span>
              {aktifIzleyici > 0 && (
                <span className="text-white/65 text-[9px] font-semibold">{aktifIzleyici}</span>
              )}
            </div>
          ) : isMusait ? (
            <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{ background: 'rgba(20,70,25,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(76,175,80,0.4)' }}>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"
              />
              <span className="text-white text-[8px] font-bold tracking-wide">MÜSAİT</span>
            </div>
          ) : null}
        </div>

        {/* İzleyici sayısı — canlıysa */}
        {isCanli && aktifIzleyici > 0 && (
          <div className="absolute top-10 left-2.5 z-10 flex items-center gap-1 glass-dark rounded-full px-2 py-0.5">
            <Users size={9} className="text-white/60" />
            <span className="text-[10px] text-white/80">{aktifIzleyici.toLocaleString('tr-TR')}</span>
          </div>
        )}

        {/* Alt bilgi */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <p className="text-white font-bold leading-tight truncate"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: featured ? 20 : 16 }}>
            {displayName}
          </p>

          <div className="flex items-center gap-2 mt-0.5">
            {kategori ? (
              <span className="text-[10px] text-[#C9A84C]/80 capitalize truncate">{kategori}</span>
            ) : sehir ? (
              <span className="text-[10px] text-white/35 truncate">{sehir}</span>
            ) : null}
            {puan > 0 && (
              <div className="ml-auto flex items-center gap-0.5 shrink-0">
                <Star size={8} className="text-[#C9A84C]" fill="#C9A84C" />
                <span className="text-[10px] text-[#C9A84C] font-semibold">{puan.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* CTA sadece müsaitse */}
          {isMusait && !isCanli && (
            <motion.div
              className="mt-2 w-full rounded-xl py-1.5 text-center font-black text-[10px] tracking-[0.14em] text-black"
              style={{
                background: 'linear-gradient(90deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)',
                backgroundSize: '200% auto',
                animation: 'ctaShimmer 3s linear infinite',
              }}
            >
              MASAYA OTUR
            </motion.div>
          )}
          {isCanli && (
            <motion.div
              className="mt-2 w-full rounded-xl py-1.5 text-center font-black text-[10px] tracking-[0.14em] text-white"
              style={{
                background: 'linear-gradient(90deg, #5C0011 0%, #8B1A2A 40%, #C9A84C 50%, #8B1A2A 60%, #5C0011 100%)',
                backgroundSize: '200% auto',
                animation: 'ctaShimmer 2.5s linear infinite',
              }}
            >
              YAYINA KATIL
            </motion.div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
