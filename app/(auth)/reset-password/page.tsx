'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'

const initialState: AuthState = undefined

// 16px text on mobile stops iPhone Safari from zooming in when a field is focused
const inputBase =
  'block w-full min-h-[46px] rounded-lg border bg-white px-3.5 text-[16px] sm:text-sm text-slate-900 ' +
  'placeholder:text-slate-400 shadow-[0_1px_0_rgba(44,39,114,0.04)] transition-colors duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
const inputOk = 'border-slate-300 hover:border-slate-400 focus:border-[#2C2772] focus:ring-[#2C2772]/20'
const inputBad = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'

const labelClass = 'mb-1.5 block text-[13px] font-medium text-slate-700'

function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4.2 9.5 6-.4.8-1.3 2.1-2.6 3.3M6.5 7.6C4.5 9 3.1 10.9 2.5 12c1 1.8 4.5 6 9.5 6 1.5 0 2.8-.4 4-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12C3.5 10.2 7 6 12 6s8.5 4.2 9.5 6c-1 1.8-4.5 6-9.5 6s-8.5-4.2-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PasswordInput({
  id,
  name,
  placeholder,
  disabled,
  error,
}: {
  id: string
  name: string
  placeholder: string
  disabled: boolean
  error?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          required
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputBase} pr-12 ${error ? inputBad : inputOk}`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus-visible:text-[#2C2772] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2C2772]/40 disabled:opacity-50"
        >
          <EyeIcon off={visible} />
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  const emailRef = useRef<HTMLInputElement>(null)
  const tokenRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    if (emailRef.current && params.has('email')) {
      emailRef.current.defaultValue = params.get('email') || ''
      emailRef.current.value = emailRef.current.defaultValue
    }
    if (tokenRef.current && params.has('token')) {
      tokenRef.current.defaultValue = params.get('token') || ''
      tokenRef.current.value = tokenRef.current.defaultValue
    }
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  const passwordError = state?.errors?.password?.[0]
  const confirmPasswordError = state?.errors?.confirmPassword?.[0]

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-2xl">Set new password</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">Choose a strong password for your account.</p>
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
        <input type="hidden" name="email" ref={emailRef} />
        <input type="hidden" name="token" ref={tokenRef} />

        {/* New password */}
        <div>
          <label htmlFor="password" className={labelClass}>
            New password
          </label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Min. 8 characters"
            disabled={isPending}
            error={passwordError}
          />
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm new password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter your new password"
            disabled={isPending}
            error={confirmPasswordError}
          />
        </div>

        {/* Password tips */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] leading-snug text-slate-600">
          <p className="font-medium text-[#2C2772]">Password tips</p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-slate-500">
            <li>At least 8 characters long</li>
            <li>Mix of uppercase and lowercase letters</li>
            <li>Include numbers and special characters</li>
          </ul>
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
              <span>Updating password</span>
            </>
          ) : (
            <span>Update password</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-7 text-center text-[13px] text-slate-500">
        <Link
          href="/login"
          className="rounded font-semibold text-[#2C2772] underline decoration-[#2C2772]/30 underline-offset-4 transition-colors hover:decoration-[#2C2772] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772]/40"
        >
          &larr; Back to sign in
        </Link>
      </p>
    </div>
  )
}