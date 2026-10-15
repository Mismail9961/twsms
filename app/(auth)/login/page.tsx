'use client'

import { useActionState, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'
import GoogleAuthSection from '@/components/auth/google-auth-section'

const initialState: AuthState = undefined

function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState)
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const fillCredentials = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign In</h2>
        <p className="text-slate-500 text-sm mt-1">Access your support tickets and operations</p>
      </div>

      {resetSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-medium">
          ✓ Password reset successfully. Please sign in with your new credentials.
        </div>
      )}

      {state?.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
          {state.error}
        </div>
      )}

      <GoogleAuthSection mode="login" />

      <form action={formAction} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Work Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm transition-all"
            placeholder="you@company.com"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm transition-all"
            placeholder="••••••••"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-150 text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Authenticating...
            </>
          ) : (
            'Sign In to Portal'
          )}
        </button>
      </form>

      {/* Quick Test Demo Credentials */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
          Quick Demo Accounts
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('admin@technologyworld.com', 'Admin@12345')}
            className="text-[11px] py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-center transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('john.dev@technologyworld.com', 'Employee@12345')}
            className="text-[11px] py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-center transition-colors"
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('client@acmecorp.com', 'Client@12345')}
            className="text-[11px] py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-center transition-colors"
          >
            Client
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        New client organization?{' '}
        <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
          Create Client Account
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 text-center text-sm text-gray-500">
          Loading login portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
