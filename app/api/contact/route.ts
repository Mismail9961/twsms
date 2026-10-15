import { NextResponse } from 'next/server'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real visitors never fill this field. Pretend success so bots move on.
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true })
  }

  const name = clean(body.name, 120)
  const email = clean(body.email, 200)
  const phone = clean(body.phone, 40)
  const company = clean(body.company, 120)
  const service = clean(body.service, 80)
  const message = clean(body.message, 4000)

  if (!name || !emailPattern.test(email) || message.length < 10) {
    return NextResponse.json({ ok: false, error: 'Please check the form fields.' }, { status: 422 })
  }

  // TODO: deliver the message. Until you add one of these, submissions are only logged on the server.
  //  - Save it with Prisma (e.g. a ContactMessage model), and/or
  //  - Email it to your team with a provider such as Resend or Nodemailer.
  console.log('New contact message', { name, email, phone, company, service, message })

  return NextResponse.json({ ok: true })
}