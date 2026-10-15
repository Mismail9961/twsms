'use client'

import Link from 'next/link'
import { Bell, Menu, User, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { getInitials } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopbarProps {
  title: string
  user: { id: string; full_name: string; email: string; role: string; avatar_url?: string }
  unreadNotifications?: number
  onMobileMenuToggle?: () => void
}

const iconButton =
  'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#2C2772]/70 transition-colors hover:bg-[#2C2772]/5 hover:text-[#2C2772] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772]/40'

export function Topbar({
  title,
  user,
  unreadNotifications = 0,
  onMobileMenuToggle,
}: TopbarProps) {
  const notificationsLink = `/${user.role}/notifications`
  const profileLink = `/${user.role}/profile`

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-2 border-b border-[#2C2772]/10 bg-white/95 px-2 backdrop-blur sm:h-16 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className={`${iconButton} lg:hidden`}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="min-w-0 truncate text-sm min-[360px]:text-base font-semibold tracking-tight text-[#2C2772] sm:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-3">
        {/* Status indicator */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
          <span>Operational</span>
        </div>

        {/* Notifications icon */}
        <Link
          href={notificationsLink}
          className={iconButton}
          aria-label={
            unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : 'Notifications'
          }
          title="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2C2772] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex h-11 items-center gap-2.5 rounded-lg px-1.5 transition-colors hover:bg-[#2C2772]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772]/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2C2772] text-xs font-semibold text-white shadow-sm ring-2 ring-[#2C2772]/20">
                {getInitials(user.full_name || user.email)}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-medium leading-tight text-[#2C2772]">{user.full_name}</div>
                <div className="text-[10px] capitalize text-slate-500">{user.role}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-1rem)]">
            <DropdownMenuLabel>
              <div className="truncate text-xs font-semibold text-[#2C2772]">{user.full_name}</div>
              <div className="truncate text-[11px] font-normal text-slate-500">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileLink} className="flex cursor-pointer items-center gap-2">
                <User className="h-4 w-4 text-[#2C2772]/60" aria-hidden="true" />
                <span>Profile and settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={notificationsLink} className="flex cursor-pointer items-center gap-2">
                <Bell className="h-4 w-4 text-[#2C2772]/60" aria-hidden="true" />
                <span>Notifications ({unreadNotifications})</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              className="p-0 text-red-600 focus:text-red-600"
            >
              <form action={signOut} className="w-full">
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-sm"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Sign out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}