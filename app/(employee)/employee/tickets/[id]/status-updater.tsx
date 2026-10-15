'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { updateTicketStatus } from '@/app/actions/tickets'
import type { TicketStatus } from '@/lib/types'

export function EmployeeStatusUpdater({
  ticketId,
  currentStatus,
}: {
  ticketId: string
  currentStatus: TicketStatus
}) {
  const [status, setStatus] = useState<TicketStatus>(currentStatus)
  const [note, setNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUpdating) return

    setIsUpdating(true)
    setSuccess(false)
    try {
      await updateTicketStatus(ticketId, status, note)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TicketStatus)}
          disabled={isUpdating}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-base sm:text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#2c2772] focus:border-[#2c2772]"
        >
          <option value="in_progress">In Progress</option>
          <option value="waiting_for_client">Waiting for Client</option>
          <option value="waiting_for_support">Waiting for Support</option>
          <option value="resolved">Mark as Resolved</option>
        </select>

        <button
          type="submit"
          disabled={isUpdating || status === currentStatus}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2c2772] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2c2772]/90 disabled:opacity-50 transition-colors w-full sm:w-auto"
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          <span>Update Status</span>
        </button>
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional status transition note..."
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base sm:text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2c2772] focus:border-[#2c2772]"
      />

      {success && (
        <p className="text-[11px] font-semibold text-emerald-700">✓ Status updated successfully</p>
      )}
    </form>
  )
}
