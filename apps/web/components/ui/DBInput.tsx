'use client'

import { type InputHTMLAttributes, type ReactNode, forwardRef, useState } from 'react'

interface DBInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hata?: string
  icon?: ReactNode
}

export const DBInput = forwardRef<HTMLInputElement, DBInputProps>(
  ({ label, hata, icon, className = '', id, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="db-kucuk text-[#A09080] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              className={[
                'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-150',
                focused ? 'text-[#C9A84C]' : 'text-[#5A5050]',
              ].join(' ')}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            onFocus={(e) => { setFocused(true); onFocus?.(e) }}
            onBlur={(e)  => { setFocused(false); onBlur?.(e)  }}
            className={[
              'w-full h-11 bg-[#1A1A1A] rounded-[10px] px-4 text-[15px] text-[#F0EDE8]',
              'border outline-none transition-all duration-200',
              'placeholder:text-[#5A5050]',
              hata
                ? 'border-[#F44336] shadow-[0_0_0_3px_rgba(244,67,54,0.12)]'
                : focused
                  ? 'border-[rgba(201,168,76,0.65)] shadow-[0_0_0_3px_rgba(201,168,76,0.1)]'
                  : 'border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.35)]',
              icon ? 'pl-10' : '',
              className,
            ].join(' ')}
            {...props}
          />
        </div>
        {hata && (
          <p className="db-kucuk text-[#F44336] flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-[#F44336] shrink-0" />
            {hata}
          </p>
        )}
      </div>
    )
  },
)

DBInput.displayName = 'DBInput'
