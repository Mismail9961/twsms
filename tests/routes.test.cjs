const { test } = require('node:test')
const assert = require('node:assert/strict')
const { NextRequest } = require('next/server')
const { SignJWT } = require('jose')
const { csvCell } = require('../lib/export/csv.ts')
const fake = (name, exports) => { const id = require.resolve(name); require.cache[id] = { id, filename: id, loaded: true, exports } }
let databaseCalls = 0
fake('@/lib/db', { isNeonConfigured: () => true })
fake('@/lib/email/store.ts', { emailQuery: async () => { databaseCalls++; return [{ session_version: 0, account_status: 'active', role: 'client' }] } })
const { proxy } = require('../proxy.ts')

test('public documents bypass authentication queries even with a stale session cookie', async () => {
  databaseCalls = 0
  for (const path of ['/', '/contact', '/privacy', '/terms']) {
    const response = await proxy(new NextRequest(`https://support.example.com${path}`, { headers: { cookie: 'twsms_session=expired' } }))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('set-cookie'), null, 'public HTML must not set personalised cookies')
  }
  assert.equal(databaseCalls, 0)
})

test('protected dashboards redirect signed-out users; public-like prefixes are not public', async () => {
  for (const path of ['/admin', '/client/tickets', '/employee', '/privacy-private', '/login-other']) {
    const response = await proxy(new NextRequest(`https://support.example.com${path}`))
    const redirect = new URL(response.headers.get('location'))
    assert.equal(redirect.pathname, '/login')
    assert.equal(redirect.searchParams.get('from'), path)
  }
  const alias = await proxy(new NextRequest('https://support.example.com/contact-us'))
  assert.equal(new URL(alias.headers.get('location')).pathname, '/contact')
})

test('database role overrides stale JWT privileges and blocks an admin route', async () => {
  process.env.SESSION_SECRET = 'test-route-secret'.repeat(3)
  const token = await new SignJWT({ id: 'client', email: 'test@example.com', role: 'admin', session_version: 0 })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET))
  const response = await proxy(new NextRequest('https://support.example.com/admin', { headers: { cookie: `twsms_session=${token}` } }))
  assert.equal(new URL(response.headers.get('location')).pathname, '/unauthorized')
})

test('CSV quotes embedded values and neutralises formula injection', () => {
  assert.equal(csvCell('A "quoted", category'), '"A ""quoted"", category"')
  for (const value of ['=HYPERLINK("bad")', '+SUM(A1:A2)', ' @cmd', '-1+2', '\tformula']) {
    assert.ok(csvCell(value).startsWith('"\''))
  }
  assert.equal(csvCell(null), '""')
})

let session = null
fake('@/lib/auth/session.ts', { getSession: async () => session, dashboardPathForRole: role => `/${role}` })
let pages = []
fake('@/lib/data/tickets.ts', { getAllTickets: async ({ page }) => {
  pages.push(page)
  return { total: 1001, tickets: Array.from({ length: page === 1 ? 1000 : 1 }, (_, index) => ({
    ticket_number: `TW-${(page - 1) * 1000 + index}`, title: '=FORMULA', category: { name: 'A "quote"' },
  })) }
} })
const exportRoute = require('../app/api/export/tickets/route.ts')
const sessionRoute = require('../app/api/auth/session/route.ts')

test('exports enforce admin role and include records past the first thousand', async () => {
  for (session of [null, { role: 'client' }, { role: 'employee' }]) {
    assert.equal((await exportRoute.GET()).status, 401)
  }
  assert.deepEqual(pages, [])
  session = { role: 'admin' }
  const response = await exportRoute.GET()
  const csv = await response.text()
  assert.deepEqual(pages, [1, 2])
  assert.equal(csv.split('\r\n').length, 1002)
  assert.ok(csv.includes('"TW-1000"'))
  assert.ok(csv.includes('"\'=FORMULA"'))
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
})

test('public navigation session response is private and excludes account details', async () => {
  session = { id: 'sensitive-id', email: 'private@example.com', role: 'employee' }
  const response = await sessionRoute.GET()
  assert.deepEqual(await response.json(), { signedIn: true, dashboardHref: '/employee' })
  assert.match(response.headers.get('cache-control'), /no-store/)
  session = null
  assert.deepEqual(await (await sessionRoute.GET()).json(), { signedIn: false, dashboardHref: '/login' })
})
