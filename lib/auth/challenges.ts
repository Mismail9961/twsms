import { randomBytes, randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { emailQuery } from '@/lib/email/store'
import { challengeDigest, seal, appLink } from '@/lib/email/security'

// Verification uses a short, keyed code; password reset retains a 256-bit token.
export async function issueChallenge(userId: string, purpose: 'verify' | 'reset') {
  const [user] = await emailQuery<{ email: string }>('SELECT email FROM profiles WHERE id=$1 AND account_status=\'active\'', [userId])
  if (!user) return
  const secret = purpose === 'verify' ? randomInt(0, 10000).toString().padStart(4, '0') : randomBytes(32).toString('base64url')
  appLink('/') // Fail before writing if deployment URLs are invalid.
  const encrypted = seal(secret)
  const ttl = purpose === 'verify' ? 5 : Math.min(30, Math.max(5, Number(process.env.AUTH_CHALLENGE_TTL_MINUTES) || 15))
  await emailQuery(`WITH challenge AS (
 INSERT INTO auth_challenges(user_id,purpose,digest,expires_at)
 SELECT id,$2,$3,now()+$5::integer*interval '1 minute' FROM profiles WHERE id=$1 AND account_status='active'
 AND ($2='verify' OR auth_provider='credentials')
 ON CONFLICT(user_id,purpose) DO UPDATE SET digest=$3,expires_at=now()+$5::integer*interval '1 minute',created_at=now(),attempts=0,consumed_at=NULL
 WHERE auth_challenges.created_at < now()-interval '60 seconds'
 RETURNING user_id,created_at
 ) INSERT INTO email_outbox(event_key,kind,recipient_id,payload)
 SELECT $2||':'||user_id||':'||created_at,$2,user_id,jsonb_build_object('secret',$4::text) FROM challenge ON CONFLICT DO NOTHING`, [userId, purpose, challengeDigest(secret, purpose, user.email), encrypted, ttl])
}
export async function requestReset(email: string) {
  const users = await emailQuery<{ id: string }>("SELECT id FROM profiles WHERE lower(email)=$1 AND account_status='active' AND auth_provider='credentials'", [email])
  if (users[0]) await issueChallenge(users[0].id, 'reset')
}
export async function consumeChallenge(email: string, code: string, purpose: 'verify' | 'reset', password?: string) {
  if (!(purpose === 'verify' ? /^\d{4}$/ : /^[A-Za-z0-9_-]{43}$/).test(code) || email.length > 254) return false
  const hash = password ? await bcrypt.hash(password, 12) : null
  // Serialize attempts and consumption in one SQL statement. A valid challenge can be consumed once.
  const rows = await emailQuery<{ id: string }>(`WITH attempt AS (
 UPDATE auth_challenges c SET attempts=c.attempts+1,
 consumed_at=CASE WHEN c.digest=$3 THEN now() ELSE c.consumed_at END
 FROM profiles p WHERE c.user_id=p.id AND lower(p.email)=$1 AND c.purpose=$2
 AND c.consumed_at IS NULL AND c.expires_at>now() AND c.attempts<5 AND p.account_status='active'
 AND ($2='verify' OR p.auth_provider='credentials')
 RETURNING c.user_id,c.digest
 ) UPDATE profiles p SET
 email_verified_at=CASE WHEN $2='verify' THEN now() ELSE p.email_verified_at END,
 requires_email_verification=CASE WHEN $2='verify' THEN false ELSE p.requires_email_verification END,
 password_hash=COALESCE($4,p.password_hash),session_version=p.session_version+CASE WHEN $2='reset' THEN 1 ELSE 0 END
 FROM attempt a WHERE p.id=a.user_id AND a.digest=$3 RETURNING p.id`, [email, purpose, challengeDigest(code, purpose, email), hash])
  return rows.length === 1
}
