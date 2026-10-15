'use client'

import { useState } from 'react'
import { UserPlus, Check, Loader2 } from 'lucide-react'
import { assignEmployee, updateTicketStatus } from '@/app/actions/tickets'
import type { Profile, TicketStatus } from '@/lib/types'

interface AdminControlsProps {
  ticketId: string
  currentStatus: TicketStatus
  allEmployees: Profile[]
  assignedEmployeeIds: string[]
}

export function AdminControls({
  ticketId,
  currentStatus,
  allEmployees,
  assignedEmployeeIds,
}: AdminControlsProps) {
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [status, setStatus] = useState<TicketStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [statusNote, setStatusNote] = useState('')
  const [msg, setMsg] = useState('')

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmpId || loading) return

    setLoading(true)
    setMsg('')
    try {
      await assignEmployee(ticketId, selectedEmpId, isPrimary)
      setSelectedEmpId('')
      setIsPrimary(false)
      setMsg('✓ Employee assigned successfully')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    try {
      await updateTicketStatus(ticketId, status, statusNote)
      setMsg('✓ Ticket status updated')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const unassignedEmployees = allEmployees.filter(
    (emp) => !assignedEmployeeIds.includes(emp.id)
  )

  return (
    <div className="space-y-6">
      {/* Status Controller */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Update Ticket Lifecycle Status
        </h3>

        <form onSubmit={handleStatusChange} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_client">Waiting for Client</option>
              <option value="waiting_for_support">Waiting for Support</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <button
              type="submit"
              disabled={loading || status === currentStatus}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>Apply Status</span>
            </button>
          </div>

          <input
            type="text"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            placeholder="Reason or activity note for this change..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>
      </div>

      {/* Multi-Employee Assignment Controller */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Multi-Employee Assignment
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Assign multiple engineers (e.g. backend, frontend, devops) to collaborate on this ticket.
          </p>
        </div>

        <form onSubmit={handleAssign} className="space-y-3">
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            disabled={loading || unassignedEmployees.length === 0}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">
              {unassignedEmployees.length === 0
                ? 'All staff already assigned'
                : 'Select an engineer to assign...'}
            </option>
            {unassignedEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.role})
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
              />
              <span>Set as Lead Engineer</span>
            </label>

            <button
              type="submit"
              disabled={loading || !selectedEmpId}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Assign Staff</span>
            </button>
          </div>
        </form>

        {msg && <p className="text-xs font-semibold text-emerald-700">{msg}</p>}
      </div>
    </div>
  )
}
