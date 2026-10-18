import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'


type IconProps = { className?: string }

// Inline brand icons (newer lucide-react versions no longer ship brand logos)
function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

const WEBSITE = 'https://twsms.vercel.app/  '

const navigate = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Portal Sign In', href: '/login' },
]

const services = [
  'Network Migration',
  'Network Audit',
  'Network Security',
  'Network Supplies',
]

// Add your real profile URLs here. Entries with an empty href are hidden.
const socials = [
  { label: 'Instagram', href: '', icon: InstagramIcon },
  { label: 'Facebook', href: '', icon: FacebookIcon },
  { label: 'LinkedIn', href: '', icon: LinkedinIcon },
]

const legal = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

const mono = 'font-mono text-[10px] uppercase tracking-[0.18em] sm:text-[11px]'
const linkClass =
  'inline-block py-1.5 text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded'

function ColumnHeading({ index, title }: { index: string; title: string }) {
  return (
    <h3 className={`${mono} font-semibold`}>
      <span className="text-[#A9A4F5]">{index}</span>{' '}
      <span className="text-white/60">{title}</span>
    </h3>
  )
}

export function LandingFooter() {
  const currentYear = new Date().getFullYear()
  const visibleSocials = socials.filter((s) => s.href)

  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{ backgroundImage: 'linear-gradient(180deg, #2C2772 0%, #1a1650 55%, #12103a 100%)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Top bar */}
        <div className="flex flex-col gap-2 border-b border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className={`${mono} text-white/55`}>
            Technology World <span className="mx-1.5 text-white/30">/</span>
            <span className="text-[#A9A4F5]">Empowering the Technology</span>
          </p>
          <p className={`${mono} inline-flex items-center gap-2 text-white`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#A9A4F5] opacity-60 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#A9A4F5]" />
            </span>
            Systems Operational
          </p>
        </div>

        {/* Main grid */}
        <div className="grid gap-12 pb-12 pt-10 sm:pt-12 lg:grid-cols-[1.25fr_1fr_1fr_1fr] lg:gap-10">
          {/* Tagline + socials */}
          <div>
            <p className="max-w-xs text-xl font-bold leading-snug tracking-tight sm:text-2xl">
              Reliable networks.
              <br />
              From design to deployment<span className="text-[#A9A4F5]">.</span>
            </p>

            {visibleSocials.length > 0 && (
              <ul className="mt-6 flex gap-2.5">
                {visibleSocials.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:contents">
            <nav aria-label="Navigate">
              <ColumnHeading index="01" title="Navigate" />
              <ul className="mt-4">
                {navigate.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith('/') ? (
                      <Link href={item.href} className={linkClass}>
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className={linkClass}>
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Services">
              <ColumnHeading index="02" title="Services" />
              <ul className="mt-4">
                {services.map((service) => (
                  <li key={service}>
                    <a href={WEBSITE} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="col-span-2 lg:col-span-1">
              <ColumnHeading index="03" title="Start here" />
              <ul className="mt-4">
                <li>
                  <Link href="/signup" className={linkClass}>
                    Create a client account
                  </Link>
                </li> 
              </ul>

              <Link
                href="/contact"
                className={`${mono} group mt-5 inline-flex min-h-12 w-full items-center justify-between gap-4 border border-white/30 px-5 font-semibold text-white transition hover:bg-white hover:text-[#2C2772] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto sm:min-w-52.5`}
              >
                <span>Contact Us</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wordmark + meta */}
        <div className="flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-end lg:justify-between lg:pt-10">
          <p
            aria-hidden="true"
            className="select-none bg-linear-to-b from-white via-white/85 to-white/20 bg-clip-text text-[12vw] font-extrabold uppercase leading-[0.88] tracking-tighter text-transparent sm:text-[11vw] lg:text-[7.5rem] xl:text-[8.5rem]"
          >
            Technology
            <br />
            World
          </p>

          <div className={`${mono} space-y-2 text-left lg:pb-3 lg:text-right`}>
            <p className="text-[#A9A4F5]">Where networks run reliably.</p>
            <p className="text-white/45">© {currentYear} Technology World</p>
            <p className="text-white/45">All rights reserved</p>
          </div>
        </div>

        {/* Legal */}
        <ul className="flex flex-wrap gap-x-6 gap-y-1 py-6 text-xs text-white/50">
          {legal.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="inline-block py-1 transition-colors hover:text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
