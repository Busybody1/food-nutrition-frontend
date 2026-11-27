'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BadgeDollarSign,
  Building2,
  Camera,
  FileText,
  Fingerprint,
  Gauge,
  ListChecks,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useEnterprise } from '@/contexts/EnterpriseContext'
import { Button } from '@/components/ui/button'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'
import {
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardEmpty,
  DashboardPage,
  DashboardPageHeader,
  DashboardPageSkeleton,
  DashboardPanel,
  DashboardPanelBody,
  DashboardPanelHeader,
  DashboardPill,
  DashboardProgress,
  DashboardStatCard,
  InfoHint,
} from '@/components/dashboard/dashboard-shell'
import {
  billLines,
  endUserCodeSample,
  endUserErrorRows,
  endUserHeaderRules,
  formatCents,
  formatCount,
  headerCoverageText,
  modeText,
  monthLabel,
  nextTierText,
  overageLines,
  savedRecordRules,
  statementStatusLabel,
  tierTableRows,
  usageCards,
  type EnterpriseStatementRow,
} from '@/lib/enterprise/model'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

const CARD_ICONS: Record<string, LucideIcon> = {
  users: Users,
  calls: Gauge,
  photos: Camera,
  bill: BadgeDollarSign,
}

const PAGE_INFO =
  'Enterprise is billed each calendar month (UTC) on monthly users, calls and photos. Numbers here update every few minutes. The final statement is made on the 1st.'

