'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'
import GoogleAuthSection from '@/components/auth/google-auth-section'

const initialState: AuthState = undefined

// 16px text on mobile stops iPhone Safari from zooming in when a field is focused
const inputBase =
  'block w-full min-h-[46px] rounded-lg border bg-white px-3.5 text-[16px] sm:text-sm text-slate-900 ' +
  'placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,27,45,0.03)] transition-colors duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
const inputOk = 'border-slate-300 hover:border-slate-400 focus:border-[#1F4FD8] focus:ring-[#1F4FD8]/20'
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

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-rose-600">
      {message}
    </p>
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
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus-visible:text-[#1F4FD8] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1F4FD8]/40 disabled:opacity-50"
        >
          <EyeIcon off={visible} />
        </button>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </>
  )
}

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)

  const fullNameError = state?.errors?.full_name?.[0]
  const emailError = state?.errors?.email?.[0]
  const passwordError = state?.errors?.password?.[0]
  const confirmPasswordError = state?.errors?.confirmPassword?.[0]

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-2xl">Create your account</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Sign up to submit and track support tickets.
        </p>
      </div>

      {/* Info banner */}
      <div
        role="note"
        className="mb-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] leading-snug text-slate-700"
      >
        <svg viewBox="0 0 20 20" className="mt-px h-4 w-4 shrink-0 text-slate-500" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clipRule="evenodd" />
        </svg>
        <span>
          New accounts are created as <strong className="font-semibold">Client</strong> accounts. Contact an
          administrator to change your role.
        </span>
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

      <GoogleAuthSection mode="signup" />

      <form action={formAction} className="space-y-4">
        {/* Full name */}
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            disabled={isPending}
            aria-invalid={fullNameError ? true : undefined}
            aria-describedby={fullNameError ? 'full_name-error' : undefined}
            className={`${inputBase} ${fullNameError ? inputBad : inputOk}`}
            placeholder="John Doe"
          />
          <FieldError id="full_name-error" message={fullNameError} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
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
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? 'email-error' : undefined}
            className={`${inputBase} ${emailError ? inputBad : inputOk}`}
            placeholder="you@company.com"
          />
          <FieldError id="email-error" message={emailError} />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={labelClass}>
            Password
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
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter your password"
            disabled={isPending}
            error={confirmPasswordError}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="mt-2 flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-lg bg-[#0F1B2D] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,27,45,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors duration-150 hover:bg-[#1A2B45] active:bg-[#0A1422] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4FD8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#0F1B2D]/70"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Creating account</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-7 text-center text-[13px] text-slate-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="rounded font-semibold text-[#1F4FD8] transition-colors hover:text-[#183CA8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4FD8]/40"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}