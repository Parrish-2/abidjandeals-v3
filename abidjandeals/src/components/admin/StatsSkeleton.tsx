// src/components/admin/StatsSkeleton.tsx
export function StatsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* KPIs skeleton */}
      <div>
        <div className="h-4 w-40 bg-white/5 rounded mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/5 border border-white/6"
            />
          ))}
        </div>
      </div>

      {/* Actions rapides skeleton */}
      <div>
        <div className="h-4 w-32 bg-white/5 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-white/5 border border-white/6"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
