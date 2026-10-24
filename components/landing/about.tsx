import {
  Eye,
  Users,
  Layers,
  Target,
  Lightbulb,
  BadgeCheck,
  Puzzle,
  Compass,
  Handshake,
  Headset,
  Network,
  ArrowRightLeft,
  ClipboardList,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react'

interface PointItem {
  icon: LucideIcon
  title: string
  description: string
}

/* ---------- Content (from the Technology World company profile) ---------- */

const INTRO_LEAD =
  'At TW, we provide high-quality, future-focused solutions tailored to unlock our clients’ full potential. By continuously investing in the development of our team, we ensure that our professionals remain at the forefront of industry trends, technologies, and best practices, empowering us to deliver innovative services that support long-term growth and success.'

const INTRO_POINTS: PointItem[] = [
  {
    icon: Users,
    title: 'Seasoned IT experts',
    description:
      'Our team delivers strategic, value-driven business and technology solutions tailored to meet your unique needs.',
  },
  {
    icon: Layers,
    title: 'A holistic approach',
    description:
      'With extensive industry insight spanning strategy, people, process, and technology, TW operates as an integrated extension of your team.',
  },
  {
    icon: Target,
    title: 'Measurable impact',
    description:
      'Leveraging hands-on experience, we ensure our clients receive solutions that are not only effective but also professionally executed with measurable impact.',
  },
]

const VISION_POINTS: string[] = [
  'To become a leading provider of innovative technology and strategic solutions for our clients.',
  'To deliver business solutions that are secure, convenient, and cost-effective.',
  'To help individuals and organizations realize and achieve their full potential.',
  'To empower companies to produce their best work and successfully reach their target market.',
]

const STRATEGY: string[] = [
  'At TW, we specialize in diverse IT system integration domains that work in harmony to deliver comprehensive, value-driven solutions. These synergistic services present a unified approach, enhancing the overall experience and results for our clients.',
  'Our success is fueled by strategic alliances and a culture of collaboration. By fostering teamwork and aligning around a core value system centered on excellence, customer focus, and innovation, we’ve built lasting relationships with clients, partners, and stakeholders alike.',
]

const SERVICES: PointItem[] = [
  {
    icon: Headset,
    title: 'Customer Support',
    description:
      'Quarterly or annual support agreements with 24/7 or 8x5 response times. Next-business-day support, with on-call engineer visits as needed.',
  },
  {
    icon: Network,
    title: 'Network Design & Services',
    description:
      'We are vendor-neutral with deep expertise in designing and optimizing converged network infrastructures.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Network Migration',
    description:
      'We facilitate seamless migration of data and systems from legacy networks to modern infrastructure, minimizing downtime and risk.',
  },
  {
    icon: ClipboardList,
    title: 'Project Management',
    description:
      'Our senior consultants lead enterprise-level projects, ensuring quality delivery and timely implementation.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit Services',
    description:
      'We perform comprehensive network and security audits to detect vulnerabilities and ensure optimal performance, with corrective actions as needed.',
  },
]

const VALUES: PointItem[] = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'Driving industry leadership through proven and emerging technologies.',
  },
  {
    icon: BadgeCheck,
    title: 'Quality',
    description:
      'Delivering value through expertise, advanced technology, and exceptional service.',
  },
  {
    icon: Puzzle,
    title: 'Solution',
    description:
      'Customizing ERP solutions, IT optimization, and technology services to meet each client’s unique needs.',
  },
  {
    icon: Compass,
    title: 'Strategy',
    description:
      'Empowering growth through insightful, tactical decision-making.',
  },
  {
    icon: Handshake,
    title: 'Partner',
    description:
      'Enabling our clients’ success through proactive, collaborative service.',
  },
]

/* ---------- Background patterns ---------- */

const dotGrid: React.CSSProperties = {
  backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1.2px)',
  backgroundSize: '24px 24px',
  opacity: 0.13,
  WebkitMaskImage:
    'radial-gradient(ellipse 90% 60% at 50% 20%, #000 30%, transparent 100%)',
  maskImage:
    'radial-gradient(ellipse 90% 60% at 50% 20%, #000 30%, transparent 100%)',
}

const hatch: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(135deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 14px)',
  opacity: 0.06,
  WebkitMaskImage: 'linear-gradient(to right, #000, transparent)',
  maskImage: 'linear-gradient(to right, #000, transparent)',
}

const glow: React.CSSProperties = {
  background:
    'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.16), transparent 70%)',
}

