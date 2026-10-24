'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
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
  Trophy,
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
      { href: '/admin/tickets', label: 'All tickets', icon: Ticket },
      { href: '/admin/clients', label: 'Clients', icon: Users },
      { href: '/admin/employees', label: 'Employees', icon: UserCheck },
      { href: '/admin/categories', label: 'Categories', icon: Tag },
      { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { href: '/admin/ratings', label: 'Ratings', icon: Star },
      { href: '/admin/achievements', label: 'Achievements', icon: Trophy },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
      { href: '/admin/email', label: 'Email delivery', icon: Bell },
      { href: '/admin/profile', label: 'Profile and settings', icon: Settings },
    ]
  }

  if (role === 'employee') {
    return [
      { href: '/employee', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/employee/tickets', label: 'My tickets', icon: Ticket },
      { href: '/employee/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
      { href: '/employee/profile', label: 'Profile and settings', icon: Settings },
    ]
  }

  // client (default)
  return [
    { href: '/client', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/client/tickets', label: 'My tickets', icon: Ticket },
    { href: '/client/tickets/new', label: 'New ticket', icon: Plus },
    { href: '/client/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { href: '/client/profile', label: 'Profile and settings', icon: Settings },
  ]
}

function getRoleLabel(role: string): string {
  if (role === 'admin') return 'Administrator'
  if (role === 'employee') return 'Support staff'
  return 'Client'
}

function TechWorldLogo() {
  return (
    <div className="flex h-12 w-full max-w-[11rem] items-center justify-center rounded-xl bg-white px-4 py-2 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)] ring-1 ring-white/30">
      <Image
        src="/logo.png"
        alt="Technology World"
        width={140}
        height={32}
        className="h-auto w-full object-contain"
        priority
      />
    </div>
  )
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2C2772]'

interface SidebarContentProps extends SidebarProps {
  mobile?: boolean
  closeRef?: React.RefObject<HTMLButtonElement | null>
}

function SidebarContent({ user, unreadNotifications = 0, onClose, mobile = false, closeRef }: SidebarContentProps) {
  const pathname = usePathname()
  const navItems = getNavItems(user.role, unreadNotifications)

  // Only the most specific matching item is active, so "My tickets" is not
  // highlighted together with "New ticket".
  const activeHref =
    navItems
      .filter((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#2C2772]">
      {/* Soft light, matches the sign-in panel */}
      <div
        className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[#6A63D9]/30 blur-3xl"
        aria-hidden="true"
      />

      {/* Branding */}
      <div className="relative flex items-start justify-between gap-3 border-b border-white/15 px-4 pb-4 pt-5">
        <div className="min-w-0 flex-1">
          <TechWorldLogo />
          <p className="mt-2.5 truncate text-xs text-white/70">Support system</p>
        </div>

        {mobile && (
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={`-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white ${focusRing}`}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="relative flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.href === activeHref
          const hasBadge = item.badge !== undefined && item.badge > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150',
                focusRing,
                active ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              {active && (
                <span
                  className="absolute -left-3 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-white"
                  aria-hidden="true"
                />
              )}
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-white' : 'text-white/60 group-hover:text-white'
                )}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{item.label}</span>
              {hasBadge && (
                <span
                  className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold leading-none text-white"
                  aria-label={`${item.badge} unread`}
                >
                  {item.badge! > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Account */}
      <div className="relative border-t border-white/15 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt=""
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/30"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-white/30">
              <span className="text-xs font-semibold text-[#2C2772]">{getInitials(user.full_name)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight text-white">{user.full_name}</p>
            <p className="mt-0.5 truncate text-xs text-white/70">{getRoleLabel(user.role)}</p>
          </div>
        </div>

        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className={`group flex min-h-[44px] w-full items-center gap-2.5 rounded-lg border border-white/20 px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white ${focusRing}`}
          >
            <LogOut size={16} className="shrink-0 text-white/60 transition-colors group-hover:text-white" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export function Sidebar({ user, unreadNotifications = 0, isOpen = false, onClose }: SidebarProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null)

  // Mobile drawer: close on Escape, lock page scroll, move focus into the drawer
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent user={user} unreadNotifications={unreadNotifications} />
      </aside>

      {/* Mobile drawer: always mounted so it can slide, hidden from tab order when closed */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-[visibility] duration-300',
          isOpen ? 'visible' : 'invisible'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!isOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-[#2C2772]/60 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
          onClick={onClose}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-[84vw] max-w-[18rem] shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <SidebarContent
            user={user}
            unreadNotifications={unreadNotifications}
            onClose={onClose}
            mobile
            closeRef={closeRef}
          />
        </div>
      </div>
    </>
  )
}