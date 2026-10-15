import { headers } from 'next/headers'
import { digest } from '@/lib/email/security'
import { emailQuery } from '@/lib/email/store'
export async function allowAuthRequest(scope: string, email: string) {
  // Configure a trusted reverse proxy to overwrite x-forwarded-for. No raw IP is persisted.
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const key = digest(`${scope}:${ip}`)
  const perEmail = digest(`${scope}:email:${email}`)
  const rows = await emailQuery<{ hits: number }>(`INSERT INTO auth_request_limits(key,hits,reset_at)
 VALUES ($1,1,now()+interval '1 hour'),($2,1,now()+interval '1 hour')
 ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN auth_request_limits.reset_at<now() THEN 1 ELSE auth_request_limits.hits+1 END,
 reset_at=CASE WHEN auth_request_limits.reset_at<now() THEN now()+interval '1 hour' ELSE auth_request_limits.reset_at END RETURNING hits`, [key, perEmail])
  return rows.every(row => row.hits <= 10)
}
