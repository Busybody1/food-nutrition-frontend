'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, ChevronRight, Info, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

export const DASHBOARD_ICON_STROKE = 1.75

export type DashboardTone = 'brand' | 'green' | 'purple' | 'indigo' | 'orange' | 'rose' | 'neutral'

const TILE_TONES: Record<DashboardTone, string> = {
  brand: 'bg-dash-teal-soft text-dash-teal-strong',
  green: 'bg-dash-positive-soft text-dash-positive',
  purple: 'bg-dash-indigo-soft text-dash-indigo',
  indigo: 'bg-dash-indigo-soft text-dash-indigo',
  orange: 'bg-dash-warning-soft text-dash-warning',
  rose: 'bg-dash-negative-soft text-dash-negative',
  neutral: 'bg-dash-pill text-dash-body',
}

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
  meta,
  children,
  className,
}: {
  title: string
  description?: string
  meta?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('dashboard-page-header', className)}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="dashboard-title">{title}</h1>
          {meta}
        </div>
        {description && (
          <p className="dashboard-description" title={description}>
            {description}
          </p>
        )}
      </div>
      {children && <div className="dashboard-header-actions">{children}</div>}
    </div>
  )
}

export function DashboardIconTile({
  icon: Icon,
  tone = 'neutral',
  outline,
  className,
}: {
  icon: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number }>
  tone?: DashboardTone
  outline?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        outline ? 'dashboard-icon-tile-outline' : cn('dashboard-icon-tile', TILE_TONES[tone]),
        className
      )}
      aria-hidden
    >
      <Icon className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
    </span>
  )
}

export function DeltaPill({
  value,
  unit = '%',
  label,
  className,
}: {
  value: number | null | undefined
  unit?: '%' | ''
  label?: string
  className?: string
}) {
  if (value == null || !Number.isFinite(value)) return null
  const magnitude = Math.abs(value)
  const text =
    unit === '%'
      ? `${magnitude.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
      : magnitude.toLocaleString()
  if (value === 0) {
    return (
      <span className={cn('dashboard-delta bg-dash-pill text-dash-muted', className)} title={label}>
        {text}
      </span>
    )
  }
  const up = value > 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn('dashboard-delta', up ? 'dashboard-delta-up' : 'dashboard-delta-down', className)}
      title={label}
    >
      <span className="sr-only">{up ? 'Up' : 'Down'} </span>
      {text}
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
    </span>
  )
}

export function InfoHint({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('group relative inline-flex shrink-0', className)}>
      <button
        type="button"
        aria-label={text}
        className="rounded-full text-dash-dim transition-colors hover:text-dash-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <Info className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-6 z-30 hidden w-64 rounded-lg border border-dash-border bg-white px-3 py-2 text-xs font-normal leading-5 text-dash-body shadow-dash-pop group-focus-within:block group-hover:block"
      >
        {text}
      </span>
    </span>
  )
}

export function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'brand',
  delta,
  info,
  footer,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: LucideIcon
  accent?: DashboardTone
  delta?: React.ReactNode
  info?: string
  footer?: React.ReactNode
  className?: string
}) {
  const shown = value == null || value === '' ? '—' : value
  return (
    <div className={cn('dashboard-stat-card', className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && <DashboardIconTile icon={Icon} tone={accent} />}
        <p className="dashboard-stat-label">{label}</p>
        {info && <InfoHint text={info} className="ml-auto" />}
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <p className="dashboard-stat-value">{shown}</p>
        {delta}
      </div>
      {hint && <p className="dashboard-stat-hint">{hint}</p>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  )
}

export function DashboardPanel({
  children,
  className,
  as: Comp = 'section',
  id,
}: {
  children: React.ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
  id?: string
}) {
  return (
    <Comp id={id} className={cn('dashboard-panel', className)}>
      {children}
    </Comp>
  )
}

export function DashboardPanelHeader({
  title,
  icon,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  icon?: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number }>
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('dashboard-panel-header', className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && <DashboardIconTile icon={icon} outline />}
        <div className="min-w-0">
          <h2 className="dashboard-panel-title">{title}</h2>
          {description && <p className="dashboard-panel-description">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function DashboardPanelBody({
  children,
  className,
  flush,
}: {
  children: React.ReactNode
  className?: string
  flush?: boolean
}) {
  return (
    <div className={cn(flush ? 'dashboard-panel-body-flush' : 'dashboard-panel-body', className)}>
      {children}
    </div>
  )
}

export function DashboardPanelToolbar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('dashboard-panel-toolbar', className)}>{children}</div>
}

export function DashboardSearchInput({
  value,
  onChange,
  placeholder = 'Search',
  ariaLabel,
  className,
  autoFocus,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
  autoFocus?: boolean
}) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-dim"
        strokeWidth={DASHBOARD_ICON_STROKE}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        autoFocus={autoFocus}
        className="dashboard-input pl-9"
      />
    </div>
  )
}

export function DashboardTableWrap({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-table-wrap">{children}</div>
}

export function DashboardTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <table className={cn('dashboard-table', className)}>{children}</table>
}

export function RateBar({
  value,
  label,
  className,
}: {
  value: number
  label?: string
  className?: string
}) {
  const pct = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
  return (
    <span className={cn('dashboard-rate', className)}>
      <span className="dashboard-rate-track" aria-hidden>
        <span className="dashboard-rate-fill block" style={{ width: `${pct}%` }} />
      </span>
      <span className="w-11 text-right text-xs tabular-nums text-dash-body">
        {label ?? `${pct.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
      </span>
    </span>
  )
}

