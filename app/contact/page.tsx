import type { Metadata } from 'next'
import { ArrowLeftRight, ClipboardCheck, ShieldCheck, Package, Globe, Mail, Phone, MapPin, Clock, ArrowUpRight } from 'lucide-react'
import { LandingNavbar } from '@/components/landing/navbar'
import { LandingFooter } from '@/components/landing/footer'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact Us | Technology World',
  description:
    'Talk to Technology World about network migration, audits, security and supplies.',
}

const WEBSITE = 'https://technology-world.net.pk/#'

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
    text: 'Robust network security solutions. Protect your data.',
  },
  {
    icon: Package,
    title: 'Network Supplies',
    text: 'Cutting-edge network supplies. Elevate your infrastructure.',
  },
]

// Fill in your real details. Entries with an empty value are hidden automatically.
const contactDetails = [
  { icon: Mail, label: 'Email', value: '', href: '' }, // e.g. value: 'info@yourdomain.com', href: 'mailto:info@yourdomain.com'
  { icon: Phone, label: 'Phone', value: '', href: '' }, // e.g. value: '+92 300 0000000', href: 'tel:+923000000000'
  { icon: MapPin, label: 'Address', value: '', href: '' },
  { icon: Clock, label: 'Working hours', value: '', href: '' },
  { icon: Globe, label: 'Website', value: 'technology-world.net.pk', href: WEBSITE },
].filter((item) => item.value)

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingNavbar />

      <main className="relative flex-1 overflow-hidden text-[#2C2772]">
        {/* Background: dot grid + brand glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'radial-gradient(60% 40% at 85% 0%, rgba(44,39,114,0.10) 0%, rgba(44,39,114,0) 70%), radial-gradient(rgba(44,39,114,0.12) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 24px 24px',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 40%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 40%, transparent 100%)',
          }}
        />

        <div className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20 lg:px-10">
          {/* Intro */}
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#2C2772]/80 sm:text-sm">Contact Us</p>
            <h1 className="mt-3 text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Let’s build a network{' '}
              <span className="text-[#6A63D9]">your business can rely on.</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-lg">
              From design to deployment, our network solutions offer reliability, performance,
              and security. Tell us what you need and our team will get back to you.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
            {/* Info panel */}
            <aside className="order-2 flex flex-col gap-6 rounded-3xl bg-[#2C2772] p-6 text-white shadow-2xl shadow-[#2C2772]/25 sm:p-8 lg:order-1">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">How we can help</h2>
                <ul className="mt-5 space-y-4">
                  {services.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold sm:text-base">{title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-white/70 sm:text-sm">{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {contactDetails.length > 0 && (
                <ul className="space-y-3 border-t border-white/15 pt-6">
                  {contactDetails.map(({ icon: Icon, label, value, href }) => (
                    <li key={label} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#A9A4F5]" aria-hidden="true" />
                      <div className="min-w-0 text-sm">
                        <p className="text-xs text-white/60">{label}</p>
                        {href ? (
                          <a
                            href={href}
                            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="inline-flex items-center gap-1 break-words font-medium underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                          >
                            {value}
                            {href.startsWith('http') && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
                          </a>
                        ) : (
                          <p className="break-words font-medium">{value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>

            {/* Form card */}
            <section
              aria-labelledby="contact-form-heading"
              className="order-1 rounded-3xl border border-[#2C2772]/10 bg-white p-5 shadow-xl shadow-[#2C2772]/10 sm:p-8 lg:order-2"
            >
              <h2 id="contact-form-heading" className="text-lg font-semibold sm:text-xl">
                Send us a message
              </h2>
              <p className="mt-1 mb-6 text-sm text-slate-500">
                Fields marked optional can be skipped.
              </p>
              <ContactForm />
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}