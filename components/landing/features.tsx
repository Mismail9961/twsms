import {
  MessageSquare,
  Users,
  FileText,
  Activity,
  Star,
  Download,
  LucideIcon,
} from 'lucide-react'

export interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
  tag: string
  badgeColor?: string
}

export const FEATURES_LIST: FeatureItem[] = [
  {
    icon: MessageSquare,
    title: 'Real-Time Ticket Chat',
    description:
      'Communicate directly with assigned support engineers. Includes optimistic updates and internal staff notes.',
    tag: 'Collaboration',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    icon: Users,
    title: 'Multi-Engineer Assignment',
    description:
      'Assign lead engineers and multi-disciplinary staff (backend, devops, frontend) to complex technical tickets.',
    tag: 'Team Management',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    icon: FileText,
    title: 'Secure Document Sharing',
    description:
      'Attach error logs, system diagnostics, and screenshots directly into tickets with secure role-verified downloads.',
    tag: 'File Storage',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    icon: Activity,
    title: 'Transparent Status Lifecycle',
    description:
      'Full audit trail of every status change from Open, In Progress, Waiting for Client, to Resolved.',
    tag: 'Audit & Tracking',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    icon: Star,
    title: 'Client Verification & Feedback',
    description:
      'Clients verify if an issue is resolved before closing, backed by 5-star feedback and resolution metrics.',
    tag: 'Quality Control',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    icon: Download,
    title: 'Reports & CSV Export',
    description:
      'System administrators can view resolution trends, employee workloads, and export records for auditing.',
    tag: 'Analytics',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
]

export function FeaturesSection({ features = FEATURES_LIST }: { features?: FeatureItem[] }) {
  return (
    <section id="features" className="scroll-mt-20 border-t border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Platform Capabilities
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything your support operations require
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Engineered to deliver fast, reliable, and auditable technical support for high-stakes environments.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-colors group-hover:bg-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
