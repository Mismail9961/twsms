'use client'

import { useLayoutEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  name: string
  role: string
  quote: string
}

// TODO: replace these samples with real client testimonials before publishing.
const testimonials: Testimonial[] = [
  {
    name: 'Client Name',
    role: 'IT Manager, Retail Company',
    quote: 'The migration was smooth and our team barely noticed the switch.',
  },
  {
    name: 'Client Name',
    role: 'Operations Head, Logistics Firm',
    quote:
      'Their network audit found weak spots we had missed for years. We now know exactly where we stand.',
  },
  {
    name: 'Client Name',
    role: 'Director, Education Group',
    quote:
      'Professional and clear at every step, from design to deployment. No surprises, no delays.',
  },
  {
    name: 'Client Name',
    role: 'Founder, Software House',
    quote: 'Our network has been fast and stable ever since the upgrade.',
  },
  {
    name: 'Client Name',
    role: 'Administrator, Healthcare Clinic',
    quote:
      'Genuine equipment delivered on time, plus honest advice on what we actually needed.',
  },
  {
    name: 'Client Name',
    role: 'CTO, Financial Services',
    quote:
      'Security was our biggest concern and they took it seriously. We feel far safer now.',
  },
]

// Side padding so the first and last cards can sit in the center of the row
const edgePadding = 'max(1.25rem, calc((100% - 80rem) / 2 + 1.25rem))'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null)

  // Always open with the middle testimonial centered in the viewport
  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const centerMiddleCard = () => {
      const card = el.children[Math.floor((testimonials.length - 1) / 2)] as HTMLElement | undefined
      if (!card) return
      el.scrollLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
    }

    centerMiddleCard()

    // Re-center on rotation or resize until the visitor scrolls on their own
    let touched = false
    const markTouched = () => {
      touched = true
    }
    const onResize = () => {
      if (!touched) centerMiddleCard()
    }
    el.addEventListener('pointerdown', markTouched, { once: true })
    el.addEventListener('wheel', markTouched, { once: true, passive: true })
    el.addEventListener('keydown', markTouched, { once: true })
    window.addEventListener('resize', onResize)

    return () => {
      el.removeEventListener('pointerdown', markTouched)
      el.removeEventListener('wheel', markTouched)
      el.removeEventListener('keydown', markTouched)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * 324, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section className="w-full border-y border-[#2C2772]/10 bg-[#2C2772]/[0.04] py-14 text-[#2C2772] sm:py-20 lg:py-24">
      {/* Heading row */}
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <h2 className="text-[1.6rem] font-semibold leading-tight tracking-tight sm:text-4xl">
          In the words of our clients:
        </h2>

        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous testimonials"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2C2772]/20 bg-white text-[#2C2772] transition hover:border-[#2C2772] hover:bg-[#2C2772] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C2772]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next testimonials"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2C2772]/20 bg-white text-[#2C2772] transition hover:border-[#2C2772] hover:bg-[#2C2772] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C2772]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Full-width scroller */}
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Client testimonials"
        tabIndex={0}
        className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2C2772] sm:mt-10 sm:gap-4 [&::-webkit-scrollbar]:hidden"
        style={{ paddingInline: edgePadding }}
      >
        {testimonials.map((item, i) => (
          <figure
            key={i}
            className="flex w-[260px] shrink-0 snap-center flex-col rounded-2xl border border-[#2C2772]/10 bg-white p-5 shadow-sm shadow-[#2C2772]/5 sm:w-[308px]"
          >
            <figcaption className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2C2772] text-sm font-semibold text-white"
              >
                {initials(item.name)}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold text-slate-900">{item.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{item.role}</span>
              </span>
            </figcaption>

            <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">
              “{item.quote}”
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  )
}