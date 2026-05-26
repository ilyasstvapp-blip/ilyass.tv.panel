export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse" style={{ background: "var(--surface)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl" style={{ background: "var(--bg-tertiary)" }} />
        <div className="w-16 h-5 rounded-full" style={{ background: "var(--bg-tertiary)" }} />
      </div>
      <div className="h-8 w-24 rounded mb-2" style={{ background: "var(--bg-tertiary)" }} />
      <div className="h-4 w-20 rounded" style={{ background: "var(--bg-tertiary)" }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card p-6 animate-pulse" style={{ background: "var(--surface)" }}>
      <div className="h-6 w-32 rounded mb-6" style={{ background: "var(--bg-tertiary)" }} />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-16 rounded" style={{ background: "var(--bg-tertiary)" }} />
            <div className="flex-1 h-4 rounded" style={{ background: "var(--bg-tertiary)" }} />
            <div className="h-4 w-24 rounded" style={{ background: "var(--bg-tertiary)" }} />
            <div className="h-4 w-20 rounded" style={{ background: "var(--bg-tertiary)" }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton />
    </div>
  )
}
