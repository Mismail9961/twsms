import Link from 'next/link'
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  ClipboardCheck,
  Gauge,
  Network,
  Package,
  Server,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SessionPayload } from '@/lib/auth/session'

interface HeroSectionProps {
  user: SessionPayload | null
  dashboardHref?: string
}

const pillars = [
  { icon: Server, value: 'Reliability', label: 'Networks you can depend on' },
  { icon: Gauge, value: 'Performance', label: 'Fast, efficient infrastructure' },
  { icon: ShieldCheck, value: 'Security', label: 'Your data, protected' },
  { icon: Network, value: 'End to End', label: 'From design to deployment' },
]

const services = ['Network Migration', 'Network Audit', 'Network Security', 'Network Supplies']

/* ------------------------------------------------------------------ */
/* Network visual: dark glass panel, one node per service              */
/* ------------------------------------------------------------------ */
const VB_W = 400
const VB_H = 340
const CORE = { x: 200, y: 170 }

const serviceNodes: { icon: LucideIcon; label: string; x: number; y: number; delay: string }[] = [
  { icon: ArrowLeftRight, label: 'Migration', x: 70, y: 72, delay: '0s' },
  { icon: ClipboardCheck, label: 'Audit', x: 330, y: 72, delay: '0.8s' },
  { icon: ShieldCheck, label: 'Security', x: 70, y: 268, delay: '1.6s' },
  { icon: Package, label: 'Supplies', x: 330, y: 268, delay: '2.4s' },
]

const pct = (value: number, total: number) => `${(value / total) * 100}%`

function NetworkVisual() {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-md pb-2 lg:max-w-none lg:pl-4" aria-hidden="true">
      {/* Soft glow behind the panel */}
      <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#6A63D9]/35 via-[#2C2772]/10 to-transparent blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#2C2772] via-[#241f5e] to-[#17133f] shadow-2xl shadow-[#2C2772]/40 ring-1 ring-[#2C2772]/40">
        {/* Top sheen */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.04] px-3.5 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white ring-1 ring-white/15">
              <Network className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-semibold tracking-wide text-white/90 sm:text-xs">Network Solutions</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25 sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Operational
          </span>
        </div>

        {/* Diagram */}
        <div className="relative">
          {/* Fine grid, fading toward the edges */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)',
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6A63D9]/25 blur-3xl" />

          <div className="relative w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" role="presentation" fill="none">
              {/* Orbits */}
              <circle cx={CORE.x} cy={CORE.y} r="62" stroke="#ffffff" strokeOpacity="0.10" strokeDasharray="2 6" />
              <circle cx={CORE.x} cy={CORE.y} r="118" stroke="#ffffff" strokeOpacity="0.07" />

              {/* Links */}
              {serviceNodes.map((n) => (
                <line
                  key={`link-${n.label}`}
                  x1={CORE.x}
                  y1={CORE.y}
                  x2={n.x}
                  y2={n.y}
                  stroke="#ffffff"
                  strokeOpacity="0.22"
                  strokeWidth="1.25"
                />
              ))}

              {/* Data packets travelling out from the core */}
              <g className="motion-reduce:hidden" fill="#A9A4FF">
                {serviceNodes.map((n) => (
                  <circle key={`packet-${n.label}`} r="3" opacity="0.95">
                    <animateMotion
                      dur="3.2s"
                      begin={n.delay}
                      repeatCount="indefinite"
                      path={`M${CORE.x} ${CORE.y} L${n.x} ${n.y}`}
                    />
                  </circle>
                ))}
              </g>
            </svg>

            {/* Service nodes (HTML, positioned by percentage so they scale with the panel) */}
            {serviceNodes.map(({ icon: Icon, label, x, y }) => (
              <div
                key={label}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={{ left: pct(x, VB_W), top: pct(y, VB_H) }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-lg shadow-black/20 ring-1 ring-white/20 backdrop-blur sm:h-12 sm:w-12">
                  <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                </span>
                <span className="text-[10px] font-semibold text-white/85 sm:text-xs">{label}</span>
              </div>
            ))}

            {/* Core */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pct(CORE.x, VB_W), top: pct(CORE.y, VB_H) }}
            >
              <span className="absolute inset-0 rounded-2xl bg-[#6A63D9]/50 animate-ping motion-reduce:animate-none" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F89F0] to-[#6A63D9] text-white shadow-xl shadow-[#6A63D9]/50 ring-1 ring-white/40 sm:h-[4.5rem] sm:w-[4.5rem]">
                <Network className="h-6 w-6 sm:h-8 sm:w-8" />
              </span>
            </div>
          </div>
        </div>

        {/* Footer: stages */}
        <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-white/10 bg-white/[0.04] px-3 py-3 text-[11px] font-semibold text-white sm:gap-x-4 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6A63D9] text-white">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            Design
          </span>
          <ArrowRight className="h-3 w-3 text-white/50" />
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6A63D9] text-white">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            Deployment
          </span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Premium background (decorative only, sits behind all content)       */
