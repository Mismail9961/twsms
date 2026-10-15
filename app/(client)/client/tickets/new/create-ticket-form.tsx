'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Upload, AlertCircle } from 'lucide-react'
import { createTicket } from '@/app/actions/tickets'
import type { TicketActionState } from '@/app/actions/tickets'
import type { TicketCategory } from '@/lib/types'

interface CreateTicketFormProps {
  categories: TicketCategory[]
}

const initialState: TicketActionState = undefined

export function CreateTicketForm({ categories }: CreateTicketFormProps) {
  const [state, formAction, isPending] = useActionState(createTicket, initialState)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      {state?.error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-6">
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
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
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
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:opacity-50"
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
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:opacity-50"
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
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            href="/client/tickets"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 transition-colors"
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
