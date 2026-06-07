'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface DBDrawerProps {
  acik: boolean
  onKapat: () => void
  baslik?: string
  children: React.ReactNode
  snapPoint?: 'half' | 'full' | 'auto'
}

export function DBDrawer({ acik, onKapat, baslik, children, snapPoint = 'auto' }: DBDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!acik) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [acik])

  const heightCls = {
    half: 'max-h-[50vh]',
    full: 'max-h-[92vh]',
    auto: 'max-h-[80vh]',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
          acik ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onKapat}
      />
      {/* Drawer */}
      <div className={[
        'fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f18] border-t border-white/10 rounded-t-3xl',
        'transition-transform duration-300 ease-out flex flex-col',
        heightCls[snapPoint],
        acik ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}>
        {/* Handle */}
        <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {baslik && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 shrink-0">
            <h2 className="text-white font-semibold text-base">{baslik}</h2>
            <button
              onClick={onKapat}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {children}
        </div>
      </div>
    </>
  )
}
