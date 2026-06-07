interface DBSkeletonProps {
  className?: string
  rows?: number
  avatar?: boolean
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={['bg-white/5 rounded-xl animate-pulse', className].join(' ')} />
  )
}

export function DBSkeleton({ className = '' }: { className?: string }) {
  return <SkeletonBlock className={className} />
}

export function DBSkeletonCard() {
  return (
    <div className="bg-[#0f0f18] border border-white/6 rounded-2xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-white/5 rounded-lg w-2/3" />
          <div className="h-2.5 bg-white/5 rounded-lg w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-white/5 rounded-lg" />
        <div className="h-2.5 bg-white/5 rounded-lg w-4/5" />
      </div>
    </div>
  )
}

export function DBSkeletonPerformer() {
  return (
    <div className="bg-[#0f0f18] border border-white/6 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-white/5 rounded-lg w-3/4" />
        <div className="h-2.5 bg-white/5 rounded-lg w-1/2" />
      </div>
    </div>
  )
}

export function DBSkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-[#0f0f18] border border-white/6 rounded-2xl p-3.5 flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-white/5 rounded-lg w-1/2" />
            <div className="h-2.5 bg-white/5 rounded-lg w-1/3" />
          </div>
          <div className="h-3 bg-white/5 rounded-lg w-16" />
        </div>
      ))}
    </div>
  )
}
