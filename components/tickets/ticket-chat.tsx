'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Send, Lock, FileText, Loader2, ArrowDown, Check, MessageSquare, WifiOff } from 'lucide-react'
import { mergeMessages } from '@/lib/chat/messages'
import { sendMessage } from '@/app/actions/tickets'
import { formatDateTime, getInitials, formatFileSize } from '@/lib/utils'
import type { TicketMessage, Role, MessageType } from '@/lib/types'

interface TicketChatProps {
  ticketId: string
  currentUserId: string
  userRole: Role
  initialMessages: TicketMessage[]
}

const POLL_INTERVAL_MS = 1500

type ConnectionState = 'connecting' | 'live' | 'reconnecting' | 'offline' | 'expired' | 'unavailable'

export function TicketChat(props: TicketChatProps) {
  return <Conversation key={`${props.ticketId}:${props.currentUserId}:${props.userRole}`} {...props} />
}

function Conversation({ ticketId, currentUserId, userRole, initialMessages }: TicketChatProps) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [connection, setConnection] = useState<ConnectionState>('connecting')
  const [unreadCount, setUnreadCount] = useState(0)
  const streamRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const followingRef = useRef(true)
  const firstScrollRef = useRef(true)
  const seenIdsRef = useRef(new Set(initialMessages.map(message => message.id)))
  const mountedRef = useRef(false)
  const sendingRef = useRef(false)
  const restoreFocusRef = useRef(false)
  const refreshRef = useRef<() => void>(() => {})

  // A Server Action can refresh the page while the optimistic message is pending.
  const [previousInitial, setPreviousInitial] = useState(initialMessages)
  if (previousInitial !== initialMessages) {
    setPreviousInitial(initialMessages)
    setMessages(current => mergeMessages(current, initialMessages))
  }

  const scrollToBottom = useCallback((smooth = true) => {
    const stream = streamRef.current
    if (!stream) return
    followingRef.current = true
    setUnreadCount(0)
    stream.scrollTo({
      top: stream.scrollHeight,
      behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',
    })
  }, [])

  useLayoutEffect(() => {
    const newReplies = messages.filter(message => !seenIdsRef.current.has(message.id) && message.sender_id !== currentUserId).length
    seenIdsRef.current = new Set(messages.map(message => message.id))
    if (firstScrollRef.current || followingRef.current) {
      scrollToBottom(!firstScrollRef.current)
      firstScrollRef.current = false
    } else if (newReplies) {
      setUnreadCount(count => count + newReplies)
    }
  }, [messages, currentUserId, scrollToBottom])

  useEffect(() => {
    mountedRef.current = true
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined
    let busy = false
    let queued = false
    let stopped = false
    let failures = 0

    const poll = async () => {
      clearTimeout(timer)
      if (!active || stopped || document.hidden) return
      if (!navigator.onLine) { setConnection('offline'); return }
      if (busy) { queued = true; return }
      busy = true
      controller = new AbortController()
      const timeout = setTimeout(() => controller?.abort(), 12000)
      try {
        // Read a complete snapshot: timestamp cursors can miss concurrent commits,
        // messages sharing a timestamp, or replies arriving during our own send.
        const response = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}/messages`, {
          cache: 'no-store', signal: controller.signal,
        })
        if (!active) return
        if ([401, 403, 404].includes(response.status)) {
          stopped = true
          setConnection(response.status === 401 ? 'expired' : 'unavailable')
          return
        }
        if (!response.ok) throw new Error('Conversation refresh failed')
        const incoming: TicketMessage[] = await response.json()
        if (!Array.isArray(incoming)) throw new Error('Invalid conversation response')
        if (!active) return
        setMessages(current => mergeMessages(current, incoming))
        failures = 0
        setConnection('live')
      } catch {
        if (active && !document.hidden) {
          failures++
          setConnection(navigator.onLine ? 'reconnecting' : 'offline')
        }
      } finally {
        clearTimeout(timeout)
        busy = false
        if (active && !stopped && !document.hidden && navigator.onLine) {
          timer = setTimeout(poll, queued ? 0 : Math.min(POLL_INTERVAL_MS * 2 ** failures, 10000))
          queued = false
        }
      }
    }
    const resume = () => {
      if (document.hidden) { clearTimeout(timer); controller?.abort(); return }
      void poll()
    }
    const offline = () => { clearTimeout(timer); controller?.abort(); setConnection('offline') }
    refreshRef.current = () => { void poll() }
    document.addEventListener('visibilitychange', resume)
    window.addEventListener('focus', resume)
    window.addEventListener('online', resume)
    window.addEventListener('offline', offline)
    void poll()
    return () => {
      active = false
      mountedRef.current = false
      clearTimeout(timer)
      controller?.abort()
      document.removeEventListener('visibilitychange', resume)
      window.removeEventListener('focus', resume)
      window.removeEventListener('online', resume)
      window.removeEventListener('offline', offline)
    }
  }, [ticketId])

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!inputText.trim() || sendingRef.current || connection === 'expired' || connection === 'unavailable' || connection === 'offline') return
    const text = inputText.trim()
    restoreFocusRef.current = true
    sendingRef.current = true
    setInputText('')
    setIsSending(true)
    setSendError(null)
    followingRef.current = true
    const messageType: MessageType = userRole === 'client' ? 'client_message' : isInternalNote ? 'internal_note' : 'staff_message'
    const optimisticId = `temp-${crypto.randomUUID()}`
    const optimisticMessage: TicketMessage = {
      id: optimisticId, ticket_id: ticketId, sender_id: currentUserId,
      message_body: text, message_type: messageType, created_at: new Date().toISOString(),
      sender: { id: currentUserId, full_name: 'You', email: '', role: userRole, account_status: 'active', created_at: '', updated_at: '' },
    }
    setMessages(current => mergeMessages(current, [optimisticMessage]))
    try {
      const saved = await sendMessage(ticketId, text, messageType)
      if (!mountedRef.current) return
      setMessages(current => mergeMessages(current, [{ ...saved, sender: saved.sender ?? optimisticMessage.sender }], optimisticId))
      refreshRef.current()
    } catch {
      if (!mountedRef.current) return
      setMessages(current => current.filter(message => message.id !== optimisticId))
      setInputText(text)
      setSendError('Your message was not confirmed. Your draft is restored; check the conversation before retrying.')
      refreshRef.current()
    } finally {
      sendingRef.current = false
      if (mountedRef.current) setIsSending(false)
    }
  }

  useEffect(() => {
    if (!isSending && restoreFocusRef.current) {
      if (document.activeElement === document.body || document.activeElement?.getAttribute('data-chat-send') === 'true') inputRef.current?.focus({ preventScroll: true })
      restoreFocusRef.current = false
    }
  }, [isSending])

  const statusText: Record<ConnectionState, string> = {
    connecting: 'Connecting…', live: 'Live updates', reconnecting: 'Reconnecting…',
    offline: 'You’re offline', expired: 'Sign in to reconnect', unavailable: 'Conversation unavailable',
  }
  const cannotSend = isSending || connection === 'offline' || connection === 'expired' || connection === 'unavailable'

  const canPostInternalNotes = userRole === 'admin' || userRole === 'employee'

  return (
    <div className="flex flex-col h-[min(680px,85dvh)] min-h-[400px] rounded-2xl border border-[#2C2772]/15 bg-white shadow-[0_8px_30px_-16px_rgba(44,39,114,0.25)] overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-[#2C2772]/10 px-3 sm:px-6 py-3 sm:py-4 bg-[#2C2772]/[0.02]">
        <div className="min-w-0 pr-2">
          <h3 className="font-semibold text-[#2C2772] text-xs sm:text-sm truncate">Ticket conversation</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate">Your direct line to Technology World support</p>
        </div>
        <div role="status" className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-medium ${connection === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {connection === 'live' ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : connection === 'offline' ? <WifiOff className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
          <span>{statusText[connection]}</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={streamRef}
          role="log"
          aria-label="Ticket messages"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={0}
          onScroll={() => {
            const stream = streamRef.current
            if (!stream) return
            const atBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < 80
            followingRef.current = atBottom
            if (atBottom) setUnreadCount(0)
          }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-slate-50/80 to-white p-3 sm:p-6 space-y-4 sm:space-y-5 [overflow-anchor:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2C2772]/30"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2C2772]/5 text-[#2C2772]"><MessageSquare className="h-6 w-6" /></span>
              <p className="text-sm font-medium text-slate-600">Let’s get the conversation started</p>
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
                  className={`flex gap-2 sm:gap-3 max-w-[92%] sm:max-w-[85%] ${
                    isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold text-white shadow-sm ${
                      isInternal
                        ? 'bg-amber-600 ring-2 ring-amber-200'
                        : isStaff
                        ? 'bg-[#2C2772]'
                        : 'bg-slate-700'
                    }`}
                    title={msg.sender?.full_name}
                  >
                    {getInitials(msg.sender?.full_name || (isMe ? 'You' : 'TW'))}
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1 min-w-0">
                    <div
                      className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] ${
                        isMe ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span className="font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-none">
                        {isMe ? 'You' : msg.sender?.full_name || 'Support Agent'}
                      </span>
                      {isInternal && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200 shrink-0">
                          <Lock className="h-2.5 w-2.5" /> Staff Note
                        </span>
                      )}
                      <time dateTime={msg.created_at} className="text-slate-400 shrink-0">{formatDateTime(msg.created_at)}</time>
                    </div>

                    <div
                      className={`rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-sm break-words ${
                        isInternal
                          ? 'bg-amber-50 text-amber-950 border border-amber-200'
                          : isMe
                          ? 'bg-[#2C2772] text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{msg.message_body}</p>

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
                              <FileText className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{att.original_filename}</span>
                              <span className="opacity-70 shrink-0">({formatFileSize(att.file_size)})</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {isMe && (
                      <p className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        {msg.id.startsWith('temp-') ? <><Loader2 className="h-3 w-3 animate-spin" /> Sending…</> : <><Check className="h-3 w-3" /> Sent</>}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={() => scrollToBottom()} className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#2C2772] px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-[#231f5c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C2772]">
            <ArrowDown className="h-3.5 w-3.5" /> {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
          </button>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="border-t border-[#2C2772]/10 p-2.5 sm:p-4 bg-slate-50/75 space-y-2">
        {sendError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{sendError}</p>
        )}

        {canPostInternalNotes && (
          <div className="flex items-center justify-between pb-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternalNote}
                disabled={cannotSend}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
              />
              <span className={isInternalNote ? 'text-amber-700 font-semibold' : ''}>
                Staff-only note
              </span>
            </label>
          </div>
        )}

        {connection === 'expired' && <p className="text-xs text-amber-700">Your session has expired. <a href="/login" className="font-semibold underline">Sign in again</a> to continue.</p>}
        <div className="flex items-end gap-1.5 sm:gap-2">
          <textarea
            ref={inputRef}
            aria-label={isInternalNote ? 'Staff-only note' : 'Message'}
            rows={2}
            maxLength={10000}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setSendError(null) }}
            disabled={cannotSend}
            placeholder={
              isInternalNote
                ? 'Internal note for staff...'
                : 'Type your message...'
            }
            className={`flex-1 min-w-0 resize-none rounded-xl border px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
              isInternalNote
                ? 'border-amber-300 bg-amber-50/50 focus:ring-amber-500'
                : 'border-slate-200 bg-white focus:border-[#2C2772] focus:ring-[#2C2772]/20'
            }`}
          />

          <button
            type="submit"
            data-chat-send="true"
            aria-label={isSending ? 'Sending message' : 'Send message'}
            disabled={!inputText.trim() || cannotSend}
            className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isInternalNote
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-[#2C2772] hover:bg-[#231f5c]'
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
        <p className="px-1 text-[10px] text-slate-400">{isInternalNote ? 'Only your support team can see this note.' : 'Enter to send · Shift + Enter for a new line'}</p>
      </form>
    </div>
  )
}
