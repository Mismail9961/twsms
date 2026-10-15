import { getSession } from '@/lib/auth/session'
import { emailQuery } from '@/lib/email/store'
import { retryFailedEmail } from '@/app/actions/email'
export const dynamic = 'force-dynamic'
export default async function EmailDeliveryPage() {
  const user = await getSession()
  if (user?.role !== 'admin') return null
  const rows = await emailQuery<{ id: string; kind: string; status: string; attempts: number; last_error: string; created_at: string }>('SELECT id,kind,status,attempts,last_error,created_at FROM email_outbox ORDER BY created_at DESC LIMIT 100')
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Email delivery</h1><p>Latest 100 jobs. Uncertain deliveries require checking the sender’s Sent folder before an operator reschedules them.</p><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{['Event', 'Status', 'Attempts', 'Error', 'Created', 'Action'].map(label => <th className="p-2" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td className="p-2">{row.kind}</td><td>{row.status}</td><td>{row.attempts}</td><td>{row.last_error}</td><td>{new Date(row.created_at).toISOString()}</td><td>{row.status === 'failed' && <form action={retryFailedEmail}><input type="hidden" name="id" value={row.id} /><button className="text-blue-600">Retry</button></form>}</td></tr>)}</tbody></table></div></div>
}
