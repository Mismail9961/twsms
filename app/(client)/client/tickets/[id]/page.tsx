import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Star, ShieldCheck } from 'lucide-react'
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
import { ResolutionActions } from './resolution-actions'
import { RatingForm } from './rating-form'
import { formatDateTime, formatDate, getInitials } from '@/lib/utils'
import { TICKET_RESOLUTION_METHOD_LABELS } from '@/lib/types'

export default async function ClientTicketDetailPage({
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

  if (!ticket) notFound()

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/client/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Tickets</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gray-400">ID: {ticket.ticket_number}</span>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Resolution Confirmation Banner (Section 7) */}
      {ticket.status === 'resolved' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Our Engineering Team Marked This Ticket as Resolved</span>
              </div>
              <p className="text-xs text-emerald-700">
                Please verify if your problem has been fixed. Confirm resolution to close this request, or report that the problem still persists.
              </p>
            </div>
            <ResolutionActions ticketId={ticket.id} />
          </div>
        </div>
      )}

      {/* Rating & Feedback Banner (Section 8) */}
      {ticket.status === 'closed' && (
        <div className="rounded-2xl border border-[#2c2772]/20 bg-[#2c2772]/5 p-4 sm:p-6 shadow-sm">
          {ticket.rating ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#2c2772] font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-[#2c2772]" />
                <span>Your Feedback Submitted</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= ticket.rating!.overall_rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs font-semibold text-gray-700">
                  {ticket.rating.overall_rating} / 5 Stars
                </span>
              </div>
              {ticket.rating.resolution_method && (
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Resolution:</span>{' '}
                  {TICKET_RESOLUTION_METHOD_LABELS[ticket.rating.resolution_method]}
                </p>
              )}
              {ticket.rating.feedback && (
                <p className="text-xs text-gray-600 italic mt-1">
                  &ldquo;{ticket.rating.feedback}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <RatingForm ticketId={ticket.id} />
          )}
        </div>
      )}

      {/* Main Grid: Details + Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Ticket Details Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* Main Info Card */}
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

            <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap rounded-xl bg-gray-50 p-3.5 sm:p-4 border border-gray-100">
              {ticket.description}
            </div>

            {/* Metadata Attributes */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block font-medium">Category</span>
                <span className="text-gray-900 font-semibold">{ticket.category?.name || 'Technical Support'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Affected Service</span>
                <span className="text-gray-900 font-semibold">{ticket.affected_service || 'None specified'}</span>
              </div>
              {ticket.serial_number && (
                <div>
                  <span className="text-gray-400 block font-medium">Serial Number</span>
                  <span className="text-gray-900 font-semibold">{ticket.serial_number}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400 block font-medium">Submitted On</span>
                <span className="text-gray-900 font-semibold">{formatDate(ticket.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Last Activity</span>
                <span className="text-gray-900 font-semibold">{formatDate(ticket.updated_at)}</span>
              </div>
            </div>

          </div>

          {/* Assigned Engineers Panel (Section 6) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Assigned Support Engineers
            </h3>

            {ticket.assignments && ticket.assignments.length > 0 ? (
              <div className="space-y-3">
                {ticket.assignments.map((asg) => (
                  <div key={asg.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#2c2772] text-xs font-bold text-white shadow shrink-0">
                      {getInitials(asg.employee?.full_name || 'TW')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 truncate">
                        <span>{asg.employee?.full_name}</span>
                        {asg.is_primary && (
                          <span className="px-1.5 py-0.2 rounded bg-[#2c2772]/15 text-[#2c2772] text-[10px] font-bold">
                            Lead
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {asg.employee?.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                A specialist engineer is currently being assigned to this ticket.
              </p>
            )}
          </div>

          <SharedDocuments
            ticketId={ticket.id}
            initialAttachments={attachments}
            currentUserId={session.id}
            userRole={session.role}
          />

          {/* Ticket Activity History (Section 7) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Status Activity Timeline
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

        {/* Right Column: Live Chat Interface (7 cols) */}
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
