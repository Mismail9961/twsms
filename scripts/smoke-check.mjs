// Read-only route checks; the only POST is deliberately invalid and cannot enqueue mail.
const base = new URL(process.argv[2] || 'http://localhost:3000')
const checks = [
  ...['/', '/contact', '/privacy', '/terms', '/login', '/signup', '/forgot-password', '/reset-password', '/unauthorized'].map(path => ({ path, expected: 200 })),
  ...['/admin', '/admin/tickets', '/admin/clients', '/admin/employees', '/admin/categories', '/admin/ratings', '/admin/reports', '/admin/email', '/admin/profile', '/admin/notifications', '/client', '/client/tickets', '/client/tickets/new', '/client/profile', '/client/notifications', '/employee', '/employee/tickets', '/employee/profile', '/employee/notifications'].map(path => ({ path, expected: 307, redirect: '/login' })),
  { path: '/verify-email', expected: 307, redirect: '/login' },
  { path: '/contact-us', expected: 307, redirect: '/contact' },
  { path: '/api/export/tickets', expected: 401 },
  { path: '/api/tickets/00000000-0000-0000-0000-000000000000/messages', expected: 401 },
  { path: '/api/attachments/00000000-0000-0000-0000-000000000000', expected: 401 },
  { path: '/api/contact', expected: 405 },
  { path: '/api/contact', expected: 400, method: 'POST', body: 'null' },
  { path: '/logo.png', expected: 200 },
]
let failures = 0
for (let i = 0; i < checks.length; i += 4) {
  await Promise.all(checks.slice(i, i + 4).map(async check => {
    const started = performance.now()
    try {
      const response = await fetch(new URL(check.path, base), {
        method: check.method || 'GET', redirect: 'manual',
        ...(check.body ? { body: check.body, headers: { 'Content-Type': 'application/json' } } : {}),
        signal: AbortSignal.timeout(30000),
      })
      const elapsed = Math.round(performance.now() - started)
      const location = response.headers.get('location')
      const matches = response.status === check.expected && (!check.redirect || (location && new URL(location, base).pathname === check.redirect))
      await response.arrayBuffer()
      if (!matches) failures++
      console.log(`${matches ? 'PASS' : 'FAIL'} ${check.method || 'GET'} ${check.path} ${response.status} ${elapsed}ms${matches ? '' : ` (expected ${check.expected})`}`)
    } catch (error) {
      failures++
      console.log(`FAIL ${check.path}: ${error.name}`)
    }
  }))
}
console.log(`${checks.length - failures}/${checks.length} checks passed`)
process.exitCode = failures ? 1 : 0
