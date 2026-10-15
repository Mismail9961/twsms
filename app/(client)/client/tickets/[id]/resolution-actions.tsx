'use client'

import { useState } from 'react'
import { Check, RotateCcw, Loader2 } from 'lucide-react'
import { confirmResolution } from '@/app/actions/tickets'

export function ResolutionActions({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await confirmResolution(ticketId, true)
    } finally {
      setLoading(false)
    }
  }

  const handleReopen = async () => {
    setLoading(true)
    try {
      await confirmResolution(ticketId, false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
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
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
        <span>Issue Persists</span>
      </button>
    </div>
  )
}
