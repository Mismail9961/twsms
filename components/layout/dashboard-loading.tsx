export function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      <span className="sr-only">Loading your workspace…</span>
      <div aria-hidden="true" className="h-32 rounded-2xl bg-slate-100 motion-safe:animate-pulse" />
      <div aria-hidden="true" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map(item => <div key={item} className="h-24 rounded-2xl bg-slate-100 motion-safe:animate-pulse" />)}
      </div>
      <div aria-hidden="true" className="h-64 rounded-2xl bg-slate-100 motion-safe:animate-pulse" />
    </div>
  )
}
