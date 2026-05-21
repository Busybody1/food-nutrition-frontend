'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

export function DashboardPage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('dashboard-page animate-fade-in', className)}>
      <div className="dashboard-container">{children}</div>
    </div>
  )
}

export function DashboardPageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('dashboard-page-header', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="dashboard-title">{title}</h1>
        {description && <p className="dashboard-description">{description}</p>}
      </div>
      {children && <div className="dashboard-header-actions">{children}</div>}
    </div>
  )
}

export function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'brand',
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: LucideIcon
  accent?: 'brand' | 'green' | 'purple' | 'orange'
  className?: string
}) {
  const accentMap = {
    brand: 'bg-brand-muted text-brand-strong',
    green: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-violet-50 text-violet-700',
    orange: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className={cn('dashboard-stat-card', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="dashboard-stat-label">{label}</p>
          <p className="dashboard-stat-value">{value}</p>
          {hint && <p className="dashboard-stat-hint">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('dashboard-stat-icon', accentMap[accent])}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>
    </div>
  )
}

export function DashboardLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="dashboard-loading">
      <div className="dashboard-spinner" role="status" aria-label={message} />
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  )
}

export function DashboardAlert({
  variant = 'error',
  children,
  className,
}: {
  variant?: 'error' | 'success' | 'warning'
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('dashboard-alert', `dashboard-alert-${variant}`, className)}>
      {children}
    </div>
  )
}

export function DashboardProgress({
  value,
  max,
  className,
}: {
  value: number
  max: number
  className?: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className={cn('dashboard-progress-track', className)}>
      <div className="dashboard-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function DashboardQuickAction({
  href,
  icon: Icon,
  title,
  description,
  primary,
}: {
  href: string
  icon: LucideIcon
  title: string
  description?: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn('dashboard-quick-action', primary && 'dashboard-quick-action-primary')}
    >
      <div className={cn('dashboard-quick-action-icon', primary && 'bg-brand text-white')}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
      </div>
      <span className="text-ink-dim text-lg leading-none" aria-hidden>
        →
      </span>
    </Link>
  )
}

export function DashboardEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="dashboard-empty">
      <div className="dashboard-empty-icon">
        <Icon className="h-6 w-6 text-ink-dim" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="text-sm text-ink-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
