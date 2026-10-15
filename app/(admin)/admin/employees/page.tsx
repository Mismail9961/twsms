import { getAllEmployees } from '@/lib/data/tickets'
import { memoryDb } from '@/lib/db'
import { AddEmployeeModal } from './add-employee-modal'
import { toggleUserStatus } from '@/app/actions/tickets'
import { getInitials } from '@/lib/utils'
import { CheckCircle, Ban } from 'lucide-react'

export default async function AdminEmployeesPage() {
  const employees = await getAllEmployees()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Employee & Staff Directory
          </h2>
          <p className="text-sm text-gray-500">
            Provision authorized technical agents, assign roles, and monitor workloads
          </p>
        </div>
        <AddEmployeeModal />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[620px] text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-3 sm:px-6">Staff Member</th>
                <th className="py-3.5 px-3 sm:px-6">Work Email</th>
                <th className="py-3.5 px-3 sm:px-6">System Role</th>
                <th className="py-3.5 px-3 sm:px-6">Active Workload</th>
                <th className="py-3.5 px-3 sm:px-6">Account Status</th>
                <th className="py-3.5 px-3 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {employees.map((emp) => {
                const activeAssignments = memoryDb.assignments.filter(
                  (a) => a.employee_id === emp.id
                ).length

                return (
                  <tr key={emp.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2c2772] text-xs font-bold text-white shadow">
                          {getInitials(emp.full_name)}
                        </div>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">{emp.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs text-gray-600 font-mono">{emp.email}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold border capitalize text-[11px] ${
                          emp.role === 'admin'
                            ? 'bg-[#2c2772] text-white border-[#2c2772]'
                            : 'bg-[#2c2772]/10 text-[#2c2772] border-[#2c2772]/20'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs font-semibold text-gray-800">
                      {activeAssignments} Ticket(s)
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs">
                      {emp.account_status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                          <Ban className="h-3.5 w-3.5 text-red-600" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                      <form action={toggleUserStatus.bind(null, emp.id, emp.account_status)}>
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            emp.account_status === 'active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {emp.account_status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
