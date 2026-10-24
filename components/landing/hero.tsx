import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { SessionPayload } from '@/lib/auth/session'
import WebThreads from '@/components/backgrounds/WebThreads'

interface HeroSectionProps {
  user: SessionPayload | null
  dashboardHref?: string
}

export function HeroSection({ user, dashboardHref = '/client' }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-white text-[#2c2772]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-white">
        <WebThreads
          colors={['#2c2772', '#2c2772']}
          coreColor="#2c2772"
          lightMode
          threadCount={6}
          spread={0.18}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.65)_35%,rgba(255,255,255,0)_75%)]" />

      <div className="mx-auto flex min-h-[750px] max-w-7xl flex-col items-center justify-center px-5 py-24 text-center sm:min-h-[850px] sm:px-8 sm:py-28 lg:min-h-[950px] lg:py-32">
        <p className="inline-flex items-center gap-2.5 rounded-full border border-[#2c2772]/15 bg-white/80 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#2c2772] sm:text-xs">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#2c2772]" />
          Technology World · Connected possibilities
        </p>

        <h1 id="hero-heading" className="mt-7 max-w-5xl text-[clamp(2.6rem,6.5vw,6rem)] font-semibold leading-[1.04] tracking-[-0.055em]">
          Your next chapter.
          <span className="mt-1 block text-[#2c2772]/70">
            Better connected.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#2c2772]/75 sm:text-lg">
          From network design to cybersecurity, we build the technology
          that keeps your business connected, protected and ready for what’s next.
        </p>

        <div className="mt-9 flex w-full max-w-md flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
          <a href="#services" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#2c2772] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2c2772]/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2772]">
            Explore our solutions
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
          </a>
          <Link href="/contact" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#2c2772]/25 bg-white/80 px-7 py-3.5 text-sm font-medium transition hover:border-[#2c2772] hover:bg-[#2c2772]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2772]">
            Let’s talk
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </Link>
        </div>

        <p className="mt-7 text-xs text-[#2c2772]/60 sm:text-sm">
          Already connected?{' '}
          <Link href={user ? dashboardHref : '/login'} className="text-[#2c2772] underline decoration-[#2c2772]/40 underline-offset-4 hover:text-[#2c2772]/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2772]">
            {user ? 'Open your dashboard' : 'Sign in to your portal'}
          </Link>
        </p>
      </div>

    </section>
  )
}
