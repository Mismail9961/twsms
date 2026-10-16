const { test } = require('node:test')
const assert = require('node:assert/strict')
const fake = (name, exports) => { const id = require.resolve(name); require.cache[id] = { id, filename: id, loaded: true, exports } }
let configured = true
let schemaFailure = false
fake('@/lib/db', { isNeonConfigured: () => configured, dbQuery: async () => { if (schemaFailure) throw new Error('Missing schema'); return [] } })
const { assertAuthReady } = require('../lib/auth/readiness.ts')
const { getGoogleOAuthConfig } = require('../lib/auth/google.ts')
const { NextRequest } = require('next/server')
const { GET } = require('../app/api/auth/google/route.ts')
function environment(values) {
  const saved = { ...process.env }
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  return () => { process.env = saved }
}

test('production readiness rejects missing persistence and short signing secrets', async () => {
  const restore = environment({ NODE_ENV: 'production', SESSION_SECRET: 'x'.repeat(32) })
  try {
    configured = false
    await assert.rejects(assertAuthReady(), /DATABASE_URL/)
    configured = true
    process.env.SESSION_SECRET = 'short'
    await assert.rejects(assertAuthReady(), /SESSION_SECRET/)
    process.env.SESSION_SECRET = 'x'.repeat(32)
    schemaFailure = true
    await assert.rejects(assertAuthReady(), /Missing schema/)
  } finally { configured = true; schemaFailure = false; restore() }
})

test('Google configuration trims settings and rejects localhost in production', () => {
  const restore = environment({ NODE_ENV: 'production', GOOGLE_CLIENT_ID: ' client ', GOOGLE_CLIENT_SECRET: ' secret ', GOOGLE_REDIRECT_URI: undefined })
  try {
    assert.deepEqual(getGoogleOAuthConfig('https://twsms.vercel.app/login'), { clientId: 'client', clientSecret: 'secret', redirectUri: 'https://twsms.vercel.app/api/auth/google/callback' })
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'
    assert.equal(getGoogleOAuthConfig('https://twsms.vercel.app'), null)
    process.env.GOOGLE_REDIRECT_URI = 'https://example.com/api/auth/google/callback?extra=1'
    assert.equal(getGoogleOAuthConfig('https://twsms.vercel.app'), null)
  } finally { restore() }
})

test('OAuth starts on callback host before setting state; same-host flow sets secure state cookie', async () => {
  const restore = environment({ NODE_ENV: 'production', SESSION_SECRET: 'x'.repeat(32), GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'secret', GOOGLE_REDIRECT_URI: 'https://twsms.vercel.app/api/auth/google/callback' })
  try {
    const moved = await GET(new NextRequest('https://preview.vercel.app/api/auth/google?mode=signup'))
    assert.equal(moved.headers.get('location'), 'https://twsms.vercel.app/api/auth/google?mode=signup')
    assert.equal(moved.headers.get('set-cookie'), null)
    const response = await GET(new NextRequest('https://twsms.vercel.app/api/auth/google?mode=signup'))
    const google = new URL(response.headers.get('location'))
    assert.equal(google.origin, 'https://accounts.google.com')
    assert.equal(google.searchParams.get('redirect_uri'), process.env.GOOGLE_REDIRECT_URI)
    const state = JSON.parse(Buffer.from(response.cookies.get('twsms_google_oauth').value, 'base64url').toString())
    assert.equal(state.state, google.searchParams.get('state'))
    assert.equal(state.nonce, google.searchParams.get('nonce'))
    assert.equal(state.mode, 'signup')
    assert.match(response.headers.get('set-cookie'), /HttpOnly/)
    assert.match(response.headers.get('set-cookie'), /Secure/)
    schemaFailure = true
    const broken = await GET(new NextRequest('https://twsms.vercel.app/api/auth/google'))
    assert.equal(new URL(broken.headers.get('location')).searchParams.get('googleError'), 'unavailable')
    assert.equal(broken.headers.get('set-cookie'), null)
  } finally { schemaFailure = false; restore() }
})
