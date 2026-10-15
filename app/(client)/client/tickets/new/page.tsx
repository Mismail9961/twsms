import { getSession } from '@/lib/auth/session'
import { getCategories } from '@/lib/data/tickets'
import { CreateTicketForm } from './create-ticket-form'

export default async function NewTicketPage() {
  const session = await getSession()
  if (!session) return null

  const categories = await getCategories()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Submit Technical Support Request
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Provide detailed information about the technical problem so our specialized engineers can resolve it efficiently.
        </p>
      </div>

      <CreateTicketForm categories={categories} />
    </div>
  )
}
