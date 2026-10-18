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

/* ---------- Background patterns (indigo on white) ---------- */

const lineGrid: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(#2c2772 1px, transparent 1px), linear-gradient(90deg, #2c2772 1px, transparent 1px)',
  backgroundSize: '36px 36px',
  opacity: 0.05,
  WebkitMaskImage:
    'radial-gradient(ellipse 80% 70% at 50% 0%, #000 25%, transparent 100%)',
  maskImage:
    'radial-gradient(ellipse 80% 70% at 50% 0%, #000 25%, transparent 100%)',
}

const dotGrid: React.CSSProperties = {
  backgroundImage: 'radial-gradient(#2c2772 1px, transparent 1.2px)',
  backgroundSize: '22px 22px',
  opacity: 0.1,
  WebkitMaskImage: 'linear-gradient(to left, #000, transparent)',
  maskImage: 'linear-gradient(to left, #000, transparent)',
}

/* White dots used inside the indigo step cards */
const cardDots: React.CSSProperties = {
  backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1.2px)',
  backgroundSize: '18px 18px',
  opacity: 0.14,
  WebkitMaskImage: 'linear-gradient(135deg, #000, transparent 70%)',
  maskImage: 'linear-gradient(135deg, #000, transparent 70%)',
}

function Rings({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={className}
    >
      <circle cx="200" cy="200" r="40" />
      <circle cx="200" cy="200" r="70" />
      <circle cx="200" cy="200" r="100" />
      <circle cx="200" cy="200" r="130" />
      <circle cx="200" cy="200" r="160" />
    </svg>
  )
}

export function HowItWorksSection({ steps = HOW_IT_WORKS_STEPS }: { steps?: StepItem[] }) {
  return (
    <section
      id="how-it-works"
      className="relative isolate scroll-mt-20 overflow-hidden border-t border-[#2c2772]/10 bg-white py-16 sm:py-24 lg:py-28"
    >
      {/* Section background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" style={lineGrid} />
        <div className="absolute inset-y-0 right-0 w-2/3 sm:w-1/3" style={dotGrid} />
        <Rings className="absolute -right-16 -top-16 h-64 w-64 text-[#2c2772] opacity-[0.08] sm:h-96 sm:w-96" />
        <Rings className="absolute -bottom-20 -left-20 h-56 w-56 rotate-180 text-[#2c2772] opacity-[0.06] sm:h-80 sm:w-80" />
      </div>

      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Header */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-end lg:gap-14">
          <div className="lg:col-span-7">
            <h2 className="font-serif text-[2rem] font-semibold leading-[1.1] tracking-tight text-[#2c2772] min-[375px]:text-[2.35rem] sm:text-5xl">
              How tickets move from submission to resolution
            </h2>
            <div className="mt-5 h-[3px] w-14 rounded-full bg-[#2c2772] sm:mt-6" />
          </div>
          <p className="text-sm leading-relaxed text-[#2c2772]/75 sm:text-base sm:leading-7 lg:col-span-5">
            Clear accountability at every stage ensures requests are never lost or forgotten.
          </p>
        </div>

        {/* Steps */}
        <ol className="mt-12 grid grid-cols-1 sm:mt-16 md:grid-cols-3 md:gap-x-8 lg:gap-x-12">
          {steps.map((step, i) => {
            const Icon = step.icon
            const isLast = i === steps.length - 1
            return (
              <li key={step.number} className="relative min-w-0">
                {/* Number marker + desktop connector */}
                <div className="flex items-center">
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#2c2772] bg-white font-serif text-base font-semibold text-[#2c2772] shadow-[0_0_0_5px_rgba(44,39,114,0.08)]">
                    {step.number}
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="-mr-8 ml-2 hidden h-px flex-1 border-t-2 border-dashed border-[#2c2772]/35 md:block lg:-mr-12"
                    />
                  )}
                </div>

                {/* Card */}
                <div className="relative mt-5 overflow-hidden rounded-2xl bg-[#2c2772] p-6 text-white shadow-[0_28px_50px_-22px_rgba(44,39,114,0.65)] sm:rounded-3xl sm:p-8">
                  <div aria-hidden="true" className="absolute inset-0" style={cardDots} />
                  <Rings className="pointer-events-none absolute -bottom-14 -right-14 h-48 w-48 text-white opacity-[0.12]" />
                  <div className="absolute inset-x-0 top-0 h-1 bg-white/80" />

                  <div className="relative">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#2c2772] shadow-sm ring-4 ring-white/15">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 break-words text-lg font-semibold min-[375px]:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-[0.95rem] sm:leading-7">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Mobile connector to next step */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="ml-6 block h-9 w-0 border-l-2 border-dashed border-[#2c2772]/35 md:hidden"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}