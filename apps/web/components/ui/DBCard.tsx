import { type HTMLAttributes } from 'react'

interface DBCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function DBCard({ glow, className = '', children, ...props }: DBCardProps) {
  return (
    <div
      className={[
        'bg-[#111111] rounded-[16px] border border-[rgba(201,168,76,0.15)]',
        glow ? 'shadow-[0_0_24px_rgba(201,168,76,0.08)]' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
