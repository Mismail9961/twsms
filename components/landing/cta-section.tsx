import Link from 'next/link'
import { ArrowRight, Headphones } from 'lucide-react'

export function CTASection({ user, dashboardHref = '/client' }: { user?: unknown; dashboardHref?: string }) {
  const ctaHref = user ? dashboardHref : '/signup'
  const ctaText = user ? 'Return to Dashboard' : 'Create a Client Account'

  return (
    <section className="border-t border-slate-200 bg-slate-900 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
            <Headphones className="h-6 w-6" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to experience reliable technical support?
          </h2>
          <p className="mt-4 text-base text-slate-300">
            Join Technology World clients who resolve problems faster with dedicated engineers.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ctaHref}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 sm:w-auto"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!user && (
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-base font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white sm:w-auto"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
