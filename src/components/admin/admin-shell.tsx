'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users,
  BarChart3,
  Settings,
  LayoutDashboard,
  Activity,
  CreditCard,
  Layers,
  Mail,
  Send,
  FileSearch,
  FileText,
  MessageSquareQuote,
  List,
  ShieldAlert,
  LifeBuoy,
  Apple,
  Bot,
  Code2,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useAdmin } from '@/lib/hooks/use-admin'
import { adminAPI } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'
import { adminMcpUiEnabled } from '@/lib/admin-mcp/connect'
import {
  DashboardFrame,
  SidebarBrand,
  SidebarGroup,
  SidebarNavItem,
  SidebarUser,
  TopbarBreadcrumb,
  TopbarLink,
} from '@/components/dashboard/dashboard-frame'

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
    label: 'Catalog',
    items: [
      { name: 'Verified foods', href: '/admin/foods', icon: Apple, permission: 'admin:foods:view' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Support', href: '/admin/support', icon: LifeBuoy, permission: 'admin:support:view' },
      { name: 'Announcements', href: '/admin/announcements', icon: Mail, permission: 'admin:settings:update' },
      { name: 'Emails', href: '/admin/emails', icon: Send, permission: 'admin:settings:update' },
      { name: 'Blog', href: '/admin/blog', icon: FileText, permission: 'admin:settings:update' },
      { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote, permission: 'admin:settings:update' },
      { name: 'Security', href: '/admin/security', icon: ShieldAlert, permission: 'admin:monitoring:view' },
      { name: 'Audit log', href: '/admin/audit', icon: FileSearch, permission: 'admin:monitoring:view' },
      { name: 'Claude (MCP)', href: '/admin/mcp', icon: Bot, permission: 'admin:mcp' },
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
  '/admin/foods': 'Verified foods',
  '/admin/support': 'Support',
  '/admin/announcements': 'Announcements',
  '/admin/emails': 'Emails',
  '/admin/blog': 'Blog',
  '/admin/testimonials': 'Testimonials',
  '/admin/security': 'Security',
  '/admin/audit': 'Audit log',
  '/admin/mcp': 'Claude (MCP)',
  '/admin/settings': 'Settings',
  '/admin/monitoring': 'Monitoring',
}

function NavLinks({
  onNavigate,
  hasPermission,
  supportUnread,
}: {
  onNavigate?: () => void
  hasPermission: (p: string) => boolean
  supportUnread: number
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin">
      {NAV_SECTIONS.map((section) => {
        const visible = section.items.filter((item) => {
          if (item.href === '/admin/mcp' && !adminMcpUiEnabled()) return false
          return hasPermission(item.permission)
        })
        if (visible.length === 0) return null
        return (
          <SidebarGroup key={section.label} label={section.label}>
            {visible.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && Boolean(pathname?.startsWith(item.href)))
              return (
                <SidebarNavItem
                  key={item.name}
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  active={isActive}
                  onClick={onNavigate}
                  badge={item.href === '/admin/support' ? supportUnread : undefined}
                />
              )
            })}
          </SidebarGroup>
        )
      })}
    </nav>
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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
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

  const dotClass =
    status === 'healthy'
      ? 'bg-emerald-500'
      : status === 'warning'
        ? 'bg-amber-500'
        : status === 'critical'
          ? 'bg-rose-500'
          : 'bg-dash-dim animate-pulse'

  return (
    <button
      type="button"
      onClick={refresh}
      className="hidden h-9 items-center gap-2 rounded-[10px] border border-dash-border bg-white px-3 text-[13px] font-medium text-dash-body shadow-dash transition-colors hover:bg-dash-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:inline-flex"
      title="Click to refresh health status"
    >
      <span className={cn('h-2 w-2 shrink-0 rounded-full', dotClass)} aria-hidden />
      {label}
    </button>
  )
}

function breadcrumbItems(pathname: string | null): string[] {
  const path = pathname ?? ''
  if (PAGE_TITLES[path]) return ['Admin', PAGE_TITLES[path]]

  const match = Object.keys(PAGE_TITLES)
    .filter((href) => href !== '/admin' && path.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]

  if (!match) return ['Admin', path.startsWith('/admin') ? 'Admin' : 'Admin console']
  const rest = path.slice(match.length + 1).split('/')[0]
  return ['Admin', PAGE_TITLES[match], rest === 'new' ? 'New' : `#${rest}`]
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
  const [supportUnread, setSupportUnread] = useState(0)

  useEffect(() => {
    if (!hasPermission('admin:support:view')) return
    const refresh = () => {
      adminAPI
        .getSupportUnreadCount()
        .then((data) => setSupportUnread(data.count || 0))
        .catch(() => undefined)
    }
    refresh()
    const id = window.setInterval(refresh, 15_000)
    return () => window.clearInterval(id)
  }, [hasPermission])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <DashboardFrame
      brand={<SidebarBrand href="/admin" tag="Admin" />}
      renderNav={(onNavigate) => (
        <NavLinks
          onNavigate={onNavigate}
          hasPermission={hasPermission}
          supportUnread={supportUnread}
        />
      )}
      footer={
        <SidebarUser
          firstName={userFirstName}
          lastName={userLastName}
          email={userEmail}
          onLogout={handleLogout}
        />
      }
      topbarLeft={<TopbarBreadcrumb items={breadcrumbItems(pathname)} />}
      topbarRight={
        <>
          <SystemHealthBadge />
          <TopbarLink href="/dashboard" icon={Code2} label="Developer dashboard" />
        </>
      }
    >
      {children}
    </DashboardFrame>
  )
}