/* ------------------------------------------------------------------ */
function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* 1. Base wash: cool tint at the top fading to white */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F1F1FB] via-white to-white" />

      {/* 2. Soft brand glows (smaller on phones so they never cause overflow) */}
      <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#6A63D9]/25 blur-3xl sm:-right-20 sm:h-[26rem] sm:w-[26rem] lg:-right-28 lg:-top-36 lg:h-[34rem] lg:w-[34rem]" />
      <div className="absolute -left-28 top-[38%] h-56 w-56 rounded-full bg-[#2C2772]/15 blur-3xl sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]" />
      <div className="absolute bottom-10 right-1/4 hidden h-64 w-64 rounded-full bg-[#6A63D9]/10 blur-3xl lg:block" />

      {/* 3. Fine engineering grid, fading out toward the edges and bottom */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(44,39,114,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(44,39,114,0.07) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 70% 25%, #000 20%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse 80% 70% at 70% 25%, #000 20%, transparent 75%)',
        }}
      />

      {/* 4. Network line-art: arcs and nodes, anchored top-right */}
      <svg
        className="absolute right-0 top-0 h-full w-full opacity-70 sm:opacity-100"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMaxYMin slice"
        fill="none"
      >
        <g stroke="#2C2772" strokeOpacity="0.10" strokeWidth="1.2">
          <path d="M800 40 C 620 60, 560 200, 400 220 S 160 330, 0 300" />
          <path d="M800 140 C 660 150, 600 280, 460 300 S 240 420, 80 420" />
          <path d="M800 260 C 700 270, 650 360, 540 380 S 360 480, 240 520" />
          <circle cx="560" cy="130" r="150" strokeDasharray="3 7" />
          <circle cx="560" cy="130" r="230" strokeDasharray="2 9" strokeOpacity="0.07" />
        </g>
        <g fill="#6A63D9" fillOpacity="0.35">
          <circle cx="400" cy="220" r="3.5" />
          <circle cx="460" cy="300" r="3" />
          <circle cx="620" cy="60" r="3" />
          <circle cx="540" cy="380" r="3.5" />
        </g>
      </svg>

      {/* 5. Brand hairline at the very top for a crisp, finished edge */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2C2772] via-[#6A63D9] to-[#2C2772]" />

      {/* 6. Bottom fade so the background melts into the pillars band */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}

export function HeroSection({ user, dashboardHref = '/client' }: HeroSectionProps) {
  const portalHref = user ? dashboardHref : '/login'
  const portalText = user ? 'Go to Your Dashboard' : 'Sign In to Portal'

  return (
    <section className="relative isolate overflow-hidden bg-white text-[#2C2772]">
      <HeroBackground />

      {/* px-4 keeps content comfortable on 320px screens (iPhone 5s / SE 1st gen) */}
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-8 min-[360px]:px-5 sm:gap-12 sm:px-8 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-10 lg:pb-20 lg:pt-24">
        {/* ---------- Copy ---------- */}
        <div className="min-w-0 text-center lg:text-left">
          <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#2C2772]/15 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur sm:text-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#2C2772] opacity-60 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2C2772]" />
            </span>
            <span>Technology World</span>
          </div>

          <h1 className="mt-5 text-[1.6rem] font-extrabold leading-[1.14] tracking-tight min-[360px]:text-[1.85rem] sm:mt-6 sm:text-5xl lg:text-[3.6rem] lg:leading-[1.06]">
            <span>Reliable Network Solutions,</span>{' '}
            <span className="text-[#6A63D9]">From Design to Deployment</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-[13.5px] leading-relaxed text-slate-600 min-[360px]:text-sm sm:mt-6 sm:text-lg lg:mx-0">
            Technology World builds network solutions that deliver reliability,
            performance, and security, so your organization can grow with confidence
            on an infrastructure designed around its needs.
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <a
              href="https://technology-world.net.pk/#"
              className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-[#2C2772] px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#2C2772]/30 transition hover:bg-[#241f5e] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2772] sm:px-7 sm:text-base"
            >
              <span>Explore Our Services</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-white/25">
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            </a>

            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[#2C2772]/25 bg-white/80 px-5 py-3 text-[15px] font-semibold text-[#2C2772] backdrop-blur transition hover:border-[#2C2772] hover:bg-[#2C2772]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2772] sm:px-7 sm:text-base"
            >
              <span>Contact Us</span>
            </Link>
          </div>

          {/* Services */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-1.5 text-[11px] min-[360px]:gap-2 min-[360px]:text-xs sm:mt-9 lg:justify-start">
            {services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-[#2C2772]/15 bg-white/70 px-2.5 py-1 font-medium text-[#2C2772] backdrop-blur min-[360px]:px-3"
              >
                {service}
              </span>
            ))}
          </div>

          {/* Portal access (kept for existing clients) */}
          <p className="mt-6 text-xs text-slate-500 sm:text-sm">
            Already a client?{' '}
            <Link
              href={portalHref}
              className="font-semibold text-[#2C2772] underline decoration-[#2C2772]/30 underline-offset-4 transition hover:decoration-[#2C2772]"
            >
              {portalText}
            </Link>
          </p>
        </div>

        {/* ---------- Network visual ---------- */}
        <NetworkVisual />
      </div>

      {/* ---------- Pillars card overlapping a brand band ---------- */}
      <div className="relative pb-6 sm:pb-8">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-b from-[#2C2772] to-[#1d1a52]" />
        <div className="relative mx-auto max-w-7xl px-4 min-[360px]:px-5 sm:px-8 lg:px-10">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 shadow-xl shadow-[#2C2772]/15 ring-1 ring-slate-200 sm:grid-cols-4">
            {pillars.map(({ icon: Icon, value, label }) => (
              <div
                key={value}
                className="flex flex-col items-start gap-2.5 bg-white p-3.5 min-[360px]:p-4 sm:flex-row sm:items-center sm:gap-3.5 sm:p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2C2772] text-white sm:h-11 sm:w-11">
                  <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dd className="break-words text-sm font-bold leading-tight min-[360px]:text-[15px] sm:text-xl">{value}</dd>
                  <dt className="mt-0.5 text-[11px] leading-snug text-slate-500 sm:text-xs">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}