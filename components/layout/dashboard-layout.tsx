'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: { id: string; full_name: string; email: string; role: string; avatar_url?: string }
  title?: string
  unreadNotifications?: number
}

export function DashboardLayout({
  children,
  user,
  title = 'Dashboard',
  unreadNotifications = 0,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen min-h-dvh w-full overflow-x-hidden bg-white selection:bg-[#2C2772] selection:text-white">
      {/* Sidebar for desktop and mobile overlay */}
      <Sidebar
        user={user}
        unreadNotifications={unreadNotifications}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Topbar
          title={title}
          user={user}
          unreadNotifications={unreadNotifications}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-2.5 py-3 min-[360px]:p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}