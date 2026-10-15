import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserMinus } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import {
  getTicketById,
  getTicketMessages,
  getTicketStatusHistory,
  getTicketAttachments,
  getAllEmployees,
} from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { TicketChat } from '@/components/tickets/ticket-chat'
import { SharedDocuments } from '@/components/tickets/shared-documents'
import { AdminControls } from './admin-controls'
import { unassignEmployee } from '@/app/actions/tickets'
import { formatDateTime, formatDate, getInitials } from '@/lib/utils'

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const [ticket, messages, history, attachments, allEmployees] = await Promise.all([
    getTicketById(id),
    getTicketMessages(id, session.role),
    getTicketStatusHistory(id),
    getTicketAttachments(id),
    getAllEmployees(),
  ])

  if (!ticket) notFound()

  const assignedEmployeeIds = ticket.assignments?.map((a) => a.employee_id) || []

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Tickets</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gray-400">ID: {ticket.ticket_number}</span>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Admin Controls & Context (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Admin Assignment & Lifecycle Controls */}
          <AdminControls
            ticketId={ticket.id}
            currentStatus={ticket.status}
            allEmployees={allEmployees}
            assignedEmployeeIds={assignedEmployeeIds}
          />

          {/* Ticket Information */}
          <div className="rounded-2xl border border-[#2C2772]/15 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#2C2772] bg-[#2C2772]/10 px-2 py-0.5 rounded-md border border-[#2C2772]/20">
                  {ticket.ticket_number}
                </span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{ticket.title}</h2>
            </div>

            {/* Client Context */}
            <div className="rounded-xl bg-slate-50 p-3 sm:p-3.5 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#2C2772] text-xs font-bold text-white shadow">
                  {getInitials(ticket.client?.full_name || 'CL')}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{ticket.client?.full_name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{ticket.client?.email}</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#2C2772]/10 text-[#2C2772] shrink-0">
                Client
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 sm:p-4 border border-slate-100">
              {ticket.description}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block font-medium">Category</span>
                <span className="text-gray-900 font-semibold">{ticket.category?.name || 'Technical'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Affected Service</span>
                <span className="text-gray-900 font-semibold">{ticket.affected_service || 'None'}</span>
              </div>
              {ticket.serial_number && (
                <div>
                  <span className="text-gray-400 block font-medium">Serial Number</span>
                  <span className="text-gray-900 font-semibold">{ticket.serial_number}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400 block font-medium">Created</span>
                <span className="text-gray-900 font-semibold">{formatDate(ticket.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Last Activity</span>
                <span className="text-gray-900 font-semibold">{formatDate(ticket.updated_at)}</span>
              </div>
            </div>

          </div>

            {/* Currently Assigned Staff with Unassign actions */}
            <div className="rounded-2xl border border-[#2C2772]/15 bg-white p-4 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2C2772]">
                Assigned Engineers ({ticket.assignments?.length || 0})
              </h3>

              {ticket.assignments && ticket.assignments.length > 0 ? (
                <div className="space-y-3">
                  {ticket.assignments.map((asg) => (
                    <div key={asg.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2C2772] text-xs font-bold text-white shadow">
                          {getInitials(asg.employee?.full_name || 'TW')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                            <span className="truncate">{asg.employee?.full_name}</span>
                            {asg.is_primary && (
                              <span className="px-1.5 py-0.2 rounded bg-[#2C2772]/10 text-[#2C2772] text-[10px] font-bold shrink-0">
                                Lead
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{asg.employee?.email}</div>
                        </div>
                      </div>

                      <form action={unassignEmployee.bind(null, ticket.id, asg.employee_id)}>
                        <button
                          type="submit"
                          title="Unassign employee from ticket"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-600 italic">No employees assigned yet.</p>
              )}
            </div>

            <SharedDocuments
              ticketId={ticket.id}
              initialAttachments={attachments}
              currentUserId={session.id}
              userRole={session.role}
            />

          {/* Activity Log */}
          <div className="rounded-2xl border border-[#2C2772]/15 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2C2772]">
              Status Activity History
            </h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {history.map((h) => (
                <div key={h.id} className="relative flex items-start gap-3 pl-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#2C2772] ring-4 ring-white mt-1 z-10 shrink-0" />
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-semibold text-slate-900">
                      Status changed to <span className="capitalize">{h.new_status}</span>
                    </div>
                    {h.change_note && (
                      <p className="text-[11px] text-slate-500">{h.change_note}</p>
                    )}
                    <span className="text-[10px] text-slate-400 block">
                      {formatDateTime(h.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Full Staff Live Chat & Internal Notes (7 cols) */}
        <div className="lg:col-span-7">
          <TicketChat
            ticketId={ticket.id}
            currentUserId={session.id}
            userRole={session.role}
            initialMessages={messages}
          />
        </div>
      </div>
    </div>
  )
}
