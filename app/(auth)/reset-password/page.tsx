'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'

const initialState: AuthState = undefined

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
        <p className="text-slate-500 text-sm mt-1">
          Choose a strong password for your account.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* New Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            New password
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
          <p className="mt-1 text-xs text-slate-400">Must be at least 8 characters</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            placeholder="Re-enter your new password"
          />
        </div>

        {/* Password strength hint */}
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-600">Password tips:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>At least 8 characters long</li>
            <li>Mix of uppercase and lowercase letters</li>
            <li>Include numbers and special characters</li>
          </ul>
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
              Updating password...
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}
