'use client'

import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react'

interface DBInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hata?: string
  icon?: ReactNode
}

export const DBInput = forwardRef<HTMLInputElement, DBInputProps>(
  ({ label, hata, icon, className = '', id, ...props }, ref) => {
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5050]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full h-11 bg-[#1A1A1A] rounded-[10px] px-4 text-[15px] text-[#F0EDE8]',
              'border transition-all duration-150 outline-none',
              hata
                ? 'border-[#F44336]'
                : 'border-[rgba(201,168,76,0.25)] focus:border-[rgba(201,168,76,0.6)]',
              icon ? 'pl-10' : '',
              'placeholder:text-[#5A5050]',
              className,
            ].join(' ')}
            {...props}
          />
        </div>
        {hata && <p className="db-kucuk text-[#F44336]">{hata}</p>}
      </div>
    )
  },
)

DBInput.displayName = 'DBInput'
