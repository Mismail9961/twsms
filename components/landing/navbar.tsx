'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react'
import type { SessionPayload } from '@/lib/auth/session'

interface LandingNavbarProps {
  user?: SessionPayload | null
  dashboardHref?: string
}

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'About Us', href: '/about-us' },
]

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C2772]'

export function LandingNavbar({ user: initialUser, dashboardHref: initialDashboardHref }: LandingNavbarProps) {
  const [visitor, setVisitor] = useState<{ signedIn: boolean; dashboardHref: string } | null>(null)
  const user = initialUser === undefined ? visitor?.signedIn : initialUser
  const dashboardHref = initialDashboardHref ?? visitor?.dashboardHref ?? '/login'

  // Public HTML stays cacheable; account navigation is private and loads after hydration.
  useEffect(() => {
    if (initialUser !== undefined) return
    const controller = new AbortController()
    fetch('/api/auth/session', { cache: 'no-store', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(value => {
        if (value?.signedIn && ['/admin', '/employee', '/client'].includes(value.dashboardHref)) {
          setVisitor(value)
        }
      })
      .catch(() => { /* Sign-in links remain available if the session check fails. */ })
    return () => controller.abort()
  }, [initialUser])
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Deepen the header once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const renderLink = (
    item: (typeof navLinks)[number],
    className: string,
    onClick?: () => void,
    withChevron = false,
  ) => {
    const content = (
      <>
        <span>{item.label}</span>
        {withChevron && <ChevronRight className="h-4 w-4 text-[#2C2772]/50" aria-hidden="true" />}
      </>
    )
    return item.href.startsWith('/') ? (
      <Link key={item.label} href={item.href} className={className} onClick={onClick}>
        {content}
      </Link>
    ) : (
      <a key={item.label} href={item.href} className={className} onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-xl transition-shadow duration-300 motion-reduce:transition-none ${
        scrolled
          ? 'border-[#2C2772]/15 shadow-[0_8px_30px_-12px_rgba(44,39,114,0.25)]'
          : 'border-[#2C2772]/10 shadow-none'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        {/* Brand logo */}
        <Link
          href="/"
          aria-label="Technology World home"
          className={`relative block h-10 w-[136px] shrink-0 rounded sm:h-11 sm:w-[150px] ${focusRing}`}
        >
          <Image
            src="/logo.png"
            alt="Technology World, Empowering the Technology"
            fill
            sizes="150px"
            className="object-cover"
            priority
          />
        </Link>

        {/* Desktop links */}
        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map((item) =>
            renderLink(
              item,
              `rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-[#2C2772]/[0.06] hover:text-[#2C2772] ${focusRing}`,
            ),
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex md:items-center md:gap-2">
          {user ? (
            <Link
              href={dashboardHref}
              className={`group inline-flex items-center gap-2 rounded-xl bg-[#2C2772] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2C2772]/25 transition hover:bg-[#241f5e] ${focusRing}`}
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-[#2C2772] transition-colors hover:bg-[#2C2772]/[0.06] ${focusRing}`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`group inline-flex items-center gap-2 rounded-xl bg-[#2C2772] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2C2772]/25 transition hover:bg-[#241f5e] ${focusRing}`}
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2C2772]/15 text-[#2C2772] transition-colors hover:bg-[#2C2772]/[0.06] md:hidden ${focusRing}`}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel (overlays the page instead of pushing it down) */}
      <div
        id="mobile-menu"
        className={`absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-[#2C2772]/10 bg-white px-4 pb-6 pt-2 shadow-2xl shadow-[#2C2772]/20 transition duration-200 motion-reduce:transition-none md:hidden ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {navLinks.map((item) =>
            renderLink(
              item,
              `flex min-h-12 items-center justify-between border-b border-slate-100 text-[15px] font-medium text-slate-800 transition-colors hover:text-[#2C2772] ${focusRing}`,
              () => setOpen(false),
              true,
            ),
          )}
        </nav>

        <div className="mt-5 flex flex-col gap-2.5">
          {user ? (
            <Link
              href={dashboardHref}
              onClick={() => setOpen(false)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2C2772] px-4 text-sm font-semibold text-white ${focusRing}`}
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2C2772] px-4 text-sm font-semibold text-white shadow-md shadow-[#2C2772]/25 ${focusRing}`}
              >
                <span>Create Client Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={`flex min-h-12 items-center justify-center rounded-xl border border-[#2C2772]/25 px-4 text-sm font-semibold text-[#2C2772] hover:bg-[#2C2772]/5 ${focusRing}`}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
