'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, Users, Play, Clock, Coins } from 'lucide-react'
import { DBLoadingSpinner } from '@/components/ui/DBLoadingSpinner'
import { DBButton } from '@/components/ui/DBButton'
import { useSalon } from '@/hooks/useSalon'
import { useAuth } from '@/hooks/useAuth'
import type { Yayinci } from '@/types/yayinci'
import { useState } from 'react'

const ONLINE: Yayinci['durum'][] = ['online', 'musait', 'mesgul', 'molada']
const MUSAIT: Yayinci['durum'][] = ['musait', 'online']

type PostTip = 'fotograf' | 'metin' | 'canli' | 'video'

interface Post {
  id: string
  yayinciId: string
  tip: PostTip
  icerik: string
  begeni: number
  yorum: number
  zaman: string
  etiketler?: string[]
}

const POSTS: Post[] = [
  { id: 'p1', yayinciId: '0', tip: 'canli',   icerik: 'Yayına başladı! Gece boyunca sizinle 🎵',           begeni: 234,  yorum: 47,  zaman: 'Az önce',    etiketler: ['müzik','sohbet'] },
  { id: 'p2', yayinciId: '1', tip: 'fotograf', icerik: 'Bugün akşam için hazır mısınız? 🌙✨',              begeni: 891,  yorum: 123, zaman: '2 sa önce',  etiketler: ['gece','moda'] },
  { id: 'p3', yayinciId: '2', tip: 'metin',    icerik: 'Bu gece özel bir sürprizim var sizin için. Tam gece yarısı buluşuyoruz 🌹 Beni bekliyormuşsunuz gibi hissettiriyor. Teşekkürler 💛', begeni: 445, yorum: 89, zaman: '4 sa önce' },
  { id: 'p4', yayinciId: '3', tip: 'fotograf', icerik: 'Kahvemi içerken sizinle sohbet etmek istiyorum ☕', begeni: 312,  yorum: 56,  zaman: '6 sa önce',  etiketler: ['sohbet'] },
  { id: 'p5', yayinciId: '4', tip: 'canli',    icerik: 'Dans gecesi başladı! Kim hazır? 💃',               begeni: 678,  yorum: 94,  zaman: '8 sa önce',  etiketler: ['dans','eğlence'] },
  { id: 'p6', yayinciId: '5', tip: 'video',    icerik: 'Dünkü yayından özel anlar 🎬',                    begeni: 1203, yorum: 178, zaman: '1 gün önce', etiketler: ['highlights'] },
]

export default function SalonPage() {
  useAuth()
  const { yayincilar, yukleniyor } = useSalon('tumu')

  const cevrimici  = yayincilar.filter(y => ONLINE.includes(y.durum))
  const musaitler  = yayincilar.filter(y => MUSAIT.includes(y.durum))
  const sahne      = cevrimici.reduce<Yayinci | null>((best, y) =>
    !best || y.aktifIzleyici > best.aktifIzleyici ? y : best, null)

  if (yukleniyor) {
    return <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]"><DBLoadingSpinner size={44} /></div>
  }

  const posts = POSTS
    .map(p => ({ ...p, yayinci: yayincilar[parseInt(p.yayinciId) % Math.max(yayincilar.length, 1)] }))
    .filter(p => p.yayinci)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-[600px] mx-auto flex flex-col">

        {/* ── BU GECE SAHNE ── */}
        {sahne && (
          <SahneHero yayinci={sahne} />
        )}

        {/* ── MÜSAİT MASALAR ── */}
        {musaitler.length > 0 && (
          <MasalarBolumu yayincilar={musaitler} />
        )}

        {/* ── CANLIYSA VE MÜSAİT TABLO YOK — STORIES ── */}
        {cevrimici.length > 0 && musaitler.length === 0 && (
          <div className="px-4 pt-5 pb-4 border-b border-[rgba(255,255,255,0.05)]">
            <div className="overflow-hidden">
              <div className="marquee-track flex gap-4 w-max">
                {[...cevrimici, ...cevrimici].map((y, i) => (
                  <Story key={`${y.id}-${i}`} yayinci={y} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SALON AKIŞI ── */}
        <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.04)]">
          {posts.map(p => (
            <FeedPost key={p.id} post={p} yayinci={p.yayinci} />
          ))}
        </div>

      </div>
    </div>
  )
}

