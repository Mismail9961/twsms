export const subjects: Record<string, string> = {
  contact: 'New website enquiry',
  registration: 'Admin: New Client Registration', welcome: 'Welcome to Our Support Platform',
  verify: 'Verify Your Email Address', reset: 'Reset Your Password', login: 'New Login to Your Account',
  employee: 'Employee: Welcome to the Support Team', ticket: 'Admin: New Support Ticket Created',
  assignment: 'Employee: New Ticket Assigned to You', chat: 'Employee: New Message from Your Client',
  reply: 'Client: Our Support Team Has Responded',
}
const headings: Record<string, string> = {
  verify: 'Verify your email address', reset: 'Reset your password',
  welcome: 'Welcome aboard', employee: 'Welcome to the support team',
  registration: 'A new client has joined', ticket: 'A new support request',
  assignment: 'You have a new ticket', chat: 'Your client sent a message',
  reply: 'Your support team has replied', login: 'New sign-in to your account',
}
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

export function template(kind: string, name: string, details: string, url: string, verification?: { code: string; expiresAt: string }) {
  const subject = subjects[kind]
  if (!subject) throw new Error('invalid_template')
  if (kind === 'verify' && (!verification || !/^\d{4}$/.test(verification.code))) throw new Error('invalid_verification_template')
  const brand = process.env.APP_NAME || 'Technology World Support'
  const heading = headings[kind] || subject
  const isVerification = kind === 'verify' && verification
  const action = kind === 'verify' ? 'Verify email address' : kind === 'reset' ? 'Set a new password' : kind === 'welcome' || kind === 'employee' ? 'Open your dashboard' : kind === 'login' ? 'Review your account' : 'View support details'
  const description = isVerification
    ? `Thanks for joining ${brand}. Enter the code below to confirm your email address and start using your support dashboard.`
    : details
  const expiry = verification ? new Date(verification.expiresAt).toISOString().replace('T', ' ').replace('.000Z', ' UTC') : ''
  const codeText = isVerification ? `\n\nYour verification code: ${verification.code}\nExpires at ${expiry}. This code can only be used once.` : ''
  const text = `${brand}\n${heading}\n\nHello ${name},\n\n${description}${codeText}\n\n${action}: ${url}\n\n${isVerification ? 'If you did not create an account, you can ignore this email.' : 'If you did not expect this activity, contact your support team.'}\nNever share your password or verification code.\n\n${brand} · Support & Ticket Management`
  const codePanel = isVerification ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#f4f2ff;border:1px solid #e4def7;border-radius:12px">
      <tr><td align="center" style="padding:24px 12px 8px;font-size:11px;font-weight:700;letter-spacing:2px;color:#625b87">YOUR VERIFICATION CODE</td></tr>
      <tr><td align="center" style="padding:0 0 12px 10px;font-family:Consolas,monospace;font-size:40px;line-height:52px;font-weight:700;letter-spacing:12px;color:#2c2772">${verification.code}</td></tr>
      <tr><td align="center" style="padding:0 16px 22px;font-size:12px;line-height:20px;color:#706a89">Valid for 5 minutes &bull; One-time use<br>Expires at ${escapeHtml(expiry)}</td></tr>
    </table>` : ''
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f2f8;color:#1e2335;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(isVerification ? 'Your four-digit verification code is ready. It expires in five minutes.' : heading)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f2f8"><tr><td align="center" style="padding:32px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px">
      <tr><td style="padding:0 16px 20px;font-size:16px;font-weight:700;color:#2c2772">${escapeHtml(brand)}<br><span style="font-size:11px;font-weight:400;letter-spacing:1px;color:#858095">SUPPORT &amp; TICKET MANAGEMENT</span></td></tr>
      <tr><td style="border-top:5px solid #2c2772;border-radius:16px;background:#ffffff;padding:32px 24px;border-bottom:1px solid #e5e3ef">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;font-weight:700;color:#7a6eb0">${kind === 'verify' || kind === 'reset' || kind === 'login' ? 'ACCOUNT SECURITY' : 'YOUR SUPPORT PLATFORM'}</p>
        <h1 style="margin:0 0 24px;font-size:28px;line-height:36px;letter-spacing:-0.5px;color:#211c51">${escapeHtml(heading)}</h1>
        <p style="margin:0 0 12px;font-size:15px;line-height:24px">Hello ${escapeHtml(name)},</p>
        <p style="margin:0;font-size:15px;line-height:25px;color:#62657a;overflow-wrap:anywhere">${escapeHtml(description).replace(/\n/g, '<br>')}</p>
        ${codePanel}
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0"><tr><td bgcolor="#2c2772" style="border-radius:8px"><a href="${escapeHtml(url)}" style="display:inline-block;padding:15px 24px;font-size:14px;font-weight:700;text-decoration:none;color:#ffffff">${action}</a></td></tr></table>
        <p style="margin:0;font-size:12px;line-height:20px;color:#8b8c9d">Button not working? Open this link:<br><a href="${escapeHtml(url)}" style="color:#6354a1;word-break:break-all">${escapeHtml(url)}</a></p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;border-top:1px solid #eeedf4"><tr><td style="padding-top:20px;font-size:12px;line-height:20px;color:#8b8c9d">${isVerification ? 'If you did not create an account, you can safely ignore this email.' : 'If you did not expect this activity, contact your support team.'}<br>Never share your password or verification code.</td></tr></table>
      </td></tr>
      <tr><td align="center" style="padding:22px 16px;font-size:11px;line-height:19px;color:#9894a8">${escapeHtml(brand)}<br>Keeping your support requests connected, secure, and on track.</td></tr>
    </table>
  </td></tr></table>
</body></html>`
  return { subject, text, html }
}
