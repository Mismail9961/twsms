import { getAchievements } from '@/lib/data/achievements'

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export async function WeeklyAchievements() {
  const achievements = await getAchievements()
  const [featured, ...rest] = achievements
  if (!featured) return null
  const dates = achievements.map(item => item.date).sort()
  const range = `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`

  return (
    <section id="achievements" className="relative bg-[#1d1a52] text-white">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/15" />

      <div className="mx-auto max-w-7xl px-4 py-16 min-[360px]:px-5 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#A9A4FF]">
              <span aria-hidden="true" className="h-px w-8 bg-[#A9A4FF]" />
              Our progress
            </p>
            <h2 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Weekly Achievements
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">
              What our team delivered for clients this week.
            </p>
          </div>

          <p className="text-sm font-medium tabular-nums text-white/50 lg:text-right">{range}</p>
        </div>

        <p className="mt-10 border-y border-white/10 py-6 text-sm text-white/60">
          <span className="mr-3 text-3xl font-semibold text-white">{String(achievements.length).padStart(2, '0')}</span>
          {achievements.length === 1 ? 'Milestone completed' : 'Milestones completed'}
        </p>

        {/* ---------- Featured ---------- */}
        <article className="group mt-12 grid gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06] motion-reduce:transition-none sm:mt-16 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
          <div className="flex items-center gap-3 lg:col-span-3 lg:flex-col lg:items-start lg:justify-between">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#2C2772]">
              Highlight
            </span>
            <p className="text-sm font-medium tabular-nums text-white/50">
              {formatDate(featured.date)} · {featured.category}
            </p>
          </div>

          <div className="lg:col-span-9">
            <h3 className="text-2xl font-semibold leading-[1.2] tracking-tight sm:text-3xl lg:text-4xl">
              {featured.title}
            </h3>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              {featured.description}
            </p>
          </div>
        </article>

        {/* ---------- Remaining achievements ---------- */}
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map(({ date, category, title, description }, i) => (
            <li key={title} className="border-t border-white/15 pt-6">
              <div className="flex items-center justify-between text-xs font-medium tabular-nums">
                <span className="text-[#A9A4FF]">{String(i + 2).padStart(2, '0')}</span>
                <span className="text-white/40">{formatDate(date)}</span>
              </div>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                {category}
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-snug">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}