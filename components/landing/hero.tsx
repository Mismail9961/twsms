import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeftRight,
  Check,
  Gauge,
  Network,
  Server,
  ShieldCheck,
} from 'lucide-react'
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

// Node positions for the topology graphic (viewBox 320 x 220)
const nodes = [
  { x: 48, y: 48 },
  { x: 272, y: 44 },
  { x: 34, y: 130 },
  { x: 286, y: 138 },
  { x: 96, y: 190 },
  { x: 228, y: 190 },
]

export function HeroSection({ user, dashboardHref = '/client' }: HeroSectionProps) {
  const portalHref = user ? dashboardHref : '/login'
  const portalText = user ? 'Go to Your Dashboard' : 'Sign In to Portal'

  return (
    <section className="relative isolate overflow-hidden bg-white text-[#2C2772]">
      {/* Background: soft brand glow + fading dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 85% 10%, rgba(44,39,114,0.10) 0%, rgba(44,39,114,0) 70%), radial-gradient(rgba(44,39,114,0.13) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 24px 24px',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)',
        }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-10 lg:pb-20 lg:pt-24">
        {/* ---------- Copy ---------- */}
        <div className="text-center lg:text-left">
          <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#2C2772]/15 bg-white px-3.5 py-1.5 text-[11px] font-semibold shadow-sm sm:text-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#2C2772] opacity-60 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2C2772]" />
            </span>
            <span>Technology World</span>
          </div>

          <h1 className="mt-5 text-[1.85rem] font-extrabold leading-[1.12] tracking-tight sm:mt-6 sm:text-5xl lg:text-[3.6rem] lg:leading-[1.06]">
            <span>Reliable Network Solutions,</span>{' '}
            <span className="text-[#6A63D9]">From Design to Deployment</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-6 sm:text-lg lg:mx-0">
            Technology World builds network solutions that deliver reliability,
            performance, and security, so your organization can grow with confidence
            on an infrastructure designed around its needs.
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <a
              href="https://technology-world.net.pk/#"
              className="group inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-xl bg-[#2C2772] px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#2C2772]/30 transition hover:bg-[#241f5e] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2772] sm:px-7 sm:text-base"
            >
              <span>Explore Our Services</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-white/25">
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            </a>

            <Link
              href="/contact"
              className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-[#2C2772]/25 bg-white px-6 py-3 text-[15px] font-semibold text-[#2C2772] transition hover:border-[#2C2772] hover:bg-[#2C2772]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2772] sm:px-7 sm:text-base"
            >
              <span>Contact Us</span>
            </Link>
          </div>

          {/* Services */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs sm:mt-9 lg:justify-start">
            {services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-[#2C2772]/15 bg-[#2C2772]/[0.04] px-3 py-1 font-medium text-[#2C2772]"
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
        <div className="relative mx-auto w-full max-w-md pb-2 lg:max-w-none lg:pl-4" aria-hidden="true">
          <div className="absolute inset-x-6 top-0 h-full -translate-y-3 rounded-2xl bg-[#2C2772]/10 sm:inset-x-8" />
          <div className="absolute inset-x-3 top-0 h-full -translate-y-1.5 rounded-2xl bg-[#2C2772]/15 sm:inset-x-4" />

          <div className="relative overflow-hidden rounded-2xl border border-[#2C2772]/15 bg-white shadow-2xl shadow-[#2C2772]/25">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#2C2772]/25" />
                <span className="h-2 w-2 rounded-full bg-[#2C2772]/25" />
                <span className="h-2 w-2 rounded-full bg-[#2C2772]/25" />
              </div>
              <span className="text-[11px] font-medium text-slate-500">Network Solutions</span>
              <span className="w-[26px]" />
            </div>

            {/* Topology graphic */}
            <div className="bg-gradient-to-b from-white to-[#2C2772]/[0.04] p-3 sm:p-5">
              <svg viewBox="0 0 320 220" className="h-auto w-full" role="presentation">
                {nodes.map((n) => (
                  <line
                    key={`${n.x}-${n.y}`}
                    x1="160"
                    y1="108"
                    x2={n.x}
                    y2={n.y}
                    stroke="#2C2772"
                    strokeOpacity="0.28"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                ))}

                {nodes.map((n) => (
                  <g key={`node-${n.x}-${n.y}`}>
                    <circle cx={n.x} cy={n.y} r="13" fill="#ffffff" stroke="#2C2772" strokeOpacity="0.35" strokeWidth="1.5" />
                    <circle cx={n.x} cy={n.y} r="4.5" fill="#6A63D9" />
                  </g>
                ))}

                {/* Core node with pulse */}
                <circle
                  cx="160"
                  cy="108"
                  r="30"
                  fill="#2C2772"
                  fillOpacity="0.15"
                  className="animate-ping motion-reduce:animate-none"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
                <circle cx="160" cy="108" r="26" fill="#2C2772" />
                <circle cx="160" cy="108" r="26" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
                <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none">
                  <path d="M150 108h20" />
                  <path d="M160 98v20" />
                  <circle cx="160" cy="108" r="3" fill="#ffffff" stroke="none" />
                </g>
              </svg>

              {/* Stages */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs font-semibold sm:mt-4">
                {['Design', 'Deployment'].map((stage) => (
                  <span key={stage} className="inline-flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2C2772] text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Floating chips (hidden on small phones) */}
          <div className="absolute -bottom-5 -left-3 hidden items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-xl shadow-[#2C2772]/20 ring-1 ring-[#2C2772]/10 sm:flex lg:-left-8">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2C2772] text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">Network Security</span>
              <span className="block text-[11px] text-slate-500">Protect your data</span>
            </span>
          </div>
          <div className="absolute -right-2 top-16 hidden items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-xl shadow-[#2C2772]/20 ring-1 ring-[#2C2772]/10 sm:flex lg:-right-6">
            <ArrowLeftRight className="h-4 w-4 text-[#2C2772]" />
            <span className="text-xs font-semibold">Seamless Migration</span>
          </div>
        </div>
      </div>

      {/* ---------- Pillars card overlapping a brand band ---------- */}
      <div className="relative pb-6 sm:pb-8">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-1/2 bg-[#2C2772]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 shadow-xl shadow-[#2C2772]/15 ring-1 ring-slate-200 sm:grid-cols-4">
            {pillars.map(({ icon: Icon, value, label }) => (
              <div
                key={value}
                className="flex flex-col items-start gap-2.5 bg-white p-4 sm:flex-row sm:items-center sm:gap-3.5 sm:p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2C2772] text-white sm:h-11 sm:w-11">
                  <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dd className="text-[15px] font-bold leading-tight sm:text-xl">{value}</dd>
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