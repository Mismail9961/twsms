export const subjects: Record<string, string> = {
  registration: 'Admin: New Client Registration', welcome: 'Welcome to Our Support Platform',
  verify: 'Verify Your Email Address', reset: 'Reset Your Password', login: 'New Login to Your Account',
  employee: 'Employee: Welcome to the Support Team', ticket: 'Admin: New Support Ticket Created',
  assignment: 'Employee: New Ticket Assigned to You', chat: 'Employee: New Message from Your Client',
  reply: 'Client: Our Support Team Has Responded',
}
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
export function template(kind: string, name: string, details: string, url: string) {
  const subject = subjects[kind]
  if (!subject) throw new Error('invalid_template')
  const brand = process.env.APP_NAME || 'Technology World Support'
  const text = `${brand}\n${subject}\n\nHello ${name},\n\n${details}\n\nOpen support platform: ${url}\n\nIf you did not request this activity, contact support. Never share your password or verification code.`
  const html = `<html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><main style="max-width:600px;margin:auto;padding:24px;background:white"><p>${escapeHtml(brand)}</p><h1 style="font-size:24px">${escapeHtml(subject)}</h1><p>Hello ${escapeHtml(name)},</p><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(details)}</p><p><a style="display:inline-block;padding:14px;background:#2563eb;color:white;border-radius:6px" href="${escapeHtml(url)}">Open support platform</a></p><p style="word-break:break-all">${escapeHtml(url)}</p><p>If you did not request this activity, contact support. Never share your password or verification code.</p><footer>${escapeHtml(brand)}</footer></main></body></html>`
  return { subject, text, html }
}
