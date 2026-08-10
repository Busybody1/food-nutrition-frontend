'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users,
  BarChart3,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Activity,
  ExternalLink,
  CreditCard,
  Layers,
  Mail,
  Send,
  FileSearch,
  FileText,
  MessageSquareQuote,
  List,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useAdmin } from '@/lib/hooks/use-admin'
import { adminAPI } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SITE_NAME } from '@/lib/site'
import { cn } from '@/lib/utils/cn'

const NAV_SECTIONS = [
  {
    label: 'Platform',
    items: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard, permission: 'admin:analytics:view' },
      { name: 'Users', href: '/admin/users', icon: Users, permission: 'admin:users:view' },
      { name: 'Requests', href: '/admin/requests', icon: List, permission: 'admin:analytics:view' },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'admin:analytics:view' },
    ],
  },
  {
    label: 'Business',
    items: [
      { name: 'Plans', href: '/admin/plans', icon: Layers, permission: 'admin:settings:view' },
      { name: 'Billing', href: '/admin/billing', icon: CreditCard, permission: 'admin:billing:view' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Announcements', href: '/admin/announcements', icon: Mail, permission: 'admin:settings:update' },
      { name: 'Emails', href: '/admin/emails', icon: Send, permission: 'admin:settings:update' },
      { name: 'Blog', href: '/admin/blog', icon: FileText, permission: 'admin:settings:update' },
      { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote, permission: 'admin:settings:update' },
      { name: 'Security', href: '/admin/security', icon: ShieldAlert, permission: 'admin:monitoring:view' },
      { name: 'Audit log', href: '/admin/audit', icon: FileSearch, permission: 'admin:monitoring:view' },
      { name: 'Settings', href: '/admin/settings', icon: Settings, permission: 'admin:settings:view' },
      { name: 'Monitoring', href: '/admin/monitoring', icon: Activity, permission: 'admin:monitoring:view' },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/users': 'Users',
  '/admin/requests': 'Requests',
  '/admin/analytics': 'Analytics',
  '/admin/plans': 'Plans',
  '/admin/billing': 'Billing',
  '/admin/announcements': 'Announcements',
  '/admin/emails': 'Emails',
  '/admin/blog': 'Blog',
  '/admin/testimonials': 'Testimonials',
  '/admin/security': 'Security',
  '/admin/audit': 'Audit log',
  '/admin/settings': 'Settings',
  '/admin/monitoring': 'Monitoring',
}

function NavLinks({
  onNavigate,
  hasPermission,
}: {
  onNavigate?: () => void
  hasPermission: (p: string) => boolean
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-5 px-3" aria-label="Admin">
      {NAV_SECTIONS.map((section) => {
        const visible = section.items.filter((item) => hasPermission(item.permission))
        if (visible.length === 0) return null
        return (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-dim">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {visible.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn('dashboard-nav-link', isActive && 'dashboard-nav-link-active')}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0 opacity-80" aria-hidden />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}

function SidebarBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 px-5 py-1 group">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-brand bg-violet-600 text-white shadow-sm">
        <Shield className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <span className="block text-sm font-semibold text-ink tracking-tight">Admin</span>
        <span className="block text-[10px] font-medium uppercase tracking-wider text-ink-dim">
          {SITE_NAME}
        </span>
      </div>
    </Link>
  )
}

function UserBlock({
  email,
  firstName,
  lastName,
  onLogout,
}: {
  email?: string
  firstName?: string
  lastName?: string
  onLogout: () => void
}) {
  const initials = [firstName?.[0], lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="border-t border-surface-border/60 p-3">
      <div className="flex items-center gap-3 rounded-brand px-2 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink truncate">
            {firstName} {lastName}
          </p>
          <p className="text-xs text-ink-muted truncate">{email}</p>
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
        href="/dashboard"
        className="mt-1 flex items-center gap-2 rounded-brand px-3 py-2 text-xs font-medium text-ink-muted hover:bg-surface-elevated hover:text-ink transition-colors"
      >
        <Image
          src="/logos/busybody-logo.png"
          alt=""
          width={14}
          height={14}
          className="opacity-70"
        />
        Developer dashboard
        <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
      </Link>
    </div>
  )
}

function SystemHealthBadge() {
  const [status, setStatus] = useState<'healthy' | 'warning' | 'critical' | 'loading'>('loading')

  const refresh = () => {
    setStatus('loading')
    adminAPI
      .getSystemHealth()
      .then((data) => {
        const services = data.services || []
        const hasCritical = services.some((s) => s.status === 'critical')
        const hasWarning = services.some((s) => s.status === 'warning')
        if (hasCritical) setStatus('critical')
        else if (hasWarning) setStatus('warning')
        else setStatus('healthy')
      })
      .catch(() => setStatus('critical'))
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [])

  const label =
    status === 'loading'
      ? 'Checking...'
      : status === 'healthy'
        ? 'All systems operational'
        : status === 'warning'
          ? 'Degraded performance'
          : 'Service issues detected'

  const className =
    status === 'healthy'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
      : status === 'warning'
        ? 'bg-amber-50 text-amber-800 border-amber-200/80'
        : status === 'critical'
          ? 'bg-red-50 text-red-800 border-red-200/80'
          : 'bg-surface-elevated text-ink-muted border-surface-border/80'

  const dotClass =
    status === 'healthy'
      ? 'bg-emerald-500'
      : status === 'warning'
        ? 'bg-amber-500'
        : status === 'critical'
          ? 'bg-red-500'
          : 'bg-ink-dim animate-pulse'

  return (
    <button
      type="button"
      onClick={refresh}
      className={cn(
        'hidden sm:inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-90',
        className
      )}
      title="Click to refresh health status"
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 shrink-0', dotClass)} />
      {label}
    </button>
  )
}

/** Longest matching section in PAGE_TITLES, so detail routes keep their parent's name. */
function sectionTitle(pathname: string | null): { section: string; leaf?: string } {
  const path = pathname ?? ''
  if (PAGE_TITLES[path]) return { section: PAGE_TITLES[path] }

  const match = Object.keys(PAGE_TITLES)
    .filter((href) => href !== '/admin' && path.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]

  if (!match) return { section: path.startsWith('/admin') ? 'Admin' : 'Admin console' }
  const rest = path.slice(match.length + 1).split('/')[0]
  return { section: PAGE_TITLES[match], leaf: rest === 'new' ? 'New' : `#${rest}` }
}

function HeaderBreadcrumb({ pathname }: { pathname: string | null }) {
  const { section, leaf } = sectionTitle(pathname)

  return (
    <div className="flex items-center gap-1.5 text-sm min-w-0">
      <span className="text-ink-muted hidden md:inline">Admin</span>
      <ChevronRight className="h-3.5 w-3.5 text-ink-dim hidden md:block shrink-0" aria-hidden />
      <span className={cn('truncate', leaf ? 'text-ink-muted' : 'font-semibold text-ink')}>
        {section}
      </span>
      {leaf && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-ink-dim shrink-0" aria-hidden />
          <span className="font-semibold text-ink truncate">{leaf}</span>
        </>
      )}
    </div>
  )
}

export function AdminShell({
  children,
  userEmail,
  userFirstName,
  userLastName,
}: {
  children: React.ReactNode
  userEmail?: string
  userFirstName?: string
  userLastName?: string
}) {
  const { logout } = useAuth()
  const { hasPermission } = useAdmin()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-surface-elevated">
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-200',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
        <aside className="relative flex h-full w-[min(300px,88vw)] flex-col bg-white shadow-glass-lg animate-fade-in">
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
            <NavLinks onNavigate={() => setSidebarOpen(false)} hasPermission={hasPermission} />
          </div>
          <UserBlock
            email={userEmail}
            firstName={userFirstName}
            lastName={userLastName}
            onLogout={handleLogout}
          />
        </aside>
      </div>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[252px] lg:flex-col bg-white border-r border-surface-border/60 z-30">
        <div className="pt-6 pb-4">
          <SidebarBrand />
        </div>
        <div className="flex-1 overflow-y-auto py-2 min-h-0">
          <NavLinks hasPermission={hasPermission} />
        </div>
        <UserBlock
          email={userEmail}
          firstName={userFirstName}
          lastName={userLastName}
          onLogout={handleLogout}
        />
      </aside>

      <div className="lg:pl-[252px] flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-surface-border/60 bg-white/90 backdrop-blur-md px-4 lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 p-0 lg:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <HeaderBreadcrumb pathname={pathname} />
          </div>
          <SystemHealthBadge />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
