export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function SkeletonCard({ className = '', children }) {
  return <div className={`glass p-5 ${className}`} aria-hidden="true">{children}</div>
}

export function PageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-72 max-w-full" />
      <div className="grid gap-5 lg:grid-cols-3">
        <SkeletonCard className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-12 w-60 max-w-full" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </SkeletonCard>
        <SkeletonCard className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-14 w-32" />
          <Skeleton className="h-8 w-full" />
        </SkeletonCard>
      </div>
      <SkeletonCard className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="mx-auto h-24 w-24 !rounded-full" />)}
      </SkeletonCard>
    </div>
  )
}
