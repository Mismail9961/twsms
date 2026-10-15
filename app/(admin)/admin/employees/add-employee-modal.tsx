'use client'

import { useState } from 'react'
import { UserPlus, X, Loader2 } from 'lucide-react'
import { createEmployeeAccount } from '@/app/actions/tickets'

export function AddEmployeeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createEmployeeAccount(formData)
      setIsOpen(false)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-700 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        <span>Add Staff Account</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Create Support Staff Account</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Company Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="david@technologyworld.com"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Temporary Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    System Role
                  </label>
                  <select
                    name="role"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="employee">Employee (Support Agent)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    name="department"
                    type="text"
                    defaultValue="Technical Support"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