/* ── Bu Gece Sahne Hero ──────────────────────────── */
function SahneHero({ yayinci }: { yayinci: Yayinci }) {
  return (
    <div className="relative w-full border-b border-[rgba(201,168,76,0.08)]" style={{ aspectRatio: '16/9' }}>
      {yayinci.avatarUrl ? (
        <Image src={yayinci.avatarUrl} alt={yayinci.displayName} fill className="object-cover object-top" sizes="600px" priority />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A10] to-[#0A0A0A]" />
      )}

      {/* Degrade overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.92)] via-[rgba(0,0,0,0.25)] to-[rgba(0,0,0,0.1)]" />

      {/* Üst başlık */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="db-etiket text-[#C9A84C] tracking-[0.2em]">BU GECE SAHNE</span>
      </div>

      {/* CANLI badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#8B1A2A] rounded-full px-3 py-1 pulse-border-live">
        <span className="w-2 h-2 rounded-full bg-[#FF4444] animate-pulse" />
        <span className="text-white text-[11px] font-bold tracking-wider">CANLI</span>
        {yayinci.aktifIzleyici > 0 && (
          <span className="text-white text-[11px] font-semibold">· {yayinci.aktifIzleyici}</span>
        )}
      </div>

      {/* Alt bilgi */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2
              className="text-[#F0EDE8] font-bold leading-tight"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
            >
              {yayinci.displayName}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {yayinci.city && (
                <span className="db-kucuk text-[#A09080]">{yayinci.city}</span>
              )}
              {yayinci.etiketler?.slice(0, 2).map(e => (
                <span key={e} className="text-[10px] text-[#C9A84C] font-medium bg-[rgba(201,168,76,0.15)] px-2 py-0.5 rounded-full">#{e}</span>
              ))}
            </div>
          </div>
          <Link href={`/yayinci/${yayinci.id}`} className="shrink-0">
            <DBButton variant="primary" size="sm">
              Masaya Katıl
            </DBButton>
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Müsait Masalar Bölümü ──────────────────────── */
function MasalarBolumu({ yayincilar }: { yayincilar: Yayinci[] }) {
  return (
    <div className="px-4 py-5 border-b border-[rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
          <p className="db-etiket text-[#F0EDE8]">MÜSAİT MASALAR</p>
        </div>
        <span className="db-etiket text-[#4CAF50]">{yayincilar.length} yayıncı bekliyor</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {yayincilar.map(y => (
          <MasaKarti key={y.id} yayinci={y} />
        ))}
      </div>
    </div>
  )
}

/* ── Masa Kartı (9:16) ──────────────────────────── */
function MasaKarti({ yayinci }: { yayinci: Yayinci }) {
  return (
    <Link
      href={`/yayinci/${yayinci.id}`}
      className="shrink-0 relative rounded-[16px] overflow-hidden bg-[#111111] card-hover pulse-border-gold"
      style={{ width: 130, height: 231 }}
    >
      {yayinci.avatarUrl && (
        <Image src={yayinci.avatarUrl} alt={yayinci.displayName} fill className="object-cover object-top" sizes="130px" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.88)] via-transparent to-transparent" />

      {/* Müsait badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-[rgba(76,175,80,0.9)] backdrop-blur-sm rounded-full px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-white text-[8px] font-bold">MÜSAİT</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-[12px] text-[#F0EDE8] font-semibold truncate">{yayinci.displayName}</p>

        {/* Fiyat bilgisi */}
        <div className="flex items-center gap-1 mt-1.5">
          <Coins size={10} className="text-[#C9A84C]" />
          <span className="text-[10px] text-[#C9A84C] font-bold">50</span>
          <span className="text-[9px] text-[#5A5050]">·</span>
          <Clock size={9} className="text-[#5A5050]" />
          <span className="text-[9px] text-[#5A5050]">5 dk</span>
        </div>

        <div className="mt-1.5 w-full bg-gradient-to-r from-[#8B1A2A] to-[#5C0F1A] rounded-full py-1 text-center">
          <span className="text-white text-[10px] font-bold">Otur</span>
        </div>
      </div>
    </Link>
  )
}

/* ── Story ──────────────────────────────────────── */
function Story({ yayinci }: { yayinci: Yayinci }) {
  return (
    <Link href={`/yayinci/${yayinci.id}`} className="shrink-0 flex flex-col items-center gap-1.5" style={{ width: 68 }}>
      <div className="rounded-full p-[2.5px] bg-gradient-to-tr from-[#8B1A2A] via-[#C9A84C] to-[#8B1A2A]">
        <div className="w-[58px] h-[58px] rounded-full overflow-hidden border-2 border-[#0A0A0A] bg-[#1A1A1A]">
          {yayinci.avatarUrl
            ? <Image src={yayinci.avatarUrl} alt={yayinci.displayName} width={58} height={58} className="object-cover w-full h-full" />
            : <div className="w-full h-full flex items-center justify-center text-[#C9A84C] font-bold text-lg">{yayinci.displayName[0]}</div>
          }
        </div>
      </div>
      <span className="text-[9px] font-bold text-white bg-[#8B1A2A] px-1.5 py-0.5 rounded-full -mt-0.5 tracking-wide">CANLI</span>
      <p className="text-[10px] text-[#A09080] truncate w-full text-center">{yayinci.displayName.split(' ')[0]}</p>
    </Link>
  )
}

/* ── Feed Post ──────────────────────────────────── */
function FeedPost({ post, yayinci }: { post: Post & { yayinci: Yayinci }; yayinci: Yayinci }) {
  const [begendi, setBegendi] = useState(false)
  const canli = ONLINE.includes(yayinci.durum)

  return (
    <article className="flex flex-col">

      {/* Profil satırı */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/yayinci/${yayinci.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className={['rounded-full shrink-0 p-[2px]', canli ? 'bg-gradient-to-tr from-[#8B1A2A] via-[#C9A84C] to-[#8B1A2A]' : 'bg-[#2A2A2A]'].join(' ')}>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#0A0A0A] bg-[#1A1A1A]">
              {yayinci.avatarUrl
                ? <Image src={yayinci.avatarUrl} alt={yayinci.displayName} width={36} height={36} className="object-cover w-full h-full" />
                : <div className="w-full h-full flex items-center justify-center text-[#C9A84C] font-bold">{yayinci.displayName[0]}</div>
              }
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="db-govde-kck text-[#F0EDE8] font-semibold truncate">{yayinci.displayName}</p>
              {yayinci.vipSeviye >= 2 && <span className="text-[#C9A84C] text-xs">✓</span>}
            </div>
            <p className="text-[10px] text-[#5A5050]">{post.zaman}</p>
          </div>
        </Link>
        {post.tip === 'canli' && (
          <div className="flex items-center gap-1 bg-[#8B1A2A] rounded-full px-2.5 py-1 shrink-0 pulse-border-live">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4444] animate-pulse" />
            <span className="text-white text-[10px] font-bold tracking-wide">CANLI</span>
            {yayinci.aktifIzleyici > 0 && (
              <span className="text-white text-[10px] ml-0.5">· {yayinci.aktifIzleyici}</span>
            )}
          </div>
        )}
      </div>

      {/* Görsel */}
      {(post.tip === 'fotograf' || post.tip === 'canli' || post.tip === 'video') && yayinci.avatarUrl && (
        <Link href={`/yayinci/${yayinci.id}`} className="relative block w-full bg-[#111111]" style={{ aspectRatio: post.tip === 'canli' ? '16/9' : '4/5' }}>
          <Image src={yayinci.avatarUrl} alt={yayinci.displayName} fill className="object-cover object-top" sizes="600px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.55)] via-transparent to-transparent" />

          {post.tip === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(0,0,0,0.6)] border-2 border-[rgba(255,255,255,0.25)] flex items-center justify-center backdrop-blur-sm">
                <Play size={24} className="text-white ml-1" fill="white" />
              </div>
            </div>
          )}

          {post.tip === 'canli' && yayinci.aktifIzleyici > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-[rgba(0,0,0,0.65)] backdrop-blur-sm rounded-full px-2.5 py-1">
              <Users size={10} className="text-[#A09080]" />
              <span className="text-[11px] text-[#F0EDE8]">{yayinci.aktifIzleyici} izleyici</span>
            </div>
          )}
        </Link>
      )}

      {/* Metin içeriği */}
      {post.icerik && (
        <div className="px-4 pt-3">
          <p className="db-govde-kck text-[#F0EDE8] leading-relaxed">{post.icerik}</p>
          {post.etiketler && post.etiketler.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.etiketler.map(e => (
                <span key={e} className="text-[#C9A84C] text-[12px] font-medium">#{e}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aksiyon bar */}
      <div className="flex items-center gap-5 px-4 py-3">
        <button
          onClick={() => setBegendi(p => !p)}
          className={['flex items-center gap-1.5 transition-all', begendi ? 'text-[#F44336]' : 'text-[#5A5050] hover:text-[#F44336]'].join(' ')}
        >
          <Heart size={20} strokeWidth={1.8} fill={begendi ? '#F44336' : 'none'} />
          <span className="text-[12px]">{(post.begeni + (begendi ? 1 : 0)).toLocaleString('tr-TR')}</span>
        </button>

        <button className="flex items-center gap-1.5 text-[#5A5050] hover:text-[#F0EDE8] transition-colors">
          <MessageCircle size={20} strokeWidth={1.8} />
          <span className="text-[12px]">{post.yorum}</span>
        </button>

        <button className="flex items-center gap-1.5 text-[#5A5050] hover:text-[#F0EDE8] transition-colors">
          <Share2 size={18} strokeWidth={1.8} />
        </button>

        <div className="ml-auto">
          {post.tip === 'canli'
            ? <Link href={`/yayinci/${yayinci.id}`}><DBButton variant="primary" size="sm">Katıl</DBButton></Link>
            : <Link href={`/yayinci/${yayinci.id}`}><DBButton variant="ghost" size="sm">Profil</DBButton></Link>
          }
        </div>
      </div>

    </article>
  )
}
