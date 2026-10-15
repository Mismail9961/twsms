'use server'
import { getSession } from '@/lib/auth/session'
import { emailQuery } from '@/lib/email/store'
import { revalidatePath } from 'next/cache'
export async function retryFailedEmail(formData: FormData) {
  const user = await getSession()
  if (user?.role !== 'admin') throw new Error('Unauthorized')
  const id = String(formData.get('id') || '')
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid job')
  // Uncertain deliveries need a deliberate operator decision after checking the sender's Sent folder.
  await emailQuery("UPDATE email_outbox SET status='pending',attempts=0,available_at=now(),last_error=NULL WHERE id=$1 AND status='failed'", [id])
  revalidatePath('/admin/email')
}
