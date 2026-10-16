const { test } = require('node:test')
const assert = require('node:assert/strict')
const { mergeMessages } = require('../lib/chat/messages.ts')

const message = (id, seconds, extra = {}) => ({
  id, ticket_id: 'ticket-1', sender_id: 'sender-1', message_body: id,
  message_type: 'staff_message', created_at: `2026-10-16T12:00:${String(seconds).padStart(2, '0')}.000Z`, ...extra,
})

test('simultaneous replies and messages older than our sent reply are retained in order', () => {
  const ownReply = message('own-reply', 5)
  const incoming = [message('reply-b', 4), message('reply-a', 4)]
  const result = mergeMessages([ownReply], incoming)
  assert.deepEqual(result.map(m => m.id), ['reply-a', 'reply-b', 'own-reply'])
  assert.strictEqual(mergeMessages(result, incoming), result, 'unchanged polls must not rerender or trigger scrolling')
})

test('page refresh preserves pending sends and stale snapshots preserve received replies', () => {
  const pending = message('temp-pending', 5)
  const newest = message('new-reply', 4)
  const older = message('older', 1)
  const result = mergeMessages([older, newest, pending], [older])
  assert.deepEqual(result.map(m => m.id), ['older', 'new-reply', 'temp-pending'])
})

test('poll before send acknowledgement reconciles to a single saved message', () => {
  const pending = message('temp-pending', 5)
  const saved = message('saved', 4, { attachments: [{ id: 'attachment-1' }] })
  const polled = mergeMessages([pending], [saved])
  const acknowledged = mergeMessages(polled, [message('saved', 4)], pending.id)
  assert.equal(acknowledged.length, 1)
  assert.equal(acknowledged[0].id, saved.id)
  assert.deepEqual(acknowledged[0].attachments, saved.attachments)
})

test('send acknowledgement before poll also deduplicates and updates server content', () => {
  const saved = message('saved', 4)
  const acknowledged = mergeMessages([message('temp-pending', 5)], [saved], 'temp-pending')
  const polled = mergeMessages(acknowledged, [{ ...saved, message_body: 'Updated text', sender: { full_name: 'Support' } }])
  assert.equal(polled.length, 1)
  assert.equal(polled[0].message_body, 'Updated text')
  assert.equal(polled[0].sender.full_name, 'Support')
})

const fake = (name, exports) => { const id = require.resolve(name); require.cache[id] = { id, filename: id, loaded: true, exports } }
let session = { id: 'client-1', role: 'client' }
let allowed = true
let fail = false
let capturedRole
fake('@/lib/auth/session.ts', { getSession: async () => session })
fake('@/lib/db', { isNeonConfigured: () => false })
fake('@/lib/email/store.ts', { emailQuery: async () => [] })
fake('@/lib/data/tickets.ts', {
  getTicketAccess: async () => allowed ? { id: 'ticket-1', status: 'assigned' } : null,
  getTicketMessages: async (_id, role) => {
    if (fail) throw new Error('Database unavailable')
    capturedRole = role
    return [message('public', 1)]
  },
})
const { GET } = require('../app/api/tickets/[id]/messages/route.ts')
const request = (query = '') => GET(new Request(`https://support.example.com/api/tickets/ticket-1/messages${query}`), { params: Promise.resolve({ id: 'ticket-1' }) })

test('live messages enforce session role and disable response caching', async () => {
  const response = await request('?role=admin')
  assert.equal(response.status, 200)
  assert.equal(capturedRole, 'client')
  assert.match(response.headers.get('cache-control'), /no-store/)
  assert.equal(response.headers.get('x-ticket-status'), 'assigned')
  assert.equal((await response.json())[0].id, 'public')
})

test('live messages reject expired sessions and revoked ticket access', async () => {
  const previous = session
  session = null
  try { assert.equal((await request()).status, 401) } finally { session = previous }
  allowed = false
  try { assert.equal((await request()).status, 404) } finally { allowed = true }
})

test('invalid cursors and limits return controlled errors', async () => {
  for (const query of ['?after=invalid', '?before=invalid', '?limit=NaN', '?limit=-1', '?limit=2.5']) {
    assert.equal((await request(query)).status, 400)
  }
})

test('temporary database outages return retryable errors without leaking details', async () => {
  fail = true
  try {
    const response = await request()
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('retry-after'), '2')
    assert.doesNotMatch(JSON.stringify(await response.json()), /Database unavailable/)
  } finally { fail = false }
})
