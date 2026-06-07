'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface DBModalProps {
  acik: boolean
  onKapat: () => void
  baslik?: string
  children: React.ReactNode
  boyut?: 'sm' | 'md' | 'lg'
}

export function DBModal({ acik, onKapat, baslik, children, boyut = 'md' }: DBModalProps) {
  useEffect(() => {
    if (!acik) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onKapat()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [acik, onKapat])

  if (!acik) return null

  const boyutCls = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onKapat}
      />
      {/* Panel */}
      <div className={[
        'relative w-full bg-[#0f0f18] border border-white/10 rounded-3xl shadow-2xl fade-in-scale',
        boyutCls[boyut],
      ].join(' ')}>
        {baslik && (
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
            <h2 className="text-white font-semibold text-base">{baslik}</h2>
            <button
              onClick={onKapat}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/8 transition-all"
            >
              <X size={15} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
