import Link from 'next/link'
import { type LucideIcon, Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/50 p-8 sm:p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C2772]/10 text-[#2C2772] mb-4 ring-8 ring-[#2C2772]/5">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center rounded-xl bg-[#2C2772] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#231f5c] transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center justify-center rounded-xl bg-[#2C2772] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#231f5c] transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
