const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { PGlite } = require('@electric-sql/pglite')
const fake = (name, exports) => { const id = require.resolve(name); require.cache[id] = { id, filename: id, loaded: true, exports } }
let session = null
let configured = true
let db
const refreshed = []
const memoryDb = { achievements: [] }
fake('@/lib/auth/session.ts', { getSession: async () => session })
fake('next/cache', { revalidatePath: path => refreshed.push(path) })
fake('@/lib/db', { isNeonConfigured: () => configured, memoryDb, dbQueryRequired: async (sql, params = []) => (await db.query(sql, params)).rows })
const { saveAchievement, deleteAchievement } = require('../app/actions/achievements.ts')
const { getAchievements } = require('../lib/data/achievements.ts')
const form = (data = {}) => {
  const f = new FormData()
  for (const [key, value] of Object.entries({ date: '2026-10-25', category: 'Security', title: 'New milestone', description: 'Completed a secure network deployment.', ...data })) f.set(key, String(value))
  return f
}
before(async () => {
  db = new PGlite()
  await db.exec(fs.readFileSync('db/migrations/005_achievements.sql', 'utf8'))
})
after(async () => { await db.close() })

test('achievement management enforces authorization, validation, persistence and the five-item cap', async () => {
  assert.equal((await getAchievements()).length, 5)
  for (const role of [null, 'client', 'employee']) {
    session = role ? { role } : null
    assert.match((await saveAchievement(undefined, form())).error, /Only administrators/)
    assert.match((await deleteAchievement(undefined, form({ slot: 1 }))).error, /Only administrators/)
  }
  session = { role: 'admin' }
  assert.match((await saveAchievement(undefined, form())).error, /five/)
  for (const values of [{ date: '2026-02-30' }, { title: ' ' }, { category: 'a'.repeat(81) }, { description: 'a'.repeat(2001) }, { slot: 6 }, { slot: 'invalid' }]) {
    assert.ok((await saveAchievement(undefined, form(values))).error)
  }
  assert.ok((await saveAchievement(undefined, form({ slot: 1, title: 'Updated milestone' }))).success)
  assert.equal((await getAchievements())[0].title, 'Updated milestone')
  assert.ok((await deleteAchievement(undefined, form({ slot: 2 }))).success)
  assert.equal((await getAchievements()).length, 4)
  const concurrent = await Promise.all([saveAchievement(undefined, form()), saveAchievement(undefined, form())])
  assert.equal(concurrent.filter(result => result.success).length, 1)
  assert.equal((await getAchievements()).length, 5)
  await assert.rejects(db.query("INSERT INTO achievements VALUES (6, '2026-10-25', 'Test', 'Overflow', 'Must fail')"), /check constraint/)
  assert.ok(refreshed.includes('/'))
  assert.ok(refreshed.includes('/admin/achievements'))
  for (let slot = 1; slot <= 5; slot++) await deleteAchievement(undefined, form({ slot }))
  assert.deepEqual(await getAchievements(), [])
  assert.ok((await saveAchievement(undefined, form())).success)
  assert.equal((await getAchievements())[0].slot, 1)
})

test('development store also enforces the cap and supports edits and deletes', async () => {
  configured = false
  session = { role: 'admin' }
  try {
    for (let i = 0; i < 5; i++) assert.ok((await saveAchievement(undefined, form())).success)
    assert.ok((await saveAchievement(undefined, form())).error)
    assert.ok((await saveAchievement(undefined, form({ slot: 1, title: 'Edited locally' }))).success)
    assert.equal((await getAchievements())[0].title, 'Edited locally')
    assert.ok((await deleteAchievement(undefined, form({ slot: 1 }))).success)
    assert.equal((await getAchievements()).length, 4)
  } finally { configured = true }
})
