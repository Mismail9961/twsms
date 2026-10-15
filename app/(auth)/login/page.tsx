'use client'

import { useActionState, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'
import GoogleAuthSection from '@/components/auth/google-auth-section'

const initialState: AuthState = undefined

const inputBase =
  'block w-full min-h-[46px] rounded-lg border bg-white px-3.5 text-[16px] sm:text-sm text-slate-900 ' +
  'placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,27,45,0.03)] transition-colors duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
const inputOk = 'border-slate-300 hover:border-slate-400 focus:border-[#1F4FD8] focus:ring-[#1F4FD8]/20'
const inputBad = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'

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

function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState)
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'
  const [showPassword, setShowPassword] = useState(false)

  const emailError = state?.errors?.email?.[0]
  const passwordError = state?.errors?.password?.[0]

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-2xl">Sign in to your portal</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Track support tickets and manage requests for your organization.
        </p>
      </div>

      {/* Success banner */}
      {resetSuccess && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[13px] leading-snug text-emerald-900"
        >
          <svg viewBox="0 0 20 20" className="mt-px h-4 w-4 shrink-0 text-emerald-600" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" clipRule="evenodd" />
          </svg>
          <span>Password updated. Sign in with your new password.</span>
        </div>
      )}

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

      <GoogleAuthSection mode="login" />

      {/* Divider */}
      <div className="relative my-6" role="separator">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-slate-500">or sign in with email</span>
        </div>
      </div>

      <form action={formAction} className="space-y-4" noValidate={false}>
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
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? 'email-error' : undefined}
            className={`${inputBase} ${emailError ? inputBad : inputOk}`}
            placeholder="you@company.com"
          />
          {emailError && (
            <p id="email-error" className="mt-1.5 text-xs font-medium text-rose-600">
              {emailError}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-[13px] font-medium text-slate-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="rounded text-[13px] font-medium text-[#1F4FD8] transition-colors hover:text-[#183CA8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4FD8]/40"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isPending}
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className={`${inputBase} pr-12 ${passwordError ? inputBad : inputOk}`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isPending}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus-visible:text-[#1F4FD8] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1F4FD8]/40 disabled:opacity-50"
            >
              <EyeIcon off={showPassword} />
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="mt-1.5 text-xs font-medium text-rose-600">
              {passwordError}
            </p>
          )}
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
              <span>Signing in</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-7 text-center text-[13px] text-slate-500">
        New client organization?{' '}
        <Link
          href="/signup"
          className="rounded font-semibold text-[#1F4FD8] transition-colors hover:text-[#183CA8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4FD8]/40"
        >
          Create a client account
        </Link>
      </p>
    </div>
  )
}

function LoginSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-4 py-8 sm:px-6"
      role="status"
      aria-label="Loading sign in"
    >
      <div className="animate-pulse motion-reduce:animate-none space-y-4">
        <div className="h-6 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-[46px] w-full rounded-lg bg-slate-100" />
        <div className="h-[46px] w-full rounded-lg bg-slate-100" />
        <div className="h-[46px] w-full rounded-lg bg-slate-200" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}