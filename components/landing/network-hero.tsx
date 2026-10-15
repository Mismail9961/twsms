import Link from 'next/link'
import { ArrowLeftRight, ClipboardCheck, ShieldCheck, Package } from 'lucide-react'

interface NetworkHeroProps {
  exploreHref?: string
  contactHref?: string
}

const services = [
  {
    icon: ArrowLeftRight,
    title: 'Network Migration',
    text: 'Seamless network migration solutions for your business needs.',
  },
  {
    icon: ClipboardCheck,
    title: 'Network Audit',
    text: 'Comprehensive network audits. Enhance efficiency and security.',
  },
  {
    icon: ShieldCheck,
    title: 'Network Security',
    text: 'Robust network security solutions. Protect your data with us today.',
  },
  {
    icon: Package,
    title: 'Network Supplies',
    text: 'Cutting-edge network supplies. Elevate your infrastructure.',
  },
]

export function NetworkHero({
  exploreHref = 'https://technology-world.net.pk/#',
  contactHref = '/contact',
}: NetworkHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white text-[#2C2772]">
      {/* Framed container, like the reference */}
      <div className="mx-auto max-w-6xl border-x border-[#2C2772]/10">
        <div className="flex flex-col items-center px-5 pb-14 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-24 lg:pt-28">
          <p className="text-xs font-medium text-[#2C2772]/80 sm:text-sm">Our Services</p>

          <h1 className="mt-3 max-w-3xl text-[2.1rem] font-normal leading-[1.08] tracking-tight sm:mt-4 sm:text-6xl lg:text-7xl">
            We Create Best{' '}
            <span className="text-[#6A63D9]">Network Solutions</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-500 sm:mt-6 sm:text-base">
            From design to deployment, our network solutions offer unparalleled
            reliability, performance, and security for your organization’s success.
          </p>

          <div className="mt-7 flex w-full max-w-xs gap-3 sm:mt-9 sm:w-auto sm:max-w-none">
            <a
              href={exploreHref}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-[#2C2772] px-5 text-sm font-medium text-white transition hover:bg-[#241f5e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2772] sm:flex-none sm:px-7 sm:text-base"
            >
              Explore More
            </a>
            <Link
              href={contactHref}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-[#2C2772]/20 bg-white px-5 text-sm font-medium text-[#2C2772] transition hover:border-[#2C2772] hover:bg-[#2C2772]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2772] sm:flex-none sm:px-7 sm:text-base"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Services strip */}
        <ul className="grid grid-cols-1 border-t border-[#2C2772]/10 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-3.5 border-b border-[#2C2772]/10 p-5 text-left last:border-b-0 min-[480px]:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 lg:p-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2C2772] text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}