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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop & Mobile Overlay */}
      <Sidebar
        user={user}
        unreadNotifications={unreadNotifications}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
        <Topbar
          title={title}
          user={user}
          unreadNotifications={unreadNotifications}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
