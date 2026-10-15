'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Bell,
  Settings,
  Users,
  UserCheck,
  Tag,
  BarChart3,
  Star,
  LogOut,
  X,
} from 'lucide-react'

interface SidebarProps {
  user: { id: string; full_name: string; email: string; role: string; avatar_url?: string }
  unreadNotifications?: number
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

function getNavItems(role: string, unreadNotifications: number): NavItem[] {
  if (role === 'admin') {
    return [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/tickets', label: 'All Tickets', icon: Ticket },
      { href: '/admin/clients', label: 'Clients', icon: Users },
      { href: '/admin/employees', label: 'Employees', icon: UserCheck },
      { href: '/admin/categories', label: 'Categories', icon: Tag },
      { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { href: '/admin/ratings', label: 'Ratings', icon: Star },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
      { href: '/admin/profile', label: 'Profile & Settings', icon: Settings },
    ]
  }

  if (role === 'employee') {
    return [
      { href: '/employee', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/employee/tickets', label: 'My Tickets', icon: Ticket },
      { href: '/employee/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
      { href: '/employee/profile', label: 'Profile & Settings', icon: Settings },
    ]
  }

  // client (default)
  return [
    { href: '/client', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/client/tickets', label: 'My Tickets', icon: Ticket },
    { href: '/client/tickets/new', label: 'New Ticket', icon: Plus },
    { href: '/client/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { href: '/client/profile', label: 'Profile & Settings', icon: Settings },
  ]
}

function TechWorldLogo() {
  return (
    <div className="h-8 w-8 rounded-lg bg-white p-1 shadow flex items-center justify-center flex-shrink-0">
      <img
        src="/logo.png"
        alt="Technology World"
        className="h-full w-full object-contain"
      />
    </div>
  )
}

function getRoleLabel(role: string): string {
  if (role === 'admin') return 'Administrator'
  if (role === 'employee') return 'Support Staff'
  return 'Client'
}

export function Sidebar({ user, unreadNotifications = 0, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItems(user.role, unreadNotifications)

  function isActive(href: string): boolean {
    // Exact match for dashboard routes to avoid over-matching
    if (
      href === '/admin' ||
      href === '/employee' ||
      href === '/client'
    ) {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo / Branding */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <TechWorldLogo />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">Technology World</p>
            <p className="text-slate-400 text-xs truncate">Support System</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-4.5 h-4.5 flex-shrink-0 transition-colors',
                  active ? 'text-white' : 'text-slate-400 group-hover:text-white'
                )}
                size={18}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold bg-red-500 text-white leading-none">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-700">
              <span className="text-white text-xs font-semibold">{getInitials(user.full_name)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium leading-tight truncate">{user.full_name}</p>
            <p className="text-slate-400 text-xs truncate">{getRoleLabel(user.role)}</p>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors group"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-400 transition-colors" size={16} />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative flex flex-col w-64 max-w-xs flex-1 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
