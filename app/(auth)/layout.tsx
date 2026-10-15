import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Header with Technology World Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-white/20 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Technology World Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Technology World</h1>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-400 mt-0.5">
                Support & Ticket Management
              </p>
            </div>
          </div>
        </div>

        {children}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Technology World. All rights reserved.
        </div>
      </div>
    </div>
  )
}
