export function emailConfigurationIssues(env = process.env) {
  const required = ['DATABASE_URL', 'SMTP_EMAIL', 'SMTP_APP_PASSWORD', 'ADMIN_NOTIFICATION_EMAIL', 'APP_BASE_URL', 'EMAIL_ENCRYPTION_KEY', 'EMAIL_WORKER_SECRET']
  const issues = required.filter(key => !env[key]?.trim()).map(key => `${key} is missing`)
  if (env.EMAIL_ENCRYPTION_KEY && Buffer.from(env.EMAIL_ENCRYPTION_KEY, 'base64').length !== 32) issues.push('EMAIL_ENCRYPTION_KEY must be a base64-encoded 32-byte key')
  if (env.APP_BASE_URL) {
    try {
      const url = new URL(env.APP_BASE_URL)
      if (url.protocol !== 'https:' && !(env.NODE_ENV !== 'production' && url.protocol === 'http:' && url.hostname === 'localhost')) issues.push('APP_BASE_URL requires HTTPS (HTTP localhost is allowed in development)')
      if (url.username || url.password) issues.push('APP_BASE_URL must not contain credentials')
    } catch { issues.push('APP_BASE_URL is invalid') }
  }
  return issues
}
