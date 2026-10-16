import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from 'lucide-react'
import { getSession, dashboardPathForRole } from '@/lib/auth/session'
import { LandingNavbar } from '@/components/landing/navbar'
import { LandingFooter } from '@/components/landing/footer'

export interface LegalSection {
  id: string
  title: string
  content: ReactNode
}

interface LegalPageProps {
  kind: 'privacy' | 'terms'
  title: string
  introduction: string
  summary: string
  sections: LegalSection[]
}

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A63D9]'

export async function LegalPage({ kind, title, introduction, summary, sections }: LegalPageProps) {
  const session = await getSession()
  const Icon = kind === 'privacy' ? ShieldCheck : FileText
  const related = kind === 'privacy'
    ? { title: 'Terms & Conditions', href: '/terms', description: 'The guidelines for using our support portal.' }
    : { title: 'Privacy Policy', href: '/privacy', description: 'How information is handled across our portal.' }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFD] font-sans text-[#2C2772]">
      <a href="#legal-content" className={`sr-only z-[60] rounded-lg bg-white p-4 focus:fixed focus:left-4 focus:top-4 focus:not-sr-only ${focus}`}>
        Skip to policy content
      </a>
      <LandingNavbar user={session} dashboardHref={session ? dashboardPathForRole(session.role) : '/login'} />
      <main className="flex-1">
        <div className="relative isolate overflow-hidden border-b border-[#2C2772]/10 bg-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: 'radial-gradient(ellipse at 90% 10%, #eeecff 0%, transparent 65%), radial-gradient(#2c277212 1px, transparent 1px)', backgroundSize: '100% 100%, 24px 24px' }} />
          <div className="mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-8 sm:pb-16 sm:pt-9 lg:px-10">
            <Link href="/" className={`inline-flex min-h-11 items-center gap-2 rounded text-xs font-medium text-slate-600 transition hover:text-[#2C2772] ${focus}`}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to home
            </Link>
            <div className="mt-7 flex items-center gap-3 sm:mt-10">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#2C2772]/10 bg-[#F2F0FF]">
                <Icon className="h-5 w-5 text-[#6A63D9]" aria-hidden="true" />
              </span>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#6A63D9] sm:text-xs">Technology World / Legal</p>
            </div>
            <h1 className="mt-5 max-w-3xl text-[2.25rem] font-semibold leading-[1.12] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-lg sm:leading-8">{introduction}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
              <span>Last updated <time dateTime="2026-10-16" className="font-medium text-[#2C2772]">16 October 2026</time></span>
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#6A63D9]" />Technology World Support Portal</span>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 sm:py-14 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16 lg:px-10">
          <aside className="min-w-0">
            <nav aria-label="On this page" className="rounded-2xl border border-[#2C2772]/10 bg-white p-5 lg:sticky lg:top-24">
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">On this page</p>
              <ol className="grid sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-1">
                {sections.map((section, index) => (
                  <li key={section.id} className="min-w-0">
                    <a href={`#${section.id}`} className={`group flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-xs leading-5 text-slate-600 transition hover:bg-[#F4F3FF] hover:text-[#2C2772] ${focus}`}>
                      <span className="shrink-0 font-mono text-[10px] text-[#8B85B8]">{String(index + 1).padStart(2, '0')}</span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article id="legal-content" className="min-w-0 scroll-mt-24">
            <div className="mb-3 rounded-2xl border border-[#2C2772]/10 bg-[#F0EEFC] p-5 sm:p-7">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6A63D9]">At a glance</p>
              <p className="mt-3 text-sm leading-7 text-[#39346F] sm:text-base">{summary}</p>
            </div>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24 border-b border-[#2C2772]/10 py-7 sm:py-9">
                <div className="mb-4 flex items-start gap-3 sm:gap-4">
                  <span className="mt-1.5 shrink-0 font-mono text-xs text-[#8B85B8]">{String(index + 1).padStart(2, '0')}</span>
                  <h2 id={`${section.id}-heading`} className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">{section.title}</h2>
                </div>
                <div className="space-y-4 break-words text-sm leading-7 text-slate-600 sm:pl-8 sm:text-[15px] [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_strong]:font-semibold [&_strong]:text-slate-800 [&_a]:rounded [&_a]:font-medium [&_a]:text-[#5147AB] [&_a]:underline [&_a]:underline-offset-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#6A63D9]">
                  {section.content}
                </div>
              </section>
            ))}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#2C2772] p-6 text-white sm:p-7">
                <p className="text-lg font-semibold">Let’s make it clear.</p>
                <p className="mt-2 text-sm leading-6 text-white/75">Have a question about this {kind === 'privacy' ? 'policy' : 'document'}? Get in touch with our team.</p>
                <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-lg border border-white/30 px-4 text-sm font-medium transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Contact us <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
              <Link href={related.href} className={`group flex min-w-0 flex-col justify-between gap-6 rounded-2xl border border-[#2C2772]/10 bg-white p-6 transition hover:border-[#6A63D9]/50 hover:shadow-lg hover:shadow-[#2C2772]/5 sm:p-7 ${focus}`}>
                <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Related document</p><p className="mt-3 text-lg font-semibold">{related.title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{related.description}</p></div>
                <ArrowRight className="h-5 w-5 text-[#6A63D9]" aria-hidden="true" />
              </Link>
            </div>
            <a href="#" className={`mt-7 inline-flex min-h-11 items-center rounded text-xs font-medium text-slate-500 hover:text-[#2C2772] ${focus}`}>Back to top ↑</a>
          </article>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
