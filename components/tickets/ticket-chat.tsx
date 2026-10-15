'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Lock, FileText, Loader2 } from 'lucide-react'
import { sendMessage } from '@/app/actions/tickets'
import { formatDateTime, getInitials, formatFileSize } from '@/lib/utils'
import type { TicketMessage, Role, MessageType } from '@/lib/types'

interface TicketChatProps {
  ticketId: string
  currentUserId: string
  userRole: Role
  initialMessages: TicketMessage[]
}

/** Polling interval in ms — 5 s keeps the chat responsive without hammering the server */
const POLL_INTERVAL_MS = 5000

export function TicketChat({
  ticketId,
  currentUserId,
  userRole,
  initialMessages,
}: TicketChatProps) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef(true)

  // Keep a ref to the latest message list for the poll callback
  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Sync with server-provided initialMessages when parent re-renders
  const [prevInitial, setPrevInitial] = useState(initialMessages)
  if (prevInitial !== initialMessages) {
    setPrevInitial(initialMessages)
    setMessages(initialMessages)
  }

  // Pause polling when browser tab is inactive / backgrounded
  useEffect(() => {
    const handleVisibility = () => {
      pollingRef.current = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Poll for new messages on a stable interval using after cursor
  useEffect(() => {
    let active = true

    const poll = async () => {
      if (!pollingRef.current) return
      try {
        const lastServerMsg = messagesRef.current.filter((m) => !m.id.startsWith('temp-')).pop()
        const afterQuery = lastServerMsg?.created_at ? `&after=${encodeURIComponent(lastServerMsg.created_at)}` : ''

        const res = await fetch(`/api/tickets/${ticketId}/messages?role=${userRole}${afterQuery}`, {
          cache: 'no-store',
        })
        if (!active) return
        if (res.ok) {
          const data: TicketMessage[] = await res.json()
          if (!Array.isArray(data) || data.length === 0) return

          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const newMsgs = data.filter((m) => !existingIds.has(m.id))
            if (newMsgs.length === 0) return prev
            return [...prev, ...newMsgs]
          })
        } else if (res.status === 401) {
          // Session expired — stop polling to avoid spamming 401s
          pollingRef.current = false
        }
      } catch {
        // Silent fail on network hiccup — next interval will retry
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [ticketId, userRole])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isSending) return

    const text = inputText.trim()
    setInputText('')
    setIsSending(true)
    setSendError(null)

    const messageType: MessageType =
      userRole === 'client'
        ? 'client_message'
        : isInternalNote
        ? 'internal_note'
        : 'staff_message'

    // Optimistic UI update
    const optimisticId = `temp-${Date.now()}`
    const optimisticMessage: TicketMessage = {
      id: optimisticId,
      ticket_id: ticketId,
      sender_id: currentUserId,
      message_body: text,
      message_type: messageType,
      created_at: new Date().toISOString(),
      sender: {
        id: currentUserId,
        full_name: 'You',
        email: '',
        role: userRole,
        account_status: 'active',
        created_at: '',
        updated_at: '',
      },
    }

    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const saved = await sendMessage(ticketId, text, messageType)
      // Replace optimistic message with the real server message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId
            ? { ...optimisticMessage, id: saved.id, created_at: saved.created_at }
            : m
        )
      )
      setIsInternalNote(false)
    } catch (err) {
      console.error('Failed to send message:', err)
      // Remove the optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setSendError('Message could not be sent. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const canPostInternalNotes = userRole === 'admin' || userRole === 'employee'

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Real-Time Ticket Conversation</h3>
          <p className="text-xs text-gray-500">Live communication with Technology World support team</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Session Active</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
            <p className="text-sm">No messages exchanged yet.</p>
            <p className="text-xs mt-1">Start the conversation below.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            const isInternal = msg.message_type === 'internal_note'
            const isStaff = msg.message_type === 'staff_message'

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                    isInternal
                      ? 'bg-amber-600 ring-2 ring-amber-200'
                      : isStaff
                      ? 'bg-blue-600'
                      : 'bg-slate-800'
                  }`}
                  title={msg.sender?.full_name}
                >
                  {getInitials(msg.sender?.full_name || (isMe ? 'You' : 'TW'))}
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-2 text-[11px] ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span className="font-semibold text-gray-900">
                      {isMe ? 'You' : msg.sender?.full_name || 'Support Agent'}
                    </span>
                    {isInternal && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200">
                        <Lock className="h-2.5 w-2.5" /> Internal Staff Note
                      </span>
                    )}
                    <span className="text-gray-400">{formatDateTime(msg.created_at)}</span>
                  </div>

                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                      isInternal
                        ? 'bg-amber-50 text-amber-950 border border-amber-200'
                        : isMe
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message_body}</p>

                    {/* Attachments if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-black/10 space-y-2">
                        {msg.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={`/api/attachments/${att.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs underline font-medium hover:opacity-80"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>{att.original_filename}</span>
                            <span className="opacity-70">({formatFileSize(att.file_size)})</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-4 bg-gray-50/75 space-y-2">
        {sendError && (
          <p className="text-xs font-medium text-red-600 px-1">{sendError}</p>
        )}

        {canPostInternalNotes && (
          <div className="flex items-center justify-between pb-1">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
              />
              <span className={isInternalNote ? 'text-amber-700 font-semibold' : ''}>
                🔒 Post as Internal Note (Staff Only — hidden from client)
              </span>
            </label>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setSendError(null) }}
            disabled={isSending}
            placeholder={
              isInternalNote
                ? 'Type internal note visible only to employees and admins...'
                : 'Type your message or technical question...'
            }
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all ${
              isInternalNote
                ? 'border-amber-300 bg-amber-50/50 focus:ring-amber-500'
                : 'border-gray-200 bg-white focus:ring-blue-500'
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isInternalNote
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