const lineGrid: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(#2c2772 1px, transparent 1px), linear-gradient(90deg, #2c2772 1px, transparent 1px)',
  backgroundSize: '32px 32px',
  opacity: 0.06,
  WebkitMaskImage:
    'radial-gradient(ellipse 70% 90% at 100% 0%, #000 20%, transparent 100%)',
  maskImage:
    'radial-gradient(ellipse 70% 90% at 100% 0%, #000 20%, transparent 100%)',
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

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative isolate scroll-mt-20 overflow-hidden bg-[#2c2772] py-16 sm:py-24 lg:py-28"
    >
      {/* Section background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96" style={glow} />
        <div className="absolute inset-0" style={dotGrid} />
        <div className="absolute inset-y-0 left-0 w-2/3 sm:w-1/3" style={hatch} />
        <Rings className="absolute -right-16 -top-16 h-64 w-64 text-white opacity-[0.12] sm:h-96 sm:w-96" />
        <Rings className="absolute -bottom-20 -left-20 h-56 w-56 rotate-180 text-white opacity-[0.08] sm:h-80 sm:w-80" />
      </div>

      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* ---------- Intro ---------- */}
        <h1 className="font-serif text-[2rem] font-semibold leading-[1.1] tracking-tight text-white min-[375px]:text-[2.35rem] sm:text-5xl lg:text-6xl">
          About Us
        </h1>
        <div className="mt-5 h-[3px] w-14 rounded-full bg-white sm:mt-6" />

        <p className="mt-8 max-w-4xl text-base leading-relaxed text-white min-[375px]:text-[1.05rem] sm:mt-10 sm:text-xl sm:leading-8">
          {INTRO_LEAD}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-12 md:grid-cols-3 md:gap-8 lg:gap-12">
          {INTRO_POINTS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="min-w-0 border-t border-white/25 pt-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 break-words text-lg font-semibold text-white">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-[0.95rem] sm:leading-7">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* ---------- Vision ---------- */}
        <div className="relative mt-14 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-24px_rgba(8,6,40,0.7)] sm:mt-20 sm:rounded-3xl">
          <div aria-hidden="true" className="absolute inset-0" style={lineGrid} />
          <Rings className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 text-[#2c2772] opacity-[0.09] sm:h-72 sm:w-72" />
          <div className="absolute inset-y-0 left-0 w-1 bg-[#2c2772] sm:w-1.5" />

          <div className="relative grid grid-cols-1 gap-6 p-6 pl-7 sm:p-10 sm:pl-12 lg:grid-cols-12 lg:gap-10 lg:p-14 lg:pl-16">
            <div className="flex items-center gap-3 lg:col-span-3 lg:items-start">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2c2772] text-white ring-4 ring-[#2c2772]/10">
                <Eye className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#2c2772] sm:text-3xl">
                Our Vision
              </h3>
            </div>

            <ul className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-9">
              {VISION_POINTS.map((point) => (
                <li
                  key={point}
                  className="border-l-2 border-[#2c2772]/25 pl-5 font-serif text-[1.05rem] leading-relaxed text-[#2c2772] sm:text-lg"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Strategy ---------- */}
        <div className="mt-14 sm:mt-20">
          <div className="flex items-center gap-4">
            <h3 className="shrink-0 font-serif text-2xl font-semibold text-white sm:text-3xl">
              Our Strategy
            </h3>
            <div className="h-px flex-1 bg-white/25" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 text-sm leading-relaxed text-white/80 sm:mt-8 sm:text-base sm:leading-7 md:grid-cols-2 md:gap-12">
            {STRATEGY.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>

        {/* ---------- Service Portfolio ---------- */}
        <div className="mt-14 sm:mt-20">
          <div className="flex items-center gap-4">
            <h3 className="shrink-0 font-serif text-2xl font-semibold text-white sm:text-3xl">
              Service Portfolio
            </h3>
            <div className="h-px flex-1 bg-white/25" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-10">
            {SERVICES.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="min-w-0 border-t border-white/25 pt-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h4 className="mt-4 break-words text-lg font-semibold text-white">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-[0.95rem] sm:leading-7">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ---------- Our Values ---------- */}
        <div className="relative mt-14 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-24px_rgba(8,6,40,0.7)] sm:mt-20 sm:rounded-3xl">
          <div aria-hidden="true" className="absolute inset-0" style={lineGrid} />
          <Rings className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 text-[#2c2772] opacity-[0.09] sm:h-72 sm:w-72" />
          <div className="absolute inset-x-0 top-0 h-1 bg-[#2c2772] sm:h-1.5" />

          <div className="relative p-6 sm:p-10 lg:p-14">
            <h3 className="font-serif text-2xl font-semibold text-[#2c2772] sm:text-3xl">
              Our Values
            </h3>

            <div className="mt-7 grid grid-cols-1 gap-8 sm:mt-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {VALUES.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="min-w-0">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2c2772] text-white shadow-sm ring-4 ring-[#2c2772]/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h4 className="mt-4 break-words text-lg font-semibold text-[#2c2772] sm:text-xl">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#2c2772]/75 sm:text-[0.95rem] sm:leading-7">
                      {item.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}