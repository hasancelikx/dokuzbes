'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface DBModalProps {
  acik: boolean
  onKapat: () => void
  baslik?: string
  children: React.ReactNode
  boyut?: 'sm' | 'md' | 'lg'
}

const boyutCls = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

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

  return (
    <AnimatePresence>
      {acik && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onKapat}
          />

          {/* Panel */}
          <motion.div
            className={[
              'relative w-full bg-[#0f0f18] border border-white/10 rounded-3xl shadow-2xl',
              boyutCls[boyut],
            ].join(' ')}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {baslik && (
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
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
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
