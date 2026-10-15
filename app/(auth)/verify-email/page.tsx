'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { verifyEmail, resendVerification } from '@/app/actions/auth'
export default function VerifyEmailPage() {
  const [state, action, pending] = useActionState(verifyEmail, undefined)
  const [resend, resendAction, resending] = useActionState(resendVerification, undefined)
  const style = 'w-full rounded border border-slate-300 p-3 text-slate-900'
  return <div className="rounded-2xl bg-white p-8 shadow-xl text-slate-900">
    <h1 className="text-2xl font-bold">Verify your email</h1>
    <p className="my-4">Enter the code from your email. Use the latest code before the expiry shown in your email.</p>
    <p role="status">{state?.success ? 'Email verified. You can now create support tickets.' : state?.error}</p>
    <form action={action} className="space-y-3">
      <label htmlFor="email">Email address</label><input className={style} id="email" name="email" type="email" required autoComplete="email" />
      <label htmlFor="code">Verification code</label><input className={style} id="code" name="code" required autoComplete="one-time-code" maxLength={43} />
      <button className="rounded bg-blue-600 p-3 text-white" disabled={pending}>{pending ? 'Verifying…' : 'Verify email'}</button>
    </form>
    <form action={resendAction} className="mt-6 space-y-3"><label htmlFor="resend-email">Resend code to</label><input className={style} id="resend-email" name="email" type="email" required />
      <button className="text-blue-700" disabled={resending}>Resend verification code</button><p role="status">{resend?.success ? 'If verification is needed, a code will be sent. Please allow at least 60 seconds between requests.' : ''}</p></form>
    <Link className="mt-4 block text-blue-700" href="/login">Continue to sign in</Link>
  </div>
}
