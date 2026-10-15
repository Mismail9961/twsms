import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import {
  getTicketById,
  getTicketMessages,
  getTicketStatusHistory,
  getTicketAttachments,
} from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { TicketChat } from '@/components/tickets/ticket-chat'
import { SharedDocuments } from '@/components/tickets/shared-documents'
import { EmployeeStatusUpdater } from './status-updater'
import { formatDateTime, formatDate, getInitials } from '@/lib/utils'

export default async function EmployeeTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const [ticket, messages, history, attachments] = await Promise.all([
    getTicketById(id, { id: session.id, role: session.role }),
    getTicketMessages(id, session.role),
    getTicketStatusHistory(id),
    getTicketAttachments(id),
  ])

  // Access control check: Employee cannot access unless assigned
  if (!ticket) notFound()

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/employee/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Assigned Queue</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gray-400">ID: {ticket.ticket_number}</span>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ticket Controls & Context (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* Quick Status Updater */}
          <div className="rounded-2xl border border-[#2c2772]/20 bg-[#2c2772]/5 p-4 sm:p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c2772] mb-3">
              Incident Status Management
            </h3>
            <EmployeeStatusUpdater ticketId={ticket.id} currentStatus={ticket.status} />
          </div>

          {/* Ticket Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#2c2772] bg-[#2c2772]/10 px-2 py-0.5 rounded-md border border-[#2c2772]/20">
                  {ticket.ticket_number}
                </span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{ticket.title}</h2>
            </div>

            {/* Client Context */}
            <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2c2772] text-xs font-bold text-white shadow shrink-0">
                {getInitials(ticket.client?.full_name || 'CL')}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">{ticket.client?.full_name}</div>
                <div className="text-[11px] text-gray-500 truncate">{ticket.client?.email}</div>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap rounded-xl bg-gray-50 p-3.5 sm:p-4 border border-gray-100">
              {ticket.description}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block font-medium">Category</span>
                <span className="text-gray-900 font-semibold">{ticket.category?.name || 'Technical'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Affected Service</span>
                <span className="text-gray-900 font-semibold">{ticket.affected_service || 'Not specified'}</span>
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

          <SharedDocuments
            ticketId={ticket.id}
            initialAttachments={attachments}
            currentUserId={session.id}
            userRole={session.role}
          />

          {/* Assigned Co-Engineers */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Assigned Team Members
            </h3>
            <div className="space-y-3">
              {ticket.assignments?.map((asg) => (
                <div key={asg.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2c2772] text-xs font-bold text-white shrink-0">
                    {getInitials(asg.employee?.full_name || 'TW')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">
                      {asg.employee?.full_name} {asg.is_primary && '(Lead)'}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{asg.employee?.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Status Activity Log
            </h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {history.map((h) => (
                <div key={h.id} className="relative flex items-start gap-3 pl-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#2c2772] ring-4 ring-white mt-1 z-10" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-gray-900">
                      Status changed to <span className="capitalize">{h.new_status}</span>
                    </div>
                    {h.change_note && (
                      <p className="text-[11px] text-gray-500">{h.change_note}</p>
                    )}
                    <span className="text-[10px] text-gray-400 block">
                      {formatDateTime(h.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Conversation & Internal Notes (7 cols) */}
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
