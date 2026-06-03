'use client'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardQuickAction,
} from '@/components/dashboard/dashboard-shell'

export {
  DashboardPage,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardQuickAction,
}

export function AdminPage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <DashboardPage className={className}>
      <div className="flex flex-col gap-6 sm:gap-8">{children}</div>
    </DashboardPage>
  )
}

/** Wraps page sections below the header (charts, tables, filters). */
export function AdminPageBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col gap-6', className)}>{children}</div>
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <DashboardPageHeader title={title} description={description}>
      {actions}
    </DashboardPageHeader>
  )
}

export function AdminStatGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  )
}

export function AdminPanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('dashboard-panel', className)}>{children}</div>
}

export function AdminPanelHeader({
  title,
  icon: Icon,
  actions,
}: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
}) {
  return (
    <div className="dashboard-panel-header">
      <h2 className="dashboard-panel-title flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-brand-strong shrink-0" aria-hidden />}
        {title}
      </h2>
      {actions}
    </div>
  )
}

export function AdminPanelBody({
  children,
  className,
  noPadding,
}: {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}) {
  return (
    <div className={cn(noPadding ? '' : 'dashboard-panel-body', className)}>{children}</div>
  )
}

export function AdminTableWrap({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-table-wrap">{children}</div>
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return <table className="dashboard-table">{children}</table>
}

export function AdminFilterBar({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-filter-bar">{children}</div>
}

export function AdminFilterField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('dashboard-filter-field', className)}>
      <label>{label}</label>
      {children}
    </div>
  )
}

export function AdminTimeRangeToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="dashboard-segmented" role="group" aria-label="Time range">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(
            'dashboard-segmented-btn',
            value === opt.value && 'dashboard-segmented-btn-active'
          )}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function AdminRefreshButton({
  onClick,
  loading,
  label = 'Refresh',
}: {
  onClick: () => void
  loading?: boolean
  label?: string
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} aria-hidden />
      {label}
    </Button>
  )
}

export function AdminHttpStatusBadge({ code }: { code: number }) {
  const variant =
    code >= 500 ? 'bg-red-100 text-red-800 border-red-200/80' :
    code >= 400 ? 'bg-amber-100 text-amber-900 border-amber-200/80' :
    code >= 300 ? 'bg-sky-100 text-sky-800 border-sky-200/80' :
    'bg-emerald-100 text-emerald-800 border-emerald-200/80'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums',
        variant
      )}
    >
      {code}
    </span>
  )
}

export function AdminDetailGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode; mono?: boolean }[]
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-dim">{item.label}</dt>
          <dd className={cn('mt-0.5 text-sm text-ink', item.mono && 'font-mono text-xs break-all')}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function AdminActivityFeed({
  items,
  emptyTitle = 'No recent activity',
}: {
  items: Array<{
    id: string
    message: string
    timestamp: string
    severity: 'info' | 'warning' | 'error'
    icon: React.ComponentType<{ className?: string }>
  }>
  emptyTitle?: string
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-muted text-center py-8">No activity in this period yet.</p>
    )
  }
  const severityStyles = {
    info: 'bg-brand-muted text-brand-strong',
    warning: 'bg-amber-50 text-amber-800',
    error: 'bg-red-50 text-red-800',
  }
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <li key={item.id} className="dashboard-activity-item">
            <div className={cn('dashboard-activity-icon', severityStyles[item.severity])}>
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink leading-snug">{item.message}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function AdminSkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[108px] rounded-brand bg-white border border-surface-border/60"
        />
      ))}
    </div>
  )
}
