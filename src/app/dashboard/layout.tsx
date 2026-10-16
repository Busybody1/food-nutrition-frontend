'use client'

import { Suspense } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  Search,
  Key,
  Bot,
  BarChart3,
  CreditCard,
  BookOpen,
  MessageCircle,
  MessageSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { DashboardFeedbackForm } from '@/components/dashboard/DashboardFeedbackForm'
import { SupportChatProvider, useSupportChat } from '@/components/support/SupportChatWidget'
import {
  DashboardFrame,
  SidebarBrand,
  SidebarGroup,
  SidebarNavItem,
  SidebarUser,
  TopbarBreadcrumb,
  TopbarButton,
  TopbarLink,
} from '@/components/dashboard/dashboard-frame'

type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  hash?: boolean
  product?: 'rest' | 'mcp'
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Search', href: '/dashboard/search', icon: Search },
    ],
  },
  {
    label: 'Access',
    items: [
      { name: 'REST API', href: '/dashboard/api-keys?product=rest', icon: Key, product: 'rest' },
      { name: 'MCP', href: '/dashboard/api-keys?product=mcp', icon: Bot, product: 'mcp' },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Usage', href: '/dashboard/usage', icon: BarChart3 },
      { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { name: 'Account', href: '/dashboard/account', icon: Settings },
      { name: 'Feedback', href: '#dashboard-feedback', icon: MessageSquare, hash: true },
    ],
  },
]

const SECTION_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/search': 'Search',
  '/dashboard/usage': 'Usage',
  '/dashboard/billing': 'Billing',
  '/dashboard/account': 'Account',
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onKeys = Boolean(pathname?.startsWith('/dashboard/api-keys'))

  return (
    <nav aria-label="Dashboard">
      {NAV_GROUPS.map((group) => (
        <SidebarGroup key={group.label} label={group.label}>
          {group.items.map((item) => {
            const isHash = Boolean(item.hash)
            const isActive = item.product
              ? onKeys && searchParams.get('product') === item.product
              : !isHash &&
                !onKeys &&
                (pathname === item.href ||
                  (item.href !== '/dashboard' && Boolean(pathname?.startsWith(item.href))))
            return (
              <SidebarNavItem
                key={item.name}
                href={item.href}
                icon={item.icon}
                label={item.name}
                active={isActive}
                onClick={onNavigate}
                nativeAnchor={isHash}
              />
            )
          })}
        </SidebarGroup>
      ))}
    </nav>
  )
}

function Breadcrumb() {
  const pathname = usePathname() ?? '/dashboard'
  const searchParams = useSearchParams()
  let section = SECTION_TITLES[pathname]
  if (!section && pathname.startsWith('/dashboard/api-keys')) {
    section = searchParams.get('product') === 'mcp' ? 'MCP keys' : 'REST API keys'
  }
  if (!section) {
    const match = Object.keys(SECTION_TITLES)
      .filter((href) => href !== '/dashboard' && pathname.startsWith(`${href}/`))
      .sort((a, b) => b.length - a.length)[0]
    section = match ? SECTION_TITLES[match] : 'Dashboard'
  }
  return <TopbarBreadcrumb items={['Dashboard', section]} />
}

function TopbarActions() {
  const { openSupport, unreadCount, isOpen } = useSupportChat()
  return (
    <>
      <TopbarLink href="/docs" icon={BookOpen} label="Docs" external />
      <TopbarButton
        icon={MessageCircle}
        label="Support"
        onClick={openSupport}
        pressed={isOpen}
        badge={unreadCount}
      />
    </>
  )
}

function UserFooter({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  return (
    <SidebarUser
      firstName={user?.first_name}
      lastName={user?.last_name}
      email={user?.email}
      onLogout={onLogout}
    />
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <SupportChatProvider>
      <DashboardFrame
        brand={<SidebarBrand href="/dashboard" />}
        renderNav={(onNavigate) => (
          <Suspense fallback={null}>
            <NavLinks onNavigate={onNavigate} />
          </Suspense>
        )}
        footer={<UserFooter onLogout={handleLogout} />}
        topbarLeft={
          <Suspense fallback={null}>
            <Breadcrumb />
          </Suspense>
        }
        topbarRight={<TopbarActions />}
      >
        {children}
        <div className="mx-auto w-full max-w-[1360px] px-4 pb-10 pt-0 sm:px-6 lg:px-8">
          <DashboardFeedbackForm />
        </div>
      </DashboardFrame>
    </SupportChatProvider>
  )
}
