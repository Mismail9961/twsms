'use client'

import { useState } from 'react'
import { Check, RotateCcw, Loader2 } from 'lucide-react'
import { confirmResolution } from '@/app/actions/tickets'

export function ResolutionActions({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      await confirmResolution(ticketId, true)
    } catch {
      setError('Could not confirm the resolution. Refresh the ticket and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReopen = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      await confirmResolution(ticketId, false)
    } catch {
      setError('Could not reopen the ticket. Refresh the ticket and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
    <div className="flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-2">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        <span>Confirm & Close Ticket</span>
      </button>

      <button
        onClick={handleReopen}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
        <span>Issue Persists</span>
      </button>
    </div>
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
