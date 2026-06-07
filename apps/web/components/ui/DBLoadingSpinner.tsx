interface DBLoadingSpinnerProps {
  size?: number
  className?: string
}

export function DBLoadingSpinner({ size = 32, className = '' }: DBLoadingSpinnerProps) {
  return (
    <span
      className={['inline-block rounded-full border-2 border-[#C9A84C40] border-t-[#C9A84C] animate-spin', className].join(' ')}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Yükleniyor"
    />
  )
}
