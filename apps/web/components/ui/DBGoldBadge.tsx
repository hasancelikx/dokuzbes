interface DBGoldBadgeProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'text-[12px] px-2.5 py-1   gap-1',
  md: 'text-[14px] px-3   py-1.5 gap-1.5',
  lg: 'text-[18px] px-4   py-2   gap-2',
}

export function DBGoldBadge({ amount, size = 'md' }: DBGoldBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full bg-[#1A1A1A] border border-[rgba(201,168,76,0.35)]',
        'font-semibold gold-shimmer',
        sizeStyles[size],
      ].join(' ')}
    >
      🪙 {amount.toLocaleString('tr-TR')}
    </span>
  )
}
