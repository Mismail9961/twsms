import { randomUUID } from 'node:crypto'
import { validEmail } from './security'

export class DeliveryError extends Error {
  constructor(public code: string, public retryable = false, public uncertain = false, public retryAfter = 0) { super(code) }
}
export function retryDelay(attempt: number, retryAfter = 0) {
  return Math.max(retryAfter, Math.min(3600, 30 * 2 ** Math.min(attempt, 7)))
}
export function mime(to: string, subject: string, text: string, html: string, eventId: string) {
  const sender = process.env.GMAIL_SENDER_EMAIL || ''
  if (!validEmail(to) || !validEmail(sender) || /[\r\n]/.test(subject)) throw new DeliveryError('invalid_address')
  const boundary = randomUUID()
  const encode = (s: string) => Buffer.from(s).toString('base64').match(/.{1,76}/g)?.join('\r\n') || ''
  return [`From: ${sender}`, `To: ${to}`, `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`, `Message-ID: <${eventId}@${sender.split('@')[1]}>`, 'MIME-Version: 1.0', `Content-Type: multipart/alternative; boundary="${boundary}"`, '', `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', encode(text), `--${boundary}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', encode(html), `--${boundary}--`].join('\r\n')
}
export async function sendGmail(to: string, mail: { subject: string; text: string; html: string }, id: string, fetcher: typeof fetch = fetch) {
  const raw = mime(to, mail.subject, mail.text, mail.html, id)
  let tokenResponse: Response
  try {
    tokenResponse = await fetcher('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: process.env.GMAIL_CLIENT_ID || '', client_secret: process.env.GMAIL_CLIENT_SECRET || '', refresh_token: process.env.GMAIL_REFRESH_TOKEN || '', grant_type: 'refresh_token' }), signal: AbortSignal.timeout(15000), cache: 'no-store' })
  } catch { throw new DeliveryError('oauth_network', true) }
  if (!tokenResponse.ok) throw new DeliveryError(`oauth_${tokenResponse.status}`, tokenResponse.status >= 500 || tokenResponse.status === 429)
  const token = await tokenResponse.json() as { access_token?: string }
  if (!token.access_token) throw new DeliveryError('oauth_invalid')
  let response: Response
  try {
    response = await fetcher('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ raw: Buffer.from(raw).toString('base64url') }), signal: AbortSignal.timeout(15000), cache: 'no-store' })
  } catch { throw new DeliveryError('gmail_delivery_unknown', false, true) }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: { errors?: { reason?: string }[] } }
    const quota = body.error?.errors?.some(e => ['rateLimitExceeded', 'userRateLimitExceeded', 'dailyLimitExceeded'].includes(e.reason || ''))
    throw new DeliveryError(`gmail_${response.status}`, response.status === 429 || response.status >= 500 || !!quota, false, Math.min(86400, Number(response.headers.get('retry-after')) || 0))
  }
  try {
    const result = await response.json() as { id?: string }
    if (!result.id) throw new Error('Missing message ID')
    return result.id
  } catch { throw new DeliveryError('gmail_response_unknown', false, true) }
}
