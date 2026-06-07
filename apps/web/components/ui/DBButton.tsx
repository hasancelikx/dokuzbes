'use client'

import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface DBButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  yukleniyor?: boolean
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-b from-[#8B1A2A] to-[#5C0F1A] border border-[rgba(201,168,76,0.5)] text-[#F0EDE8] hover:from-[#9E1F30] hover:to-[#6B1220] shadow-[0_0_20px_rgba(139,26,42,0.3)]',
  secondary:
    'bg-[#1A1A1A] border border-[rgba(201,168,76,0.4)] text-[#C9A84C] hover:bg-[#242424]',
  ghost:
    'bg-transparent border border-transparent text-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)]',
  danger:
    'bg-gradient-to-b from-[#c62828] to-[#8b0000] border border-[rgba(244,67,54,0.4)] text-white hover:from-[#d32f2f]',
}

const sizeStyles: Record<string, string> = {
  sm: 'h-9  px-4 text-[13px] rounded-[8px]',
  md: 'h-11 px-6 text-[15px] rounded-[10px]',
  lg: 'h-13 px-8 text-[16px] rounded-[12px]',
}

export function DBButton({
  variant = 'primary',
  size = 'md',
  icon,
  yukleniyor,
  disabled,
  children,
  className = '',
  ...props
}: DBButtonProps) {
  return (
    <button
      disabled={disabled || yukleniyor}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold tracking-wide',
        'transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {yukleniyor ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
