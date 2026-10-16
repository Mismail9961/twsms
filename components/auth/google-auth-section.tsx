'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type GoogleAuthSectionProps = {
  mode: 'login' | 'signup'
  hideError?: boolean
}

const errorMessages: Record<string, string> = {
  unavailable: 'Sign-in is temporarily unavailable. Please contact support.',
  not_configured: 'Google sign-in is not configured. Please contact your administrator.',
  cancelled: 'Google sign-in was cancelled.',
  invalid_state: 'Google sign-in could not be verified. Please try again.',
  inactive_account: 'This account has been deactivated or suspended. Please contact IT support.',
  failed: 'Google sign-in could not be completed. Please try again.',
}

function GoogleAuthContent({ mode, hideError }: GoogleAuthSectionProps) {
  const searchParams = useSearchParams()
  const error = searchParams.get('googleError')
  const message = error ? errorMessages[error] : undefined

  return (
    <>
      {message && !hideError && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {message}
        </p>
      )}

      <a
        href={`/api/auth/google?mode=${mode}`}
        className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.77 7.18l7.73 6C44.41 37.97 46.98 31.79 46.98 24.55Z" />
          <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
        </svg>
        Continue with Google
      </a>

      <div className="mb-5 flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">or continue with email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    </>
  )
}

export default function GoogleAuthSection(props: GoogleAuthSectionProps) {
  return (
    <Suspense fallback={<div className="mb-5 h-11" />}>
      <GoogleAuthContent {...props} />
    </Suspense>
  )
}
