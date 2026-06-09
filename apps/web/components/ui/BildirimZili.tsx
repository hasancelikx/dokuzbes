'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Trash2, X, ArrowRight } from 'lucide-react'
import { useBildirimler, Bildirim } from '@/hooks/useBildirimler'

const TIP_IKON: Record<string, string> = {
  MASA_KABUL:          '📞',
  MASA_RED:            '❌',
  HEDIYE_ALINDI:       '🎁',
  GOLD_YUKLENDI:       '🪙',
  BASVURU_ONAYLANDI:   '✅',
  BASVURU_REDDEDILDI:  '❌',
}

const TIP_RENK: Record<string, string> = {
  MASA_KABUL:          '#5B8CFF',
  MASA_RED:            '#F44336',
  HEDIYE_ALINDI:       '#C9A84C',
  GOLD_YUKLENDI:       '#C9A84C',
  BASVURU_ONAYLANDI:   '#4CAF50',
  BASVURU_REDDEDILDI:  '#F44336',
}

function bildirimHedef(b: Bildirim): string {
  const veri = b.veri as Record<string, string> | null
  switch (b.tip) {
    case 'MASA_KABUL':         return `/masa/${veri?.masaId ?? ''}`
    case 'MASA_RED':           return '/salon'
    case 'HEDIYE_ALINDI':      return '/hesabim/gecmis'
    case 'GOLD_YUKLENDI':      return '/hesabim/gecmis'
    case 'BASVURU_ONAYLANDI':  return '/hesabim'
    case 'BASVURU_REDDEDILDI': return '/yayinci-ol'
    default:                   return '/bildirimler'
  }
}

function gorelliZaman(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const dk = Math.floor(diff / 60000)
  if (dk < 1)  return 'Az önce'
  if (dk < 60) return `${dk} dk`
  const sa = Math.floor(dk / 60)
  if (sa < 24) return `${sa} sa`
  return `${Math.floor(sa / 24)} gün`
}

export function BildirimZili() {
  const router = useRouter()
  const [acik, setAcik] = useState(false)
  const { bildirimler, okunmamis, tumunuOku, bildirimOku, bildirimSil } = useBildirimler()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function tikla(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setAcik(false)
    }
    if (acik) document.addEventListener('mousedown', tikla)
    return () => document.removeEventListener('mousedown', tikla)
  }, [acik])

  function git(b: Bildirim) {
    if (!b.okundu) bildirimOku(b.id).catch(() => {})
    setAcik(false)
    router.push(bildirimHedef(b))
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Zil butonu */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => setAcik(p => !p)}
        className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/8"
        style={{ color: acik ? '#C9A84C' : 'rgba(240,237,232,0.5)' }}
      >
        <Bell size={16} strokeWidth={acik ? 2.2 : 1.7} />
        <AnimatePresence>
          {okunmamis > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 bg-[#8B1A2A] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
            >
              {okunmamis > 9 ? '9+' : okunmamis}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {acik && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="absolute right-0 top-full mt-2.5 w-[320px] z-50 overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(10,10,18,0.97)',
              border: '1px solid rgba(201,168,76,0.15)',
              boxShadow: '0 16px 64px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(201,168,76,0.08)',
              backdropFilter: 'blur(32px)',
            }}
          >
            {/* Başlık */}
            <div className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-[#C9A84C]" />
                <span className="text-[13px] font-bold text-[#F0EDE8]">Bildirimler</span>
                {okunmamis > 0 && (
                  <span className="text-[10px] bg-[#8B1A2A] text-white px-1.5 py-0.5 rounded-full font-bold">
                    {okunmamis}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {okunmamis > 0 && (
                  <button onClick={() => tumunuOku()}
                    className="text-[10px] text-[#C9A84C] hover:text-[#E0C070] transition-colors font-medium">
                    Tümünü oku
                  </button>
                )}
                <button onClick={() => setAcik(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors text-[#5A5050]">
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-[360px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {bildirimler.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Bell size={26} className="text-white/10" />
                  <p className="text-[12px] text-[#5A5050]">Henüz bildirim yok</p>
                </div>
              ) : (
                bildirimler.slice(0, 12).map(b => {
                  const renk = TIP_RENK[b.tip] ?? '#A09080'
                  return (
                    <motion.div
                      key={b.id}
                      layout
                      onClick={() => git(b)}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group relative"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: b.okundu ? 'transparent' : 'rgba(201,168,76,0.025)',
                        opacity: b.okundu ? 0.55 : 1,
                      }}
                    >
                      {!b.okundu && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                          style={{ background: renk }} />
                      )}
                      <span className="text-lg shrink-0 mt-0.5 leading-none">
                        {TIP_IKON[b.tip] ?? '🔔'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12.5px] font-semibold leading-tight truncate`}
                          style={{ color: b.okundu ? '#5A5050' : '#F0EDE8' }}>
                          {b.baslik}
                        </p>
                        <p className="text-[11px] text-[#5A5050] mt-0.5 line-clamp-2 leading-snug">{b.metin}</p>
                        <p className="text-[10px] mt-1" style={{ color: renk + '99' }}>
                          {b.createdAt ? gorelliZaman(b.createdAt) : ''}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                        {!b.okundu && (
                          <button onClick={e => { e.stopPropagation(); bildirimOku(b.id).catch(() => {}) }}
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/8 text-[#5A5050] hover:text-green-400 transition-colors">
                            <Check size={11} />
                          </button>
                        )}
                        <button onClick={e => { e.stopPropagation(); bildirimSil(b.id).catch(() => {}) }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/8 text-[#5A5050] hover:text-red-400 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Alt link */}
            {bildirimler.length > 0 && (
              <button
                onClick={() => { setAcik(false); router.push('/bildirimler') }}
                className="w-full flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold text-[#C9A84C] hover:text-[#E0C070] transition-colors"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
              >
                Tümünü gör
                <ArrowRight size={11} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
