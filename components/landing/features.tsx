import {
  Eye,
  Handshake,
  Heart,
  Lightbulb,
  TrendingUp,
  BadgeCheck,
  LucideIcon,
} from 'lucide-react'

interface PointItem {
  icon: LucideIcon
  title: string
  description: string
}

const INTRO_LEAD =
  'Founded with a vision to empower businesses through technology, Technology World is a leading network integration company based in Pakistan. With a relentless focus on innovation, quality, and customer satisfaction, we have established ourselves as a trusted partner for businesses across the country.'

const INTRO_REST: string[] = [
  'Our team comprises seasoned professionals with extensive experience in network infrastructure, cybersecurity, cloud computing, and IT consultancy. We are committed to delivering exceptional solutions that drive efficiency, productivity, and growth for our clients.',
  'At Technology World, we believe in forging long-term partnerships built on trust, integrity, and mutual success. Discover why businesses trust us to deliver cutting-edge technology solutions that propel them towards greater heights.',
]

const VISION =
  'To be the leading provider of network integration solutions in Pakistan, renowned for our innovation, expertise, and commitment to customer satisfaction. We envision a future where every business has access to the technology they need to succeed and thrive in an increasingly interconnected world.'

const MISSION: PointItem[] = [
  {
    icon: Handshake,
    title: 'Long-term partnerships',
    description:
      'We believe in building strong, long-term partnerships with our clients, based on trust, integrity, and mutual success.',
  },
  {
    icon: Heart,
    title: 'Community and sustainability',
    description:
      'Beyond business success, we are committed to making a positive difference in the communities we serve, through corporate social responsibility initiatives and environmental sustainability efforts.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We are committed to driving innovation in the technology industry, constantly exploring new ideas and solutions to help businesses stay ahead of the curve.',
  },
]

const STRATEGIES: PointItem[] = [
  {
    icon: TrendingUp,
    title: 'Scalable solutions',
    description:
      'We understand that businesses come in all shapes and sizes, and their technology needs may vary. We offer scalable solutions that can grow and adapt alongside our clients’ businesses, ensuring they remain agile and competitive in a rapidly changing marketplace.',
  },
  {
    icon: BadgeCheck,
    title: 'Uncompromising quality',
    description:
      'Quality is non-negotiable in everything we deliver. Whether it’s the products we supply or the services we provide, we maintain the highest standards of quality to ensure our clients receive reliable, efficient, and effective solutions.',
  },
]

/* ---------- Background patterns ---------- */

/* White dot grid on the indigo, fading out toward the edges */
const dotGrid: React.CSSProperties = {
  backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1.2px)',
  backgroundSize: '24px 24px',
  opacity: 0.13,
  WebkitMaskImage:
    'radial-gradient(ellipse 90% 60% at 50% 20%, #000 30%, transparent 100%)',
  maskImage:
    'radial-gradient(ellipse 90% 60% at 50% 20%, #000 30%, transparent 100%)',
}

/* Fine diagonal hatch, left edge */
const hatch: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(135deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 14px)',
  opacity: 0.06,
  WebkitMaskImage: 'linear-gradient(to right, #000, transparent)',
  maskImage: 'linear-gradient(to right, #000, transparent)',
}

/* Soft light bloom at the top */
const glow: React.CSSProperties = {
  background:
    'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.16), transparent 70%)',
}

/* Indigo line grid used inside the white panels */
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
        <h2 className="font-serif text-[2rem] font-semibold leading-[1.1] tracking-tight text-white min-[375px]:text-[2.35rem] sm:text-5xl lg:text-6xl">
          About Technology World
        </h2>
        <div className="mt-5 h-[3px] w-14 rounded-full bg-white sm:mt-6" />

        <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-14">
          <p className="text-base leading-relaxed text-white min-[375px]:text-[1.05rem] sm:text-xl sm:leading-8 lg:col-span-7">
            {INTRO_LEAD}
          </p>
          <div className="space-y-4 border-t border-white/20 pt-6 text-sm leading-relaxed text-white/75 sm:text-[0.95rem] sm:leading-7 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {INTRO_REST.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>

        {/* ---------- Vision ---------- */}
        <div className="relative mt-12 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-24px_rgba(8,6,40,0.7)] sm:mt-16 sm:rounded-3xl">
          <div aria-hidden="true" className="absolute inset-0" style={lineGrid} />
          <Rings className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 text-[#2c2772] opacity-[0.09] sm:h-72 sm:w-72" />
          <div className="absolute inset-y-0 left-0 w-1 bg-[#2c2772] sm:w-1.5" />

          <div className="relative grid grid-cols-1 gap-5 p-6 pl-7 sm:p-10 sm:pl-12 lg:grid-cols-12 lg:gap-10 lg:p-14 lg:pl-16">
            <div className="flex items-center gap-3 lg:col-span-3 lg:items-start">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2c2772] text-white ring-4 ring-[#2c2772]/10">
                <Eye className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#2c2772] sm:text-3xl">
                Vision
              </h3>
            </div>
            <p className="font-serif text-[1.08rem] leading-relaxed text-[#2c2772] min-[375px]:text-xl sm:text-2xl sm:leading-snug lg:col-span-9 lg:text-[1.65rem]">
              {VISION}
            </p>
          </div>
        </div>

        {/* ---------- Mission ---------- */}
        <div className="mt-14 sm:mt-20">
          <div className="flex items-center gap-4">
            <h3 className="shrink-0 font-serif text-2xl font-semibold text-white sm:text-3xl">
              Mission
            </h3>
            <div className="h-px flex-1 bg-white/25" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 sm:mt-8 md:grid-cols-3 md:gap-8 lg:gap-12">
            {MISSION.map((item) => {
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

        {/* ---------- Key Strategies ---------- */}
        <div className="relative mt-14 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-24px_rgba(8,6,40,0.7)] sm:mt-20 sm:rounded-3xl">
          <div aria-hidden="true" className="absolute inset-0" style={lineGrid} />
          <Rings className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 text-[#2c2772] opacity-[0.09] sm:h-72 sm:w-72" />
          <div className="absolute inset-x-0 top-0 h-1 bg-[#2c2772] sm:h-1.5" />

          <div className="relative p-6 sm:p-10 lg:p-14">
            <h3 className="font-serif text-2xl font-semibold text-[#2c2772] sm:text-3xl">
              Key Strategies
            </h3>

            <div className="mt-7 grid grid-cols-1 sm:mt-9 md:grid-cols-2">
              {STRATEGIES.map((item, i) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className={`min-w-0 ${
                      i === 0
                        ? 'md:pr-10 lg:pr-14'
                        : 'mt-8 border-t border-[#2c2772]/15 pt-8 md:mt-0 md:border-l md:border-t-0 md:pl-10 md:pt-0 lg:pl-14'
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2c2772] text-white shadow-sm ring-4 ring-[#2c2772]/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h4 className="mt-4 break-words text-lg font-semibold text-[#2c2772] sm:text-xl">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#2c2772]/75 sm:text-base sm:leading-7">
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

/** Drop-in alias so existing `FeaturesSection` imports keep working. */
export { AboutSection as FeaturesSection }