'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { useBildirimler, Bildirim } from '@/hooks/useBildirimler'

const TIP_IKON: Record<string, string> = {
  MASA_KABUL:          '📞',
  MASA_RED:            '❌',
  HEDIYE_ALINDI:       '🎁',
  GOLD_YUKLENDI:       '🪙',
  BASVURU_ONAYLANDI:   '✅',
  BASVURU_REDDEDILDI:  '❌',
}

function BildirimKart({ b, onOku, onSil }: {
  b: Bildirim
  onOku: (id: string) => void
  onSil: (id: string) => void
}) {
  return (
    <div
      className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors group ${
        b.okundu ? 'opacity-60' : ''
      }`}
    >
      <span className="text-xl shrink-0 mt-0.5">{TIP_IKON[b.tip] ?? '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${b.okundu ? 'text-gray-400' : 'text-white'}`}>
          {b.baslik}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{b.metin}</p>
        <p className="text-xs text-gray-600 mt-1">
          {new Date(b.createdAt).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
        </p>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!b.okundu && (
          <button
            onClick={() => onOku(b.id)}
            title="Okundu işaretle"
            className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-green-400 transition-colors"
          >
            <Check size={12} />
          </button>
        )}
        <button
          onClick={() => onSil(b.id)}
          title="Sil"
          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

export function BildirimZili() {
  const [acik, setAcik] = useState(false)
  const { bildirimler, okunmamis, tumunuOku, bildirimOku, bildirimSil } = useBildirimler()
  const panelRef = useRef<HTMLDivElement>(null)

  // Dışarı tıklanınca kapat
  useEffect(() => {
    function tikla(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAcik(false)
      }
    }
    if (acik) document.addEventListener('mousedown', tikla)
    return () => document.removeEventListener('mousedown', tikla)
  }, [acik])

  return (
    <div className="relative" ref={panelRef}>
      {/* Zil butonu */}
      <button
        onClick={() => setAcik((p) => !p)}
        className="relative p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {okunmamis > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#d4af37] text-black text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {okunmamis > 99 ? '99+' : okunmamis}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {acik && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* Başlık */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-semibold text-white">Bildirimler</span>
            <div className="flex gap-2">
              {okunmamis > 0 && (
                <button
                  onClick={tumunuOku}
                  className="text-xs text-[#d4af37] hover:text-[#c9a227] transition-colors"
                >
                  Tümünü oku
                </button>
              )}
              <button
                onClick={() => setAcik(false)}
                className="p-1 rounded hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {bildirimler.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="mx-auto mb-2 text-gray-700" />
                <p className="text-sm text-gray-500">Henüz bildirim yok</p>
              </div>
            ) : (
              bildirimler.map((b) => (
                <BildirimKart
                  key={b.id}
                  b={b}
                  onOku={bildirimOku}
                  onSil={bildirimSil}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
