'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { verifyEmail, resendVerification } from '@/app/actions/auth'

// 16px text on mobile stops iPhone Safari from zooming in when a field is focused
const inputBase =
  'block w-full min-h-[46px] rounded-lg border bg-white px-3.5 text-[16px] sm:text-sm text-slate-900 ' +
  'placeholder:text-slate-400 shadow-[0_1px_0_rgba(44,39,114,0.04)] transition-colors duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
const inputOk = 'border-slate-300 hover:border-slate-400 focus:border-[#2C2772] focus:ring-[#2C2772]/20'
const inputBad = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'

const bannerBase = 'flex items-start gap-3 rounded-lg border px-3.5 py-3 text-[13px] leading-snug'

function CheckIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" clipRule="evenodd" />
    </svg>
  )
}

function AlertIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-4a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function VerificationForm({ email, dashboardHref }: { email: string; dashboardHref: string }) {
  const [state, action, pending] = useActionState(verifyEmail, undefined)
  const [resend, resendAction, resending] = useActionState(resendVerification, undefined)

  const busy = pending || resending

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-2xl">Verify your email</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Enter the 4-digit code sent to <strong className="break-all font-semibold text-[#2C2772]">{email}</strong>. Use the
          latest code before the expiry shown in your email.
        </p>
      </div>

      {/* Verify result */}
      {state?.success && (
        <div role="status" className={`${bannerBase} mb-5 border-emerald-200 bg-emerald-50 text-emerald-900`}>
          <CheckIcon className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
          <span>Email verified. You can now create support tickets.</span>
        </div>
      )}
      {!state?.success && state?.error && (
        <div role="alert" className={`${bannerBase} mb-5 border-rose-200 bg-rose-50 text-rose-900`}>
          <AlertIcon className="mt-px h-4 w-4 shrink-0 text-rose-600" />
          <span>{state.error}</span>
        </div>
      )}

      {!state?.success && (
        <>
          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="code" className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                autoComplete="one-time-code"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="numeric"
                pattern="[0-9]{4}"
                minLength={4}
                maxLength={4}
                disabled={busy}
                aria-invalid={state?.error ? true : undefined}
                className={`${inputBase} text-center font-mono tracking-[0.5em] ${state?.error ? inputBad : inputOk}`}
                placeholder="0000"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              aria-busy={pending}
              className="mt-2 flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-lg bg-[#2C2772] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(44,39,114,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-150 hover:bg-[#241F5E] active:bg-[#1B1747] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#2C2772]/70"
            >
              {pending ? (
                <>
                  <Spinner />
                  <span>Verifying</span>
                </>
              ) : (
                <span>Verify email</span>
              )}
            </button>
          </form>

          {/* Resend */}
          <form action={resendAction} className="mt-6 space-y-3 border-t border-slate-100 pt-6">
            <p className="text-[13px] text-slate-500">Didn&apos;t get a code?</p>
            <button
              type="submit"
              disabled={busy}
              aria-busy={resending}
              className="flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#2C2772]/25 bg-white px-4 text-sm font-semibold text-[#2C2772] transition-colors duration-150 hover:bg-[#2C2772]/5 active:bg-[#2C2772]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? (
                <>
                  <Spinner />
                  <span>Resending</span>
                </>
              ) : (
                <span>Resend verification code</span>
              )}
            </button>

            {resend?.error && (
              <div role="alert" className={`${bannerBase} border-rose-200 bg-rose-50 text-rose-900`}>
                <AlertIcon className="mt-px h-4 w-4 shrink-0 text-rose-600" />
                <span>{resend.error}</span>
              </div>
            )}
            {!resend?.error && resend?.success && (
              <div role="status" className={`${bannerBase} border-slate-200 bg-slate-50 text-slate-700`}>
                <CheckIcon className="mt-px h-4 w-4 shrink-0 text-slate-500" />
                <span>
                  If verification is needed, a code will be sent to the email above. Please allow at least 60 seconds
                  between requests.
                </span>
              </div>
            )}
          </form>
        </>
      )}

      {/* Footer link */}
      <p className="mt-7 text-center text-[13px] text-slate-500">
        <Link
          href={dashboardHref}
          className="rounded font-semibold text-[#2C2772] underline decoration-[#2C2772]/30 underline-offset-4 transition-colors hover:decoration-[#2C2772] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772]/40"
        >
          Continue to dashboard
        </Link>
      </p>
    </div>
  )
}