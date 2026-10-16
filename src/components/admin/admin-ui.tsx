'use client'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  RefreshCw,
} from 'lucide-react'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardQuickAction,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardPanelBody,
  DashboardPanelToolbar,
  DashboardSegmented,
  DashboardPill,
  DashboardStatList,
  DashboardIconTile,
  DashboardModalCard,
  DashboardPageSkeleton,
  DashboardSkeleton,
  DashboardSearchInput,
  DeltaPill,
  InfoHint,
  RateBar,
  DASHBOARD_ICON_STROKE,
  type DashboardTone,
} from '@/components/dashboard/dashboard-shell'

export {
  DashboardPage,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardQuickAction,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardPanelBody,
  DashboardPanelToolbar,
  DashboardSegmented,
  DashboardPill,
  DashboardStatList,
  DashboardIconTile,
  DashboardModalCard,
  DashboardPageSkeleton,
  DashboardSkeleton,
  DashboardSearchInput,
  DeltaPill,
  InfoHint,
  RateBar,
  DASHBOARD_ICON_STROKE,
}
export type { DashboardTone }

export function AdminPage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <DashboardPage className={className}>{children}</DashboardPage>
}

export function AdminPageBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col gap-5', className)}>{children}</div>
}

export function AdminPageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  meta?: React.ReactNode
}) {
  return (
    <DashboardPageHeader title={title} description={description} meta={meta}>
      {actions}
    </DashboardPageHeader>
  )
}

export function AdminStatGrid({
  children,
  className,
  columns = 4,
}: {
  children: React.ReactNode
  className?: string
  columns?: 3 | 4
}) {
  return (
    <div className={cn(columns === 3 ? 'dashboard-grid-kpi' : 'dashboard-grid-kpi-4', className)}>
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
  return (
    <DashboardPanel as="div" className={className}>
      {children}
    </DashboardPanel>
  )
}

export function AdminPanelHeader({
  title,
  icon,
  actions,
  description,
}: {
  title: React.ReactNode
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  actions?: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <DashboardPanelHeader title={title} icon={icon} actions={actions} description={description} />
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
    <DashboardPanelBody flush={noPadding} className={className}>
      {children}
    </DashboardPanelBody>
  )
}

export function AdminTableWrap({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-table-wrap">{children}</div>
}

export function AdminTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <table className={cn('dashboard-table', className)}>{children}</table>
}

export type AdminSortOrder = 'asc' | 'desc'

export interface AdminSortState<K extends string> {
  key: K
  order: AdminSortOrder
}

export function AdminSortableTh<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  defaultOrder = 'desc',
  align = 'left',
  className,
  title,
}: {
  label: string
  sortKey: K
  sort: AdminSortState<K>
  onSort: (next: AdminSortState<K>) => void

  defaultOrder?: AdminSortOrder
  align?: 'left' | 'right'
  className?: string
  title?: string
}) {
  const isActive = sort.key === sortKey
  const Icon = !isActive ? ChevronsUpDown : sort.order === 'asc' ? ArrowUp : ArrowDown

  return (
    <th
      className={cn(align === 'right' && 'text-right', className)}
      aria-sort={isActive ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        title={title ?? `Sort by ${label.toLowerCase()}`}
        onClick={() =>
          onSort({
            key: sortKey,
            order: isActive ? (sort.order === 'asc' ? 'desc' : 'asc') : defaultOrder,
          })
        }
        className={cn(
          'group -mx-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 uppercase tracking-[0.06em] transition-colors',
          'hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
          align === 'right' && 'flex-row-reverse',
          isActive && 'text-dash-ink'
        )}
      >
        {label}
        <Icon
          className={cn(
            'h-3 w-3 shrink-0 transition-opacity',
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
          )}
          aria-hidden
        />
      </button>
    </th>
  )
}

function PagerButton({
  label,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-dash-border bg-white text-dash-body shadow-dash transition-colors hover:bg-dash-hover hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
    </button>
  )
}

export function AdminPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
  loading,
  noun = 'rows',
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  loading?: boolean
  noun?: string
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-dash-border px-5 py-3 sm:flex-row">
      <div className="flex items-center gap-4">
        <p className="text-xs tabular-nums text-dash-muted">
          {total === 0 ? `No ${noun}` : `${start}–${end} of ${total.toLocaleString()} ${noun}`}
        </p>
        {onPageSizeChange && (
          <label className="hidden items-center gap-2 text-xs text-dash-muted sm:flex">
            Per page
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="dashboard-select h-8 pl-2.5 pr-7 text-xs"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <PagerButton
          label="First page"
          icon={ChevronsLeft}
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || loading}
        />
        <PagerButton
          label="Previous page"
          icon={ChevronLeft}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
        />
        <span className="whitespace-nowrap px-2 text-xs tabular-nums text-dash-muted">
          Page <span className="font-medium text-dash-ink">{page}</span> of {totalPages}
        </span>
        <PagerButton
          label="Next page"
          icon={ChevronRight}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
        />
        <PagerButton
          label="Last page"
          icon={ChevronsRight}
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || loading}
        />
      </div>
    </div>
  )
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
    <DashboardSegmented value={value} options={options} onChange={onChange} ariaLabel="Time range" />
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
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading} className="h-9 gap-1.5">
      <RefreshCw
        className={cn('h-4 w-4', loading && 'animate-spin')}
        strokeWidth={DASHBOARD_ICON_STROKE}
        aria-hidden
      />
      {label}
    </Button>
  )
}

export function AdminHttpStatusBadge({ code }: { code: number }) {
  const tone: DashboardTone =
    code >= 500 ? 'rose' : code >= 400 ? 'orange' : code >= 300 ? 'indigo' : 'green'
  return (
    <DashboardPill tone={tone} className="font-semibold tabular-nums">
      {code}
    </DashboardPill>
  )
}

export function AdminDetailGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode; mono?: boolean }[]
}) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-dash-muted">{item.label}</dt>
          <dd
            className={cn(
              'mt-1 text-[13px] font-medium text-dash-ink',
              item.mono && 'break-all font-mono text-xs font-normal'
            )}
          >
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
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  }>
  emptyTitle?: string
}) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-medium text-dash-ink">{emptyTitle}</p>
        <p className="mt-1 text-[13px] text-dash-muted">No activity in this period yet.</p>
      </div>
    )
  }
  const severityStyles = {
    info: 'bg-dash-teal-soft text-dash-teal-strong',
    warning: 'bg-dash-warning-soft text-dash-warning',
    error: 'bg-dash-negative-soft text-dash-negative',
  }
  return (
    <ul>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <li key={item.id} className="dashboard-activity-item">
            <div className={cn('dashboard-activity-icon', severityStyles[item.severity])}>
              <Icon className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-5 text-dash-ink" title={item.message}>
                {item.message}
              </p>
              <p className="mt-0.5 text-xs text-dash-muted">
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
    <div className={count === 3 ? 'dashboard-grid-kpi' : 'dashboard-grid-kpi-4'} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="dashboard-stat-card gap-4">
          <div className="flex items-center gap-2.5">
            <DashboardSkeleton className="h-7 w-7 rounded-lg" />
            <DashboardSkeleton className="h-4 w-24" />
          </div>
          <DashboardSkeleton className="h-8 w-28" />
          <DashboardSkeleton className="h-3 w-36" />
        </div>
      ))}
    </div>
  )
}
