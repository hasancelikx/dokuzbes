'use client'

import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface DBButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  yukleniyor?: boolean
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-b from-[#8B1A2A] to-[#5C0F1A] border border-[rgba(201,168,76,0.45)] text-[#F0EDE8] hover:from-[#9E1F30] hover:to-[#6B1220] shadow-[0_2px_16px_rgba(139,26,42,0.35),inset_0_1px_0_rgba(201,168,76,0.15)]',
  secondary:
    'border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:border-[rgba(201,168,76,0.55)] hover:text-[#E8C96A] shadow-[0_0_16px_rgba(201,168,76,0.04)]',
  ghost:
    'bg-transparent border border-transparent text-[#C9A84C]/70 hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.07)]',
  danger:
    'bg-gradient-to-b from-[#c62828] to-[#8b0000] border border-[rgba(244,67,54,0.35)] text-white hover:from-[#d32f2f] shadow-[0_2px_12px_rgba(198,40,40,0.3)]',
  outline:
    'bg-transparent border border-white/10 text-[#A09080] hover:border-white/20 hover:text-[#F0EDE8]',
}

const variantBg: Record<string, string> = {
  primary:   '',
  secondary: 'rgba(201,168,76,0.05)',
  ghost:     '',
  danger:    '',
  outline:   '',
}

const sizeStyles: Record<string, string> = {
  sm: 'h-9  px-4   text-[13px] rounded-[10px] gap-1.5',
  md: 'h-11 px-5   text-[14px] rounded-[12px] gap-2',
  lg: 'h-13 px-7   text-[15px] rounded-[14px] gap-2',
}

const spinnerSize: Record<string, number> = { sm: 14, md: 15, lg: 17 }

function InlineSpinner({ size }: { size: number }) {
  const s = Math.max(1, Math.round(size / 10))
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ border: `${s + 1}px solid rgba(255,255,255,0.15)`, borderTopColor: 'currentColor' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      />
    </span>
  )
}

export function DBButton({
  variant = 'primary',
  size = 'md',
  icon,
  yukleniyor,
  disabled,
  children,
  className = '',
  style,
  ...props
}: DBButtonProps) {
  const bg = variantBg[variant]
  return (
    <motion.button
      whileTap={disabled || yukleniyor ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled || yukleniyor}
      style={{ background: bg || undefined, backdropFilter: bg ? 'blur(12px)' : undefined, ...style }}
      className={[
        'inline-flex items-center justify-center font-semibold tracking-wide',
        'transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-45 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {yukleniyor ? <InlineSpinner size={spinnerSize[size]} /> : icon}
      {children}
    </motion.button>
  )
}
