import { randomUUID } from 'node:crypto'
import { emailQuery } from '@/lib/email/store'
import { emailConfigurationIssues } from '@/lib/email/config.mjs'
import { seal, validEmail } from '@/lib/email/security'
import { allowAuthRequest } from '@/lib/auth/rate-limit'
import { scheduleEmailDelivery } from '@/lib/email/dispatch'

export const maxDuration = 60

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    const value = await request.json()
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid body')
    body = value
  } catch {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  if (clean(body.website, 200)) return Response.json({ ok: true })

  const enquiry = {
    name: clean(body.name, 120),
    email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 40),
    company: clean(body.company, 120),
    service: clean(body.service, 80),
    message: clean(body.message, 4000),
  }
  if (!enquiry.name || !validEmail(enquiry.email) || enquiry.message.length < 10) {
    return Response.json({ ok: false, error: 'Please check the form fields.' }, { status: 422 })
  }

  try {
    if (emailConfigurationIssues().length) throw new Error('Contact delivery is not configured')
    if (!await allowAuthRequest('contact', enquiry.email)) {
      return Response.json({ ok: false, error: 'Too many enquiries. Please try again later.' }, {
        status: 429, headers: { 'Retry-After': '3600' },
      })
    }
    // Acknowledge only after a durable write. Personal details stay out of server logs.
    await emailQuery(`INSERT INTO email_outbox(event_key,kind,payload) VALUES($1,'contact',$2::jsonb)`, [
      `contact:${randomUUID()}`, JSON.stringify({ enquiry: seal(JSON.stringify(enquiry)) }),
    ])
    scheduleEmailDelivery()
    return Response.json({ ok: true }, { status: 202 })
  } catch {
    console.error('[Contact] Enquiry could not be queued.')
    return Response.json({ ok: false, error: 'Your message could not be received. Please try again later.' }, { status: 503 })
  }
}
