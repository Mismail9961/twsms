import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const digest = (value: string) => createHash('sha256').update(value).digest('hex')
// Short codes need a server-held key so a leaked database cannot be brute-forced offline.
export function challengeDigest(secret: string, purpose: 'verify' | 'reset', email: string) {
  if (purpose === 'reset') return digest(secret)
  const signingKey = createHmac('sha256', key()).update('twsms-verification-v1').digest()
  return createHmac('sha256', signingKey).update(`${email.trim().toLowerCase()}:${secret}`).digest('hex')
}
export function equalSecret(a: string, b: string) {
  return timingSafeEqual(Buffer.from(digest(a)), Buffer.from(digest(b)))
}
function key() {
  const value = Buffer.from(process.env.EMAIL_ENCRYPTION_KEY || '', 'base64')
  if (value.length !== 32) throw new Error('email_configuration')
  return value
}
export function seal(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  return Buffer.concat([iv, cipher.update(value, 'utf8'), cipher.final(), cipher.getAuthTag()]).toString('base64url')
}
export function unseal(value: string) {
  const data = Buffer.from(value, 'base64url')
  const cipher = createDecipheriv('aes-256-gcm', key(), data.subarray(0, 12))
  cipher.setAuthTag(data.subarray(-16))
  return Buffer.concat([cipher.update(data.subarray(12, -16)), cipher.final()]).toString('utf8')
}
export function appLink(path: string) {
  const base = new URL(process.env.APP_BASE_URL || '')
  if (base.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && base.hostname === 'localhost')) throw new Error('email_configuration')
  return new URL(path, base).toString()
}
export function validEmail(value: string) {
  return value.length <= 254 && /^[^\s<>@\r\n]+@[^\s<>@\r\n]+\.[^\s<>@\r\n]+$/.test(value)
}
