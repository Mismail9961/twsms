const { test } = require('node:test')
const assert = require('node:assert/strict')
const fake = (name, exports) => { const id = require.resolve(name); require.cache[id] = { id, filename: id, loaded: true, exports } }
let session = null
fake('@/lib/auth/session.ts', { getSession: async () => session })
fake('next/cache', { revalidatePath() {} })
// All file tests run against a disposable in-memory database, never a configured server.
delete process.env.DATABASE_URL
const { memoryDb } = require('../lib/db/index.ts')
const upload = require('../app/api/tickets/[id]/attachments/route.ts')
const download = require('../app/api/attachments/[id]/route.ts')
const client = memoryDb.profiles.find(profile => profile.role === 'client')
const employee = memoryDb.profiles.find(profile => profile.role === 'employee')
const ticket = memoryDb.tickets.find(record => record.client_id === client.id)
const context = id => ({ params: Promise.resolve({ id }) })
const request = file => {
  const form = new FormData()
  if (file) form.set('file', file)
  return new Request('http://localhost/api/upload', { method: 'POST', body: form })
}

test('file uploads require authentication, ticket access and a non-empty bounded file', async () => {
  assert.equal((await upload.POST(request(), context(ticket.id))).status, 401)
  session = { id: 'other-client', role: 'client' }
  assert.equal((await upload.POST(request(), context(ticket.id))).status, 404)
  session = client
  assert.equal((await upload.POST(request(), context(ticket.id))).status, 400)
  assert.equal((await upload.POST(request(new File([], 'empty.txt')), context(ticket.id))).status, 400)
  const large = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'large.bin')
  assert.equal((await upload.POST(request(large), context(ticket.id))).status, 413)
})

test('uploaded bytes round-trip privately, filenames are safe, and only the owner can delete', async () => {
  session = client
  const response = await upload.POST(request(new File(['hello audit'], '../report "quoted".txt', { type: 'text/plain' })), context(ticket.id))
  assert.equal(response.status, 201)
  const { attachment } = await response.json()
  assert.ok(!attachment.original_filename.includes('/'))
  const result = await download.GET(new Request('http://localhost/file'), context(attachment.id))
  assert.equal(result.status, 200)
  assert.equal(await result.text(), 'hello audit')
  assert.equal(result.headers.get('cache-control'), 'private, no-store')
  assert.equal(result.headers.get('x-content-type-options'), 'nosniff')
  assert.ok(result.headers.get('content-disposition').includes('filename*=UTF-8'))
  session = null
  assert.equal((await download.GET(new Request('http://localhost/file'), context(attachment.id))).status, 401)
  session = { id: 'stranger', role: 'client' }
  assert.equal((await download.GET(new Request('http://localhost/file'), context(attachment.id))).status, 404)
  session = employee
  assert.equal((await download.DELETE(new Request('http://localhost/file'), context(attachment.id))).status, 403)
  session = client
  assert.equal((await download.DELETE(new Request('http://localhost/file'), context(attachment.id))).status, 200)
  assert.equal((await download.GET(new Request('http://localhost/file'), context(attachment.id))).status, 404)
})