export default function EnterprisePage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { view, loading, failed, refresh } = useEnterprise()
  const [refreshing, setRefreshing] = useState(false)
  const [statements, setStatements] = useState<EnterpriseStatementRow[]>([])
  const [statementsError, setStatementsError] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login')
  }, [authLoading, isAuthenticated, router])

  const loadStatements = useCallback(async () => {
    try {
      const { api } = await import('@/lib/api/client')
      setStatements(await api.enterprise.statements())
      setStatementsError(false)
    } catch {
      setStatementsError(true)
    }
  }, [])

  useEffect(() => {
    if (!view.enabled) return
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    void loadStatements()
  }, [view.enabled, loadStatements])

  const reload = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refresh(), loadStatements()])
    } finally {
      setRefreshing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardPage>
        <DashboardPageSkeleton kpis={4} label="Loading Enterprise usage" />
      </DashboardPage>
    )
  }

  const refreshButton = (
    <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={reload} disabled={refreshing}>
      <RefreshCw
        className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
        strokeWidth={DASHBOARD_ICON_STROKE}
        aria-hidden
      />
      Refresh
    </Button>
  )

  if (!view.enabled) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Enterprise" meta={<InfoHint text={PAGE_INFO} />}>
          {refreshButton}
        </DashboardPageHeader>
        {failed && <DashboardAlert variant="error">Enterprise usage could not be loaded. Try Refresh.</DashboardAlert>}
        <DashboardPanel>
          <DashboardEmpty
            icon={Building2}
            title="Enterprise is not on this account"
            description="Enterprise is priced by monthly users, from $150 a month, with photo scans included."
            action={
              <Button asChild size="sm" className="h-9">
                <Link href="/pricing">See Enterprise pricing</Link>
              </Button>
            }
          />
        </DashboardPanel>
      </DashboardPage>
    )
  }

  const month = view.month
  const header = view.end_user_header
  const coverage = month ? headerCoverageText(month.header, header) : null
  const nextTier = month ? nextTierText(month) : null
  const searchUrl = `${API_BASE_URL}/api/v1/search/foods`
  const shareWithId = month?.header.share_with_id ?? null
  const showWarnAlert = view.end_user_mode === 'warn' && shareWithId !== null && shareWithId < 1

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Enterprise"
        meta={
          <>
            {month && <DashboardPill tone="brand">{monthLabel(month.month)}</DashboardPill>}
            <InfoHint text={PAGE_INFO} />
          </>
        }
      >
        {refreshButton}
      </DashboardPageHeader>

      {failed && <DashboardAlert variant="error">Some numbers could not be loaded. Try Refresh.</DashboardAlert>}
      {!view.billing_enabled && (
        <DashboardAlert variant="warning">
          Billing has not started yet. The figures below show what the bill would be.
        </DashboardAlert>
      )}
      {showWarnAlert && (
        <DashboardAlert variant="warning">
          {coverage} Send {header} on every call before it becomes required.
        </DashboardAlert>
      )}

      {month && (
        <div className="dashboard-grid-kpi-4">
          {usageCards(month, view.pricing).map((card) => (
            <DashboardStatCard
              key={card.key}
              label={card.label}
              value={<span className="tabular-nums">{card.value}</span>}
              hint={card.hint}
              icon={CARD_ICONS[card.key] ?? Gauge}
              accent="brand"
              footer={
                card.percent === null ? undefined : (
                  <DashboardProgress className="h-2" value={card.percent} max={100} />
                )
              }
            />
          ))}
        </div>
      )}

      {month && (
        <div className="dashboard-grid-halves">
          <DashboardPanel>
            <DashboardPanelHeader
              title="Bill so far"
              icon={ReceiptText}
              actions={<InfoHint text="More users or calls than your tier moves the month up a tier. Nothing stops at month end." />}
            />
            <DashboardPanelBody className="space-y-4">
              <dl className="divide-y divide-dash-border">
                {billLines(month.statement).map((line) => (
                  <div key={line.label} className="flex items-center justify-between gap-4 py-2 text-[13px]">
                    <dt className={line.label === 'Total' ? 'font-semibold text-dash-ink' : 'text-dash-body'}>
                      {line.label}
                    </dt>
                    <dd className={line.label === 'Total' ? 'font-semibold tabular-nums text-dash-ink' : 'tabular-nums text-dash-ink'}>
                      {line.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {nextTier && <p className="text-[13px] text-dash-muted">{nextTier}</p>}
              <p className="text-xs text-dash-muted">
                {month.period_start} to {month.period_end}, UTC.
              </p>
            </DashboardPanelBody>
          </DashboardPanel>

          <DashboardPanel>
            <DashboardPanelHeader title="Your pricing" icon={BadgeDollarSign} />
            <DashboardPanelBody flush>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Monthly users</th>
                      <th>Price</th>
                      <th className="hidden sm:table-cell">Calls included</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierTableRows(view.pricing).map((row) => (
                      <tr key={row.users}>
                        <td className="text-dash-ink">{row.users}</td>
                        <td className="whitespace-nowrap tabular-nums text-dash-ink">{row.price}</td>
                        <td className="hidden text-dash-body sm:table-cell">{row.calls}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardPanelBody>
            <DashboardPanelBody>
              <ul className="list-disc space-y-1 pl-5 text-[13px] leading-5 text-dash-body">
                {overageLines(view.pricing).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </DashboardPanelBody>
          </DashboardPanel>
        </div>
      )}

      <DashboardPanel>
        <DashboardPanelHeader
          title={`Send ${header}`}
          icon={Fingerprint}
          actions={<DashboardPill tone={view.end_user_mode === 'required' ? 'green' : 'orange'}>{view.end_user_mode === 'required' ? 'Required' : view.end_user_mode === 'warn' ? 'Warn only' : 'Off'}</DashboardPill>}
        />
        <DashboardPanelBody className="space-y-4">
          <p className="max-w-3xl text-[13px] leading-5 text-dash-body">{modeText(view.end_user_mode, header)}</p>
          {coverage && <p className="text-[13px] text-dash-muted">{coverage}</p>}
          <ul className="list-disc space-y-1 pl-5 text-[13px] leading-5 text-dash-body">
            {endUserHeaderRules(header).map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <DocsCodeBlock title="cURL" code={endUserCodeSample(searchUrl, header)} copyable className="mb-0" />
        </DashboardPanelBody>
        <DashboardPanelBody flush>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Code</th>
                  <th className="hidden sm:table-cell">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {endUserErrorRows().map((row) => (
                  <tr key={row.code}>
                    <td className="tabular-nums font-medium text-dash-ink">{row.status}</td>
                    <td className="text-dash-body">
                      <span className="break-all font-mono text-[12px]">{row.code}</span>
                      <span className="mt-0.5 block text-[12px] text-dash-muted sm:hidden">{row.meaning}</span>
                    </td>
                    <td className="hidden text-dash-body sm:table-cell">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardPanelBody>
      </DashboardPanel>

      {view.end_user_records_allowed && (
        <DashboardPanel>
          <DashboardPanelHeader
            title="Saved user records"
            icon={ShieldCheck}
            actions={<InfoHint text="Your plan allows keeping logged meals and saved foods past the 30-day cache limit, under these rules from the Commercial License." />}
          />
          <DashboardPanelBody>
            <ul className="list-disc space-y-2 pl-5 text-[13px] leading-5 text-dash-body">
              {savedRecordRules().map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </DashboardPanelBody>
        </DashboardPanel>
      )}

      <DashboardPanel>
        <DashboardPanelHeader title="Past statements" icon={FileText} />
        {statementsError ? (
          <DashboardPanelBody>
            <DashboardAlert variant="error">Statements could not be loaded. Try Refresh.</DashboardAlert>
          </DashboardPanelBody>
        ) : statements.length === 0 ? (
          <DashboardEmpty
            icon={ListChecks}
            title="No statements yet"
            description="Your first statement is made on the 1st of next month."
          />
        ) : (
          <DashboardPanelBody flush>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="hidden sm:table-cell">Tier</th>
                    <th className="dashboard-num">Users</th>
                    <th className="dashboard-num hidden md:table-cell">Calls</th>
                    <th className="dashboard-num hidden md:table-cell">Photos</th>
                    <th className="dashboard-num">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((row) => {
                    const status = statementStatusLabel(row.status)
                    return (
                      <tr key={row.month}>
                        <td className="whitespace-nowrap text-dash-ink">{monthLabel(row.month)}</td>
                        <td className="hidden text-dash-body sm:table-cell">{row.tier_label || '—'}</td>
                        <td className="dashboard-num">{formatCount(row.active_users)}</td>
                        <td className="dashboard-num hidden md:table-cell">{formatCount(row.calls)}</td>
                        <td className="dashboard-num hidden md:table-cell">{formatCount(row.photos)}</td>
                        <td className="dashboard-num font-medium">{formatCents(row.total_cents)}</td>
                        <td>
                          <DashboardPill tone={status.tone === 'orange' ? 'neutral' : status.tone}>
                            {row.status === 'final' ? 'Final' : status.label}
                          </DashboardPill>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </DashboardPanelBody>
        )}
      </DashboardPanel>
    </DashboardPage>
  )
}
