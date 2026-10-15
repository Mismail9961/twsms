'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'

const initialState: AuthState = undefined

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

  if (state?.success) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-500 text-sm mb-6">
          We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            try again
          </button>
          .
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            placeholder="you@example.com"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending link...
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
