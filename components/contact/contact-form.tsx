'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'

const serviceOptions = [
  'Network Migration',
  'Network Audit',
  'Network Security',
  'Network Supplies',
  'Something else',
]

type Status = 'idle' | 'submitting' | 'success' | 'error'
type Errors = Partial<Record<'name' | 'email' | 'message', string>>

// 16px text on inputs stops iPhone Safari from zooming in when a field is focused
const inputClass =
  'w-full min-h-12 rounded-xl border border-[#2C2772]/20 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 transition focus-visible:border-[#2C2772] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2C2772]/10 aria-[invalid=true]:border-red-500'

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-[#2C2772]">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-slate-400">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Errors>({})

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>

    const nextErrors: Errors = {}
    if (!data.name?.trim()) nextErrors.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email?.trim() ?? ''))
      nextErrors.email = 'Please enter a valid email address.'
    if ((data.message?.trim().length ?? 0) < 10)
      nextErrors.message = 'Please tell us a little more (at least 10 characters).'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Request failed')
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2C2772] text-white">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-[#2C2772] sm:text-2xl">Message sent</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
          Thank you for reaching out. Our team will review your message and get back to you.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 min-h-12 rounded-xl border border-[#2C2772]/25 px-6 text-sm font-semibold text-[#2C2772] transition hover:bg-[#2C2772]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C2772]"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 sm:space-y-5">
      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Field id="name" label="Full name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Field id="phone" label="Phone" optional>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Phone number"
            className={inputClass}
          />
        </Field>
        <Field id="company" label="Company" optional>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Company name"
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="service" label="What do you need help with?" optional>
        <div className="relative">
          <select id="service" name="service" defaultValue="" className={`${inputClass} appearance-none pr-11`}>
            <option value="">Select a service</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2C2772]/60"
            aria-hidden="true"
          />
        </div>
      </Field>

      <Field id="message" label="Message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us about your network and what you need."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={`${inputClass} min-h-32 resize-y py-3`}
        />
      </Field>

      <div aria-live="polite">
        {status === 'error' && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Something went wrong while sending your message. Please try again in a moment.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="group flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#2C2772] px-6 text-base font-semibold text-white shadow-lg shadow-[#2C2772]/25 transition hover:bg-[#241f5e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2772] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <span>Send Message</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}