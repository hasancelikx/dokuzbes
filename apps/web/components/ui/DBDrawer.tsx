'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface DBDrawerProps {
  acik: boolean
  onKapat: () => void
  baslik?: string
  children: React.ReactNode
  snapPoint?: 'half' | 'full' | 'auto'
}

const heightCls = {
  half: 'max-h-[50vh]',
  full: 'max-h-[92vh]',
  auto: 'max-h-[80vh]',
}

export function DBDrawer({ acik, onKapat, baslik, children, snapPoint = 'auto' }: DBDrawerProps) {
  useEffect(() => {
    if (!acik) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [acik])

  return (
    <AnimatePresence>
      {acik && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onKapat}
          />

          {/* Drawer */}
          <motion.div
            className={[
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-[#0f0f18] border-t border-white/10 rounded-t-3xl',
              'flex flex-col',
              heightCls[snapPoint],
            ].join(' ')}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
          >
            {/* Handle */}
            <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            {baslik && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 shrink-0">
                <h2 className="text-white font-semibold text-base">{baslik}</h2>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={onKapat}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={15} />
                </motion.button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto overscroll-contain p-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
