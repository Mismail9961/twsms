import Link from 'next/link'
import { ArrowRight, CheckCircle2, Shield, Clock, Zap } from 'lucide-react'
import type { SessionPayload } from '@/lib/auth/session'

interface HeroSectionProps {
  user: SessionPayload | null
  dashboardHref?: string
}

export function HeroSection({ user, dashboardHref = '/client' }: HeroSectionProps) {
  const primaryHref = user ? dashboardHref : '/login'
  const primaryText = user ? 'Go to Your Dashboard' : 'Sign In to Portal'

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 py-16 sm:py-24 lg:py-32">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -top-40 right-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl lg:h-[700px] lg:w-[700px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-48 left-1/2 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-50/80 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Technology World Support Management (TWSMS)</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Streamlined Support &{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Real-Time Resolution
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            A comprehensive support operations platform for Technology World clients,
            dedicated support engineers, and leadership. Track tickets with live status
            history, collaborate via real-time chat, and manage enterprise incidents seamlessly.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={primaryHref}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md sm:w-auto"
            >
              <span>{primaryText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!user && (
              <Link
                href="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
              >
                <span>Create Client Account</span>
              </Link>
            )}
          </div>

          {/* Key Trust Points */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-8 sm:grid-cols-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xl font-bold text-slate-900">&lt; 15 min</span>
              <span className="text-xs text-slate-500">Fast First Response</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Zap className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xl font-bold text-slate-900">Real-Time</span>
              <span className="text-xs text-slate-500">Live Ticket Messaging</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Shield className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xl font-bold text-slate-900">Secure</span>
              <span className="text-xs text-slate-500">Role-Based Access</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xl font-bold text-slate-900">Verified</span>
              <span className="text-xs text-slate-500">Resolution Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
