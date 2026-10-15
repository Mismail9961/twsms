import Link from 'next/link'
import Image from 'next/image'

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white py-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 p-1">
              <Image
                src="/logo.png"
                alt="Technology World"
                width={24}
                height={24}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Technology World Support
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">
              FAQ
            </a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Portal Sign In
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Systems Operational</span>
            <span className="mx-1">•</span>
            <span>© {currentYear} Technology World. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
