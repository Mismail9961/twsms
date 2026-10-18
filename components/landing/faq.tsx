'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

export const FAQS_LIST: FAQItem[] = [
  {
    question: 'Who is Technology World?',
    answer:
      'Technology World is a leading network integration company based in Pakistan. We were founded with a vision to empower businesses through technology, and we focus on innovation, quality, and customer satisfaction as a trusted partner for businesses across the country.',
  },
  {
    question: 'What expertise does your team have?',
    answer:
      'Our team comprises seasoned professionals with extensive experience in network infrastructure, cybersecurity, cloud computing, and IT consultancy. We deliver solutions that drive efficiency, productivity, and growth for our clients.',
  },
  {
    question: 'What is your vision?',
    answer:
      'We aim to be the leading provider of network integration solutions in Pakistan, renowned for our innovation, expertise, and commitment to customer satisfaction. We envision a future where every business has access to the technology it needs to succeed and thrive in an increasingly interconnected world.',
  },
  {
    question: 'What is your mission?',
    answer:
      'We build strong, long-term partnerships with our clients based on trust, integrity, and mutual success. We also drive innovation in the technology industry, and we are committed to making a positive difference in the communities we serve through corporate social responsibility and environmental sustainability efforts.',
  },
  {
    question: 'Can your solutions grow with my business?',
    answer:
      'Yes. Businesses come in all shapes and sizes, and their technology needs vary. We offer scalable solutions that grow and adapt alongside our clients, so they stay agile and competitive in a rapidly changing marketplace.',
  },
  {
    question: 'How do you maintain quality?',
    answer:
      'Quality is non-negotiable in everything we deliver. Whether it is the products we supply or the services we provide, we maintain the highest standards so our clients receive reliable, efficient, and effective solutions.',
  },
  {
    question: 'Why do businesses trust Technology World?',
    answer:
      'We forge long-term partnerships built on trust, integrity, and mutual success, and we deliver cutting-edge technology solutions that help businesses reach greater heights.',
  },
]

/* ---------- Background patterns (white on indigo) ---------- */

const dotGrid: React.CSSProperties = {
  backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1.2px)',
  backgroundSize: '24px 24px',
  opacity: 0.13,
  WebkitMaskImage:
    'radial-gradient(ellipse 90% 60% at 50% 20%, #000 30%, transparent 100%)',
  maskImage:
    'radial-gradient(ellipse 90% 60% at 50% 20%, #000 30%, transparent 100%)',
}

const hatch: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(135deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 14px)',
  opacity: 0.06,
  WebkitMaskImage: 'linear-gradient(to right, #000, transparent)',
  maskImage: 'linear-gradient(to right, #000, transparent)',
}

const glow: React.CSSProperties = {
  background:
    'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.16), transparent 70%)',
}

function Rings({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={className}
    >
      <circle cx="200" cy="200" r="40" />
      <circle cx="200" cy="200" r="70" />
      <circle cx="200" cy="200" r="100" />
      <circle cx="200" cy="200" r="130" />
      <circle cx="200" cy="200" r="160" />
    </svg>
  )
}

export function FAQSection({ faqs = FAQS_LIST }: { faqs?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section
      id="faq"
      className="relative isolate scroll-mt-20 overflow-hidden bg-[#2c2772] py-16 sm:py-24 lg:py-28"
    >
      {/* Section background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96" style={glow} />
        <div className="absolute inset-0" style={dotGrid} />
        <div className="absolute inset-y-0 left-0 w-2/3 sm:w-1/3" style={hatch} />
        <Rings className="absolute -right-16 -top-16 h-64 w-64 text-white opacity-[0.12] sm:h-96 sm:w-96" />
        <Rings className="absolute -bottom-20 -left-20 h-56 w-56 rotate-180 text-white opacity-[0.08] sm:h-80 sm:w-80" />
      </div>

      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Heading */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 className="font-serif text-[2rem] font-semibold leading-[1.1] tracking-tight text-white min-[375px]:text-[2.35rem] sm:text-5xl">
                Frequently Asked Questions
              </h2>
              <div className="mt-5 h-[3px] w-14 rounded-full bg-white sm:mt-6" />
              <p className="mt-5 text-sm leading-relaxed text-white/75 sm:text-base sm:leading-7">
                Answers to common questions about Technology World, our team, and how we work with businesses.
              </p>
            </div>
          </div>

          {/* Accordion */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-7 xl:col-span-8">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              const panelId = `faq-panel-${index}`
              const buttonId = `faq-button-${index}`
              return (
                <div
                  key={faq.question}
                  className={`relative overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-20px_rgba(8,6,40,0.65)] transition-shadow duration-300 motion-reduce:transition-none ${
                    isOpen ? 'ring-2 ring-white/40' : ''
                  }`}
                >
                  {/* Accent bar */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-1 bg-[#2c2772] transition-opacity duration-300 motion-reduce:transition-none sm:w-1.5 ${
                      isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      onClick={() => toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2c2772] sm:gap-5 sm:px-7 sm:py-5"
                    >
                      <span className="min-w-0 break-words text-[0.95rem] font-semibold leading-snug text-[#2c2772] min-[375px]:text-base sm:text-lg">
                        {faq.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 motion-reduce:transition-none ${
                          isOpen
                            ? 'rotate-180 border-[#2c2772] bg-[#2c2772] text-white'
                            : 'border-[#2c2772]/25 bg-[#2c2772]/5 text-[#2c2772]'
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="mx-4 border-t border-[#2c2772]/10 pb-5 pt-4 text-sm leading-relaxed text-[#2c2772]/75 sm:mx-7 sm:pb-6 sm:text-base sm:leading-7">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}