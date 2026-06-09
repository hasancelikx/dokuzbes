'use client'

import { motion } from 'framer-motion'

interface DBLoadingSpinnerProps {
  size?: number
  className?: string
}

export function DBLoadingSpinner({ size = 32, className = '' }: DBLoadingSpinnerProps) {
  const stroke = Math.max(2, Math.round(size / 12))

  return (
    <span
      className={['relative inline-flex items-center justify-center shrink-0', className].join(' ')}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Yükleniyor"
    >
      {/* Dış halka */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          border: `${stroke}px solid rgba(201,168,76,0.12)`,
          borderTopColor: '#C9A84C',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
      {/* İç halka — ters yön */}
      <motion.span
        className="absolute rounded-full"
        style={{
          inset: stroke * 2.5,
          border: `${Math.max(1, stroke - 1)}px solid rgba(201,168,76,0.06)`,
          borderBottomColor: 'rgba(201,168,76,0.45)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
      />
    </span>
  )
}
