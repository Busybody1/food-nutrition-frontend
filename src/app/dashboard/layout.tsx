'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Search,
  Key,
  BarChart3,
  CreditCard,
  Menu,
  X,
  LogOut,
  BookOpen,
  ExternalLink,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'
import { SITE_NAME } from '@/lib/site'
import { cn } from '@/lib/utils/cn'
import { DashboardFeedbackForm } from '@/components/dashboard/DashboardFeedbackForm'

const navigation: {
  name: string
  href: string
  icon: LucideIcon
  hash?: boolean
}[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Search', href: '/dashboard/search', icon: Search },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Usage', href: '/dashboard/usage', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Feedback', href: '#dashboard-feedback', icon: MessageSquare, hash: true },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 px-3" aria-label="Dashboard">
      {navigation.map((item) => {
        const isHash = Boolean(item.hash)
        const isActive =
          !isHash &&
          (pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href)))
        const className = cn(
          'dashboard-nav-link',
          isActive && 'dashboard-nav-link-active'
        )
        const icon = <item.icon className="h-[18px] w-[18px] shrink-0 opacity-80" aria-hidden />

        if (isHash) {
          return (
            <a key={item.name} href={item.href} onClick={onNavigate} className={className}>
              {icon}
              {item.name}
            </a>
          )
        }

        return (
          <Link key={item.name} href={item.href} onClick={onNavigate} className={className}>
            {icon}
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-1 group">
      <span className="relative block h-7 w-7 shrink-0">
        <Image
          src="/logos/busybody-logo.png"
          alt={`${SITE_NAME} logo`}
          fill
          sizes="28px"
          className="object-contain"
        />
      </span>
      <span className="text-sm font-semibold text-ink tracking-tight">{SITE_NAME}</span>
    </Link>
  )
}

function UserBlock({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="border-t border-surface-border/60 p-3">
      <div className="flex items-center gap-3 rounded-brand px-2 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-semibold text-brand-strong">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-ink-muted truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="h-8 w-8 p-0 text-ink-muted hover:text-ink"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      <Link
        href="/docs"
        className="mt-1 flex items-center gap-2 rounded-brand px-3 py-2 text-xs font-medium text-ink-muted hover:bg-surface-elevated hover:text-ink transition-colors"
      >
        <BookOpen className="h-3.5 w-3.5" />
        API documentation
        <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
      </Link>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-surface-elevated">
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-opacity',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
        <aside className="relative flex h-full w-[min(280px,85vw)] flex-col bg-white shadow-glass-lg">
          <div className="flex items-center justify-between px-4 pt-5 pb-2">
            <SidebarBrand />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="h-9 w-9 p-0"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <NavLinks onNavigate={() => setSidebarOpen(false)} />
          </div>
          <UserBlock onLogout={handleLogout} />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[240px] lg:flex-col bg-white shadow-sidebar z-30">
        <div className="pt-6 pb-4">
          <SidebarBrand />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <NavLinks />
        </div>
        <UserBlock onLogout={handleLogout} />
      </aside>

      <div className="lg:pl-[240px] flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-surface-border/60 bg-white/80 backdrop-blur-md px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 p-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-ink">Dashboard</span>
        </header>

        <main className="flex-1">
          {children}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <DashboardFeedbackForm />
          </div>
        </main>
      </div>
    </div>
  )
}
