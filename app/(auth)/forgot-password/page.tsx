'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'

const initialState: AuthState = undefined

// 16px text on mobile stops iPhone Safari from zooming in when a field is focused
const inputBase =
  'block w-full min-h-[46px] rounded-lg border bg-white px-3.5 text-[16px] sm:text-sm text-slate-900 ' +
  'placeholder:text-slate-400 shadow-[0_1px_0_rgba(44,39,114,0.04)] transition-colors duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
const inputOk = 'border-slate-300 hover:border-slate-400 focus:border-[#2C2772] focus:ring-[#2C2772]/20'

const linkClass =
  'rounded font-semibold text-[#2C2772] underline decoration-[#2C2772]/30 underline-offset-4 transition-colors hover:decoration-[#2C2772] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772]/40'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

  if (state?.success) {
    return (
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2C2772]/10 text-[#2C2772]">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
          </svg>
        </div>

        <h2 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-2xl">Check your email</h2>
        <p role="status" className="mt-1.5 text-sm leading-relaxed text-slate-500">
          If an eligible account exists, a reset link will be sent. Check your inbox. If you registered with Google,
          use Sign in with Google.
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] leading-snug text-slate-700">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <button type="button" onClick={() => window.location.reload()} className={linkClass}>
            try again
          </button>
          .
        </div>

        <p className="mt-7 text-center text-[13px] text-slate-500">
          <Link href="/login" className={linkClass}>
            &larr; Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-2xl">Forgot password?</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* Error banner */}
      {state?.error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-[13px] leading-snug text-rose-900"
        >
          <svg viewBox="0 0 20 20" className="mt-px h-4 w-4 shrink-0 text-rose-600" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-4a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-slate-700">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            disabled={isPending}
            className={`${inputBase} ${inputOk}`}
            placeholder="you@company.com"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="mt-2 flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-lg bg-[#2C2772] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(44,39,114,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-150 hover:bg-[#241F5E] active:bg-[#1B1747] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#2C2772]/70"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Sending link</span>
            </>
          ) : (
            <span>Send reset link</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-7 text-center text-[13px] text-slate-500">
        Remember your password?{' '}
        <Link href="/login" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </div>
  )
}