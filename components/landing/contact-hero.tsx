import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ContactHeroProps {
  title?: string
  description?: string
  contactHref?: string
  /** Image shown inside the glowing portal. Swap for any dark, techy photo. */
  imageUrl?: string
}

const BRAND = '#2C2772'

export function ContactHero({
  title = 'Go further with support that never slows down.',
  description = 'Talk to our team about tickets, incidents, or a custom support setup. We reply fast and stay with you until it is resolved.',
  contactHref = '/contact',
  imageUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
}: ContactHeroProps) {
  return (
    <section
      className="relative isolate overflow-hidden text-white"
      style={{
        backgroundColor: BRAND,
        backgroundImage: `radial-gradient(60% 70% at 80% 40%, rgba(255,255,255,0.14) 0%, rgba(44,39,114,0) 60%), linear-gradient(135deg, #1b1748 0%, ${BRAND} 55%, #3a3490 100%)`,
      }}
    >
      {/* Soft background photo, heavily tinted so text stays readable */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.12] mix-blend-luminosity"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:px-10 lg:py-28">
        {/* Copy */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <h2 className="text-[1.75rem] font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:mt-6 sm:text-lg lg:mx-0">
            {description}
          </p>

          <div className="mt-7 sm:mt-9">
            <Link
              href={contactHref}
              className="group inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full bg-white px-7 py-3 text-base font-semibold shadow-lg shadow-black/20 transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
              style={{ color: BRAND }}
            >
              <span>Contact Us</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </div>
        </div>

        {/* Portal visual */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end lg:pr-6">
          <div className="relative aspect-square w-[210px] sm:w-[340px] lg:w-[440px]">
            {/* Outer dashed orbit */}
            <div
              aria-hidden="true"
              className="absolute -inset-[8%] rounded-full border border-dashed border-white/30 animate-[spin_60s_linear_infinite_reverse] motion-reduce:animate-none"
            />

            {/* Glow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full opacity-70 blur-2xl animate-[spin_24s_linear_infinite] motion-reduce:animate-none"
              style={{
                background:
                  'conic-gradient(from 0deg, #ffffff, #8f8ae6, #2C2772, #c9c6ff, #ffffff)',
              }}
            />

            {/* Sharp ring */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full animate-[spin_24s_linear_infinite] motion-reduce:animate-none"
              style={{
                background:
                  'conic-gradient(from 0deg, #ffffff, #8f8ae6, #2C2772, #c9c6ff, #ffffff)',
                WebkitMask:
                  'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))',
              }}
            />

            {/* Image inside portal */}
            <div
              role="img"
              aria-label="Abstract technology circuitry"
              className="absolute inset-[5%] overflow-hidden rounded-full bg-cover bg-center ring-1 ring-white/20"
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(160deg, rgba(44,39,114,0.15) 0%, rgba(44,39,114,0.75) 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}