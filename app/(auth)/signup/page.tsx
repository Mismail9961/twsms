'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'
import GoogleAuthSection from '@/components/auth/google-auth-section'

const initialState: AuthState = undefined

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
        <p className="text-slate-500 text-sm mt-1">
          Sign up to submit and track support tickets
        </p>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
        ℹ️ New accounts are created as <strong>Client</strong> accounts. Contact an administrator to change your role.
      </div>

      {state?.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <GoogleAuthSection mode="signup" />

      <form action={formAction} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            placeholder="John Doe"
          />
          {state?.errors?.full_name && (
            <p className="mt-1 text-xs text-red-600">{state.errors.full_name[0]}</p>
          )}
        </div>

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
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            placeholder="Min. 8 characters"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            placeholder="Re-enter your password"
          />
          {state?.errors?.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{state.errors.confirmPassword[0]}</p>
          )}
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
