'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

export const FAQS_LIST: FAQItem[] = [
  {
    question: 'How do client organizations access support tickets?',
    answer:
      'Clients can sign up directly for a client account or use Google Sign-In. Once authenticated, clients can submit tickets, attach files, review activity history, and chat with assigned engineers.',
  },
  {
    question: 'What roles are supported in the system?',
    answer:
      'TWSMS supports three distinct roles: Clients (who submit and track their tickets), Support Employees/Engineers (who get assigned and work on tickets), and Administrators (who oversee queues, manage categories, employees, and view analytics).',
  },
  {
    question: 'Are file uploads secure?',
    answer:
      'Yes. Files up to 4MB can be attached to tickets. Files are stored securely and can only be downloaded by authenticated users with authorization to view that specific ticket.',
  },
  {
    question: 'Can multiple engineers work on the same ticket?',
    answer:
      'Yes. TWSMS supports multi-employee assignments where support leads can designate a lead engineer while assigning secondary contributors (e.g. backend, frontend, infrastructure).',
  },
  {
    question: 'How does live messaging work?',
    answer:
      'Tickets include live conversation feeds with optimistic updates. Employees can also post internal notes that are strictly hidden from clients for internal team coordination.',
  },
]

export function FAQSection({ faqs = FAQS_LIST }: { faqs?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Got Questions?
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Everything you need to know about Technology World support portal.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm leading-relaxed text-slate-600 border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
