import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import type { TicketStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: TicketStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  )
}
