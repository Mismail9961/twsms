import type { ReactNode } from 'react'
import Image from 'next/image'

const BRAND_NAME = 'Technology World'
const BRAND_TAGLINE = 'Support & Ticket Management'

function Logo({ size = 'md', onDark = false }: { size?: 'md' | 'xl'; onDark?: boolean }) {
  const box = size === 'xl' ? 'h-[76px] w-[76px] rounded-[20px] p-3' : 'h-11 w-11 rounded-xl p-1.5 sm:h-12 sm:w-12'
  return (
    <div className="relative shrink-0">
      {size === 'xl' && onDark && (
        <div className="absolute -inset-3 rounded-[28px] bg-[#6A63D9]/40 blur-xl" aria-hidden="true" />
      )}
      <div
        className={`${box} relative flex items-center justify-center bg-white ${
          onDark
            ? 'shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/40'
            : 'border border-[#2C2772]/15 shadow-[0_2px_6px_rgba(44,39,114,0.12)]'
        }`}
      >
        <Image
          src="/logo.png"
          alt={`${BRAND_NAME} logo`}
          width={size === 'xl' ? 76 : 48}
          height={size === 'xl' ? 76 : 48}
          className="h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  )
}

const queue = [
  { title: 'Access request', meta: 'Opened today', status: 'Open', dot: 'bg-sky-400' },
  { title: 'Delivery delay', meta: 'Assigned to operations', status: 'In progress', dot: 'bg-amber-400' },
  { title: 'Invoice query', meta: 'Closed this week', status: 'Resolved', dot: 'bg-emerald-400' },
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-screen min-h-dvh w-full flex-col bg-white selection:bg-[#2C2772] selection:text-white lg:flex-row">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-[#2C2772] text-white lg:flex lg:w-[46%] xl:w-1/2">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#6A63D9]/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-16">
          <div className="flex items-center gap-5">
            <Logo size="xl" onDark />
            <div>
              <p className="text-2xl font-semibold leading-tight tracking-tight">{BRAND_NAME}</p>
              <p className="mt-1 text-sm text-white/70">{BRAND_TAGLINE}</p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              Every request, tracked from first report to resolution.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              One place for your organization to raise tickets, follow progress, and stay in step with our operations
              team.
            </p>

            <div className="mt-10 rounded-xl border border-white/15 bg-white/[0.06] p-2 backdrop-blur-sm" aria-hidden="true">
              <ul className="divide-y divide-white/10">
                {queue.map((row) => (
                  <li key={row.title} className="flex items-center justify-between gap-4 px-3.5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{row.title}</p>
                      <p className="mt-0.5 truncate text-xs text-white/60">{row.meta}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white">
                      <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} />
                      {row.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-white/60">
            &copy; {year} {BRAND_NAME}. All rights reserved.
          </p>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {/* Compact brand bar (phones and tablets) */}
        <header className="flex items-center gap-3 bg-[#2C2772] px-4 py-3 text-white sm:gap-4 sm:px-6 sm:py-3.5 lg:hidden">
          <Logo onDark />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight tracking-tight sm:text-base">{BRAND_NAME}</p>
            <p className="truncate text-[11px] text-white/70 sm:text-xs">{BRAND_TAGLINE}</p>
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col">{children}</main>

        <footer className="px-4 pb-6 pt-2 text-center text-[11px] text-[#2C2772]/60 sm:text-xs lg:hidden">
          &copy; {year} {BRAND_NAME}. All rights reserved.
        </footer>
      </div>
    </div>
  )
}