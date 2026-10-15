import { Send, Users, CheckCircle } from 'lucide-react'

export interface StepItem {
  number: string
  title: string
  description: string
  icon: typeof Send
}

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Submit Ticket',
    description:
      'Client creates a ticket with category, priority, affected service details, and diagnostic logs.',
    icon: Send,
  },
  {
    number: '02',
    title: 'Engineering Collaboration',
    description:
      'Lead engineers and technical staff are assigned, review details, and interact via real-time live chat.',
    icon: Users,
  },
  {
    number: '03',
    title: 'Verify & Close',
    description:
      'Client confirms if the fix works before the ticket is marked closed, followed by customer satisfaction rating.',
    icon: CheckCircle,
  },
]

export function HowItWorksSection({ steps = HOW_IT_WORKS_STEPS }: { steps?: StepItem[] }) {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-slate-200 bg-slate-50/70 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Simple Workflow
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How tickets move from submission to resolution
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Clear accountability at every stage ensures requests are never lost or forgotten.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
