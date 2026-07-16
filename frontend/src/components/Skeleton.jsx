export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="glass-panel p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-16" />
    </div>
  )
}
