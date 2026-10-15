'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react'
import { createTicket } from '@/app/actions/tickets'
import type { TicketActionState } from '@/app/actions/tickets'
import type { TicketCategory } from '@/lib/types'

interface CreateTicketFormProps {
  categories: TicketCategory[]
}

const initialState: TicketActionState = undefined

export function CreateTicketForm({ categories }: CreateTicketFormProps) {
  const requestKey = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (requestKey.current && !requestKey.current.value) {
      requestKey.current.defaultValue = crypto.randomUUID()
      requestKey.current.value = requestKey.current.defaultValue
    }
  }, [])
  const [state, formAction, isPending] = useActionState(createTicket, initialState)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-8 shadow-sm">
      {state?.error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 sm:p-4 text-xs sm:text-sm font-medium text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-5 sm:space-y-6">
        <input type="hidden" name="request_key" ref={requestKey} />
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Problem Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            disabled={isPending}
            placeholder="e.g. Production API throwing 500 error on checkout flow"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2c2772] focus:outline-none focus:ring-1 focus:ring-[#2c2772] disabled:opacity-50"
          />
          {state?.errors?.title && (
            <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>
          )}
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category_id" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Problem Category
            </label>
            <select
              id="category_id"
              name="category_id"
              disabled={isPending}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base sm:text-sm text-gray-900 focus:border-[#2c2772] focus:outline-none focus:ring-1 focus:ring-[#2c2772] bg-white disabled:opacity-50"
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Priority Level <span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              name="priority"
              required
              defaultValue="medium"
              disabled={isPending}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base sm:text-sm text-gray-900 focus:border-[#2c2772] focus:outline-none focus:ring-1 focus:ring-[#2c2772] bg-white disabled:opacity-50"
            >
              <option value="low">Low — General inquiry or minor glitch</option>
              <option value="medium">Medium — Standard issue, non-critical workflow</option>
              <option value="high">High — Significant degradation or blocking task</option>
              <option value="critical">Critical — Complete service downtime / outage</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Full Description & Steps to Reproduce <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            disabled={isPending}
            placeholder="Please detail the expected behavior, what actually occurred, relevant error messages, and reproduction steps..."
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2c2772] focus:outline-none focus:ring-1 focus:ring-[#2c2772] disabled:opacity-50"
          />
          {state?.errors?.description && (
            <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>
          )}
        </div>

        {/* Affected Service & Serial Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="affected_service" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Affected Product / Service (Optional)
            </label>
            <input
              id="affected_service"
              name="affected_service"
              type="text"
              disabled={isPending}
              placeholder="e.g. AWS Production Cluster, Payment Gateway"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2c2772] focus:outline-none focus:ring-1 focus:ring-[#2c2772]"
            />
          </div>

          <div>
            <label htmlFor="serial_number" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Serial Number (Optional)
            </label>
            <input
              id="serial_number"
              name="serial_number"
              type="text"
              disabled={isPending}
              placeholder="Enter the product or device serial number"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2c2772] focus:outline-none focus:ring-1 focus:ring-[#2c2772]"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label htmlFor="additional_info" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Additional Context / Notes (Optional)
          </label>
          <input
            id="additional_info"
            name="additional_info"
            type="text"
            disabled={isPending}
            placeholder="e.g. Impacting 1,200 active enterprise users"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2c2772] focus:outline-none focus:ring-1 focus:ring-[#2c2772]"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/client/tickets"
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 py-2 sm:py-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2c2772] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#2c2772]/90 active:bg-[#2c2772]/80 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
