import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/utils'
import type { Priority } from '@/lib/types'

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const colorClass = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700 border-gray-200'
  const label = PRIORITY_LABELS[priority] || priority

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{label}</span>
    </span>
  )
}
