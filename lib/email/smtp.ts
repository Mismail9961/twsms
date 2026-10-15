import nodemailer from 'nodemailer'
import { randomUUID } from 'node:crypto'
import { validEmail } from './security'

export class DeliveryError extends Error {
  constructor(public code: string, public retryable = false, public uncertain = false, public retryAfter = 0) { super(code) }
}
export function retryDelay(attempt: number, retryAfter = 0) {
  return Math.max(retryAfter, Math.min(3600, 30 * 2 ** Math.min(attempt, 7)))
}
export function mime(to: string, subject: string, text: string, html: string, eventId: string) {
  const sender = process.env.SMTP_EMAIL || ''
  if (!validEmail(to) || !validEmail(sender) || /[\r\n]/.test(subject) || !/^[A-Za-z0-9-]+$/.test(eventId)) throw new DeliveryError('invalid_address')
  const boundary = randomUUID()
  const encode = (s: string) => Buffer.from(s).toString('base64').match(/.{1,76}/g)?.join('\r\n') || ''
  return [`Date: ${new Date().toUTCString()}`, `From: ${sender}`, `To: ${to}`, `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`, `Message-ID: <${eventId}@${sender.split('@')[1]}>`, 'MIME-Version: 1.0', `Content-Type: multipart/alternative; boundary="${boundary}"`, '', `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', encode(text), `--${boundary}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', encode(html), `--${boundary}--`].join('\r\n')
}
type MailTransport = {
  sendMail(options: { raw: string; envelope: { from: string; to: string[] } }): Promise<{ messageId?: string; accepted?: unknown[]; rejected?: unknown[] }>
}

export function createGmailTransport() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '') },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true,
  })
}

export async function sendEmail(to: string, mail: { subject: string; text: string; html: string }, id: string, transport?: MailTransport) {
  const raw = mime(to, mail.subject, mail.text, mail.html, id)
  if (!process.env.SMTP_APP_PASSWORD?.trim()) throw new DeliveryError('smtp_configuration')
  try {
    const result = await (transport || createGmailTransport()).sendMail({
      raw, envelope: { from: process.env.SMTP_EMAIL!, to: [to] },
    })
    if (!result.accepted?.length || result.rejected?.length || !result.messageId) throw new DeliveryError('smtp_delivery_unknown', false, true)
    return result.messageId
  } catch (error) {
    if (error instanceof DeliveryError) throw error
    const failure = error as { code?: string; responseCode?: number; command?: string }
    if (failure.responseCode) throw new DeliveryError(`smtp_${failure.responseCode}`, failure.responseCode >= 400 && failure.responseCode < 500)
    if (failure.code === 'EAUTH') throw new DeliveryError('smtp_authentication')
    const beforeSubmission = ['CONN', 'EHLO', 'HELO', 'AUTH', 'MAIL FROM', 'RCPT TO', 'STARTTLS'].includes(failure.command || '') || ['EDNS', 'ECONNECTION', 'ECONNREFUSED'].includes(failure.code || '')
    throw new DeliveryError(beforeSubmission ? 'smtp_connection' : 'smtp_delivery_unknown', beforeSubmission, !beforeSubmission)
  }
}
