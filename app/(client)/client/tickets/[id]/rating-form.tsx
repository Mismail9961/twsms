'use client'

import { useState } from 'react'
import { Star, Send, Loader2 } from 'lucide-react'
import { submitRating } from '@/app/actions/tickets'

export function RatingForm({ ticketId }: { ticketId: string }) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await submitRating(ticketId, rating, feedback)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-2">
        <h4 className="text-sm font-bold text-blue-900">Thank you for your feedback!</h4>
        <p className="text-xs text-blue-700 mt-1">Your rating helps us continually enhance our engineering support.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <h4 className="text-sm font-bold text-blue-950">How would you rate our technical support?</h4>
        <p className="text-xs text-blue-700 mt-0.5">Please evaluate the speed, accuracy, and overall resolution experience.</p>
      </div>

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverRating || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-semibold text-gray-700 ml-2">
          {rating} of 5 Stars
        </span>
      </div>

      <div>
        <textarea
          rows={2}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Optional feedback: Was our response prompt? What could we improve?"
          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>Submit Rating</span>
        </button>
      </div>
    </form>
  )
}