export function DashboardSegmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel = 'Options',
  className,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  ariaLabel?: string
  className?: string
}) {
  return (
    <div className={cn('dashboard-segmented', className)} role="group" aria-label={ariaLabel}>
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

const PILL_TONES: Record<DashboardTone | 'outline', string> = {
  brand: 'bg-dash-teal-soft text-dash-teal-strong',
  green: 'bg-dash-positive-soft text-dash-positive',
  purple: 'bg-dash-indigo-soft text-dash-indigo',
  indigo: 'bg-dash-indigo-soft text-dash-indigo',
  orange: 'bg-dash-warning-soft text-dash-warning',
  rose: 'bg-dash-negative-soft text-dash-negative',
  neutral: 'bg-dash-pill text-dash-body',
  outline: 'border border-dash-border bg-white text-dash-body',
}

export function DashboardPill({
  tone = 'neutral',
  icon: Icon,
  children,
  className,
  title,
}: {
  tone?: DashboardTone | 'outline'
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <span className={cn('dashboard-pill', PILL_TONES[tone], className)} title={title}>
      {Icon && <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />}
      {children}
    </span>
  )
}

export function DashboardStatList({
  items,
  className,
}: {
  items: { label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode }[]
  className?: string
}) {
  return (
    <dl className={cn('dashboard-stat-list', className)}>
      {items.map((item, index) => (
        <div key={index} className="dashboard-stat-row">
          <dt className="min-w-0 text-dash-muted">{item.label}</dt>
          <dd className="flex shrink-0 items-center gap-2 text-right font-medium tabular-nums text-dash-ink">
            {item.value == null || item.value === '' ? '—' : item.value}
            {item.hint}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function DashboardLoading({
  message = 'Loading...',
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={cn('dashboard-loading', className)}>
      <div className="dashboard-spinner" role="status" aria-label={message} />
      <p className="text-[13px] text-dash-muted">{message}</p>
    </div>
  )
}

export function DashboardSkeleton({ className }: { className?: string }) {
  return <div className={cn('dashboard-skeleton', className)} aria-hidden />
}

export function DashboardPageSkeleton({
  kpis = 3,
  label = 'Loading',
}: {
  kpis?: 3 | 4
  label?: string
}) {
  return (
    <DashboardPage>
      <div role="status" aria-label={label} className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <DashboardSkeleton className="h-6 w-48" />
            <DashboardSkeleton className="h-4 w-72" />
          </div>
          <DashboardSkeleton className="hidden h-9 w-40 rounded-[10px] sm:block" />
        </div>
        <div className={kpis === 4 ? 'dashboard-grid-kpi-4' : 'dashboard-grid-kpi'}>
          {Array.from({ length: kpis }).map((_, i) => (
            <div key={i} className="dashboard-stat-card gap-4">
              <div className="flex items-center gap-2.5">
                <DashboardSkeleton className="h-7 w-7 rounded-lg" />
                <DashboardSkeleton className="h-4 w-28" />
              </div>
              <DashboardSkeleton className="h-8 w-32" />
              <DashboardSkeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
        <div className="dashboard-grid-wide">
          <div className="dashboard-card h-[340px] p-5">
            <DashboardSkeleton className="h-4 w-36" />
            <DashboardSkeleton className="mt-6 h-[240px] w-full rounded-xl" />
          </div>
          <div className="dashboard-card h-[340px] p-5">
            <DashboardSkeleton className="h-4 w-28" />
            <DashboardSkeleton className="mt-6 h-[240px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </DashboardPage>
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
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('dashboard-alert', `dashboard-alert-${variant}`, className)}
    >
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
    <div
      className={cn('dashboard-progress-track', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
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
      <div
        className={cn(
          'dashboard-quick-action-icon',
          primary && 'bg-dash-teal-strong text-white'
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-dash-ink">{title}</p>
        {description && <p className="mt-0.5 truncate text-xs text-dash-muted">{description}</p>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-dash-dim" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
    </Link>
  )
}

export function DashboardEmpty({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('dashboard-empty', className)}>
      <div className="dashboard-empty-icon">
        <Icon className="h-5 w-5 text-dash-dim" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-dash-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[13px] text-dash-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function DashboardModal({
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
}: {
  children: React.ReactNode
  onClose: () => void
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  className?: string
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, closeOnEscape])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="dashboard-modal-root" role="presentation">
      <button
        type="button"
        className={cn('dashboard-modal-backdrop', !closeOnBackdrop && 'cursor-default')}
        aria-label={closeOnBackdrop ? 'Close dialog' : undefined}
        aria-hidden={!closeOnBackdrop}
        tabIndex={closeOnBackdrop ? 0 : -1}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        className={cn(
          'relative z-[81] w-full max-w-md max-h-[min(90dvh,40rem)] overflow-y-auto',
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export function DashboardModalCard({
  title,
  icon,
  description,
  onClose,
  closeDisabled,
  children,
  footer,
  labelledBy,
}: {
  title: React.ReactNode
  icon?: LucideIcon
  description?: React.ReactNode
  onClose?: () => void
  closeDisabled?: boolean
  children: React.ReactNode
  footer?: React.ReactNode
  labelledBy?: string
}) {
  return (
    <div
      className="dashboard-modal-card animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && <DashboardIconTile icon={icon} tone="brand" />}
          <div className="min-w-0">
            <h2 id={labelledBy} className="text-base font-semibold leading-6 text-dash-ink">
              {title}
            </h2>
            {description && <p className="text-[13px] leading-5 text-dash-muted">{description}</p>}
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close"
            className="-mr-1 rounded-lg p-1.5 text-dash-dim transition-colors hover:bg-dash-hover hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      <div className="px-5 pb-5 pt-4">{children}</div>
      {footer && (
        <div className="flex flex-col-reverse gap-2 border-t border-dash-border px-5 py-4 sm:flex-row sm:justify-end">
          {footer}
        </div>
      )}
    </div>
  )
}
