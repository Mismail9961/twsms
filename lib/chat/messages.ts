import type { TicketMessage } from '@/lib/types'

// Polling, refreshed page props, and send acknowledgements can arrive in any order.
// Merge by server ID rather than replacing the conversation or advancing past replies.
export function mergeMessages(
  current: TicketMessage[],
  incoming: TicketMessage[],
  acknowledgedId?: string
): TicketMessage[] {
  const byId = new Map(current.filter(message => message.id !== acknowledgedId).map(message => [message.id, message]))
  for (const message of incoming) {
    const existing = byId.get(message.id)
    byId.set(message.id, { ...existing, ...message, sender: message.sender ?? existing?.sender, attachments: message.attachments ?? existing?.attachments })
  }
  const merged = [...byId.values()].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.id.localeCompare(b.id))
  return JSON.stringify(current) === JSON.stringify(merged) ? current : merged
}
