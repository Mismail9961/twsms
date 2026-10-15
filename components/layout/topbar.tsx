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

export function Topbar({
  title,
  user,
  unreadNotifications = 0,
  onMobileMenuToggle,
}: TopbarProps) {
  const notificationsLink = `/${user.role}/notifications`
  const profileLink = `/${user.role}/profile`

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Operational</span>
        </div>

        {/* Notifications Icon */}
        <Link
          href={notificationsLink}
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-gray-100 focus:outline-none transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-sm ring-2 ring-blue-500/20">
                {getInitials(user.full_name || user.email)}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-medium text-gray-900 leading-tight">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-gray-500 capitalize">{user.role}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-xs font-semibold text-gray-900">{user.full_name}</div>
              <div className="text-[11px] font-normal text-gray-500 truncate">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileLink} className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4 text-gray-500" />
                <span>Profile & Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={notificationsLink} className="flex items-center gap-2 cursor-pointer">
                <Bell className="h-4 w-4 text-gray-500" />
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
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
