'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, FileText, Lock } from 'lucide-react'
import { adminAPI } from '@/lib/api/admin'
import { previousMonth, recentMonths } from '@/lib/enterprise/admin'
import {
  formatCents,
  formatCount,
  monthLabel,
  statementStatusLabel,
  type EnterpriseStatementRow,
  type StatementStatus,
} from '@/lib/enterprise/model'
import { Button } from '@/components/ui/button'
import {
  AdminFilterBar,
  AdminFilterField,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminTable,
  AdminTableWrap,
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardEmpty,
  DashboardPill,
  InfoHint,
} from '@/components/admin/admin-ui'

const ALL_MONTHS = 'all'
const STATUS_OPTIONS: { value: StatementStatus; label: string }[] = [
  { value: 'final', label: 'Ready to invoice' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'void', label: 'Void' },
]

const PANEL_HINT =
  'Statements close automatically at 00:20 UTC on the 1st for last month. Invoice from these numbers. Close month recomputes a month but never changes one marked invoiced, paid or void.'

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export function EnterpriseStatementsPanel() {
  const months = recentMonths(13)
  const [month, setMonth] = useState<string>(previousMonth())
  const [rows, setRows] = useState<EnterpriseStatementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await adminAPI.getEnterpriseStatements(month === ALL_MONTHS ? undefined : { month }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Enterprise statements')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    load()
  }, [load])

  const closeMonth = async () => {
    if (month === ALL_MONTHS) return
    try {
      setBusy(true)
      setError('')
      setNotice('')
      const result = await adminAPI.closeEnterpriseMonth(month)
      const total = result.closed.reduce((sum, item) => sum + item.total_cents, 0)
      setNotice(
        `${monthLabel(result.month)}: ${result.closed.length} closed, total ${formatCents(total)}.` +
          (result.skipped.length ? ` ${result.skipped.length} left as they were (already invoiced, paid or void).` : '')
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close the month')
    } finally {
      setBusy(false)
    }
  }

  const exportCsv = async () => {
    try {
      setBusy(true)
      setError('')
      const blob = await adminAPI.exportEnterpriseStatements(month === ALL_MONTHS ? undefined : month)
      downloadBlob(blob, `enterprise-statements-${month}.csv`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async (row: EnterpriseStatementRow, status: StatementStatus) => {
    if (status === row.status) return
    try {
      setBusy(true)
      setError('')
      setNotice('')
      await adminAPI.setEnterpriseStatementStatus(row.account_user_id, row.month, status)
      setNotice(`${row.email || `Account ${row.account_user_id}`}, ${monthLabel(row.month)}: marked ${statementStatusLabel(status).label.toLowerCase()}.`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update the statement')
    } finally {
      setBusy(false)
    }
  }

  const total = rows.filter((r) => r.status !== 'void').reduce((sum, r) => sum + r.total_cents, 0)

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Enterprise statements"
        icon={FileText}
        actions={
          <span className="inline-flex items-center gap-2">
            {rows.length > 0 && <span className="dashboard-meta-pill tabular-nums">{formatCents(total)}</span>}
            <InfoHint text={PANEL_HINT} />
          </span>
        }
      />
      <AdminPanelBody className="space-y-4">
        {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
        {notice && <DashboardAlert variant="success">{notice}</DashboardAlert>}
        <AdminFilterBar>
          <AdminFilterField label="Month">
            <select
              className="dashboard-select h-9"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              disabled={busy}
            >
              <option value={ALL_MONTHS}>All months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </AdminFilterField>
          <div className="flex flex-wrap items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={closeMonth}
              disabled={busy || month === ALL_MONTHS || month === months[0]}
              title={month === months[0] ? 'A month can only be closed after it ends' : undefined}
            >
              <Lock className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              Close month
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5" onClick={exportCsv} disabled={busy}>
              <Download className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              CSV
            </Button>
          </div>
        </AdminFilterBar>
      </AdminPanelBody>
      {rows.length === 0 && !loading ? (
        <DashboardEmpty
          icon={FileText}
          title="No statements"
          description="Statements appear here once a month with Enterprise billing has closed."
        />
      ) : (
        <AdminPanelBody noPadding>
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Month</th>
                  <th>Tier</th>
                  <th className="dashboard-num">Users</th>
                  <th className="dashboard-num">Calls</th>
                  <th className="dashboard-num">Photos</th>
                  <th className="dashboard-num">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className={loading ? 'opacity-60 transition-opacity' : undefined}>
                {rows.map((row) => {
                  const status = statementStatusLabel(row.status)
                  return (
                    <tr key={`${row.account_user_id}-${row.month}`}>
                      <td>
                        <Link
                          href={`/admin/users/${row.account_user_id}`}
                          className="font-medium text-dash-ink hover:text-dash-teal-strong hover:underline"
                        >
                          {row.email || `Account ${row.account_user_id}`}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-dash-muted">{monthLabel(row.month)}</td>
                      <td className="text-dash-body">{row.tier_label || '—'}</td>
                      <td className="dashboard-num">{formatCount(row.active_users)}</td>
                      <td className="dashboard-num">{formatCount(row.calls)}</td>
                      <td className="dashboard-num">{formatCount(row.photos)}</td>
                      <td className="dashboard-num whitespace-nowrap font-medium">
                        <span title={`Users ${formatCents(row.user_fee_cents)}, calls ${formatCents(row.call_fee_cents)}, photos ${formatCents(row.photo_fee_cents)}`}>
                          {formatCents(row.total_cents)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <DashboardPill tone={status.tone}>{status.label}</DashboardPill>
                          <select
                            aria-label="Change status"
                            className="dashboard-select h-8 text-xs"
                            value={row.status}
                            onChange={(event) => changeStatus(row, event.target.value as StatementStatus)}
                            disabled={busy}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        </AdminPanelBody>
      )}
    </AdminPanel>
  )
}
