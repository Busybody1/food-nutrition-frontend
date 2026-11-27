'use client'

import { useCallback, useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { adminAPI, type AdminEnterpriseView } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  NOTES_MAX,
  NUMBER_FIELDS,
  enterpriseDraftChanged,
  enterpriseDraftError,
  enterpriseRequestBody,
  initialEnterpriseDraft,
  modeLabel,
  type AdminEndUserMode,
  type EnterpriseDraft,
} from '@/lib/enterprise/admin'
import {
  billLines,
  formatCount,
  headerCoverageText,
  monthLabel,
  nextTierText,
} from '@/lib/enterprise/model'
import {
  AdminDetailGrid,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminTable,
  AdminTableWrap,
  DashboardAlert,
  DashboardPill,
  DashboardSegmented,
  InfoHint,
  RateBar,
} from '@/components/admin/admin-ui'

const PANEL_HINT =
  'Bills this account by monthly users, calls and photos, reads X-End-User-Id, and uses the Enterprise photo allowance. Needs the account on the Custom plan and the ENTERPRISE_BILLING_ENABLED and END_USER_TRACKING_ENABLED config vars.'

const MODE_OPTIONS: { value: AdminEndUserMode; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'warn', label: 'Warn only' },
  { value: 'required', label: 'Required' },
]

const MODE_HINT =
  'Warn only: calls without X-End-User-Id still work and are counted. Required: they get 400. Use Warn only while the customer integrates.'

function percent(used: number | null, cap: number | null): number {
  if (used === null || !cap) return 0
  return Math.min(100, Math.max(0, (used / cap) * 100))
}

function usageLine(used: number | null, cap: number | null): string {
  if (used === null) return 'Not measured yet'
  return cap ? `${formatCount(used)} of ${formatCount(cap)}` : formatCount(used)
}

function shortTime(iso?: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString()
}

export function EnterprisePanel({ userId }: { userId: number }) {
  const [view, setView] = useState<AdminEnterpriseView | null>(null)
  const [draft, setDraft] = useState<EnterpriseDraft | null>(null)
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)

  const apply = useCallback((next: AdminEnterpriseView) => {
    setView(next)
    setDraft(initialEnterpriseDraft(next.config))
  }, [])

  const load = useCallback(async () => {
    try {
      apply(await adminAPI.getUserEnterprise(userId))
      setLoadError('')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load Enterprise billing')
    }
  }, [userId, apply])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    load()
  }, [load])

  if (!view || !draft) {
    if (!loadError) return null
    return (
      <AdminPanel>
        <AdminPanelHeader title="Enterprise billing" icon={Building2} />
        <AdminPanelBody>
          <DashboardAlert variant="error">{loadError}</DashboardAlert>
        </AdminPanelBody>
      </AdminPanel>
    )
  }

  const draftError = enterpriseDraftError(draft)
  const changed = enterpriseDraftChanged(view.config, draft)
  const body = enterpriseRequestBody(draft)
  const canSave = !busy && changed && body !== null && !(draft.isActive && !view.plan_is_enterprise)
  const month = view.month
  const coverage = view.coverage
  const pill = view.active
    ? { tone: 'green' as const, label: 'Active' }
    : view.config
      ? { tone: 'neutral' as const, label: view.config.is_active ? 'Not on Custom plan' : 'Off' }
      : { tone: 'neutral' as const, label: 'Not set up' }

  const updateDraft = (patch: Partial<EnterpriseDraft>) => {
    setSuccess('')
    setDraft((current) => (current ? { ...current, ...patch } : current))
  }

  const save = async () => {
    if (!body || !canSave) return
    try {
      setBusy(true)
      setError('')
      setSuccess('')
      apply(await adminAPI.setUserEnterprise(userId, body))
      setSuccess(body.is_active ? 'Enterprise billing saved.' : 'Enterprise billing is off for this account.')
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save Enterprise billing')
    } finally {
      setBusy(false)
    }
  }

  const cancel = () => {
    setError('')
    setSuccess('')
    setDraft(initialEnterpriseDraft(view.config))
    setEditing(false)
  }

  const lift = async () => {
    try {
      setBusy(true)
      setError('')
      await adminAPI.liftScrapeSlowdown(userId)
      setSuccess('Slow-down lifted.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lift the slow-down')
    } finally {
      setBusy(false)
    }
  }

  const flagNotes: string[] = []
  if (!view.flags.billing) flagNotes.push('ENTERPRISE_BILLING_ENABLED is off. Statements and the photo allowance are not running.')
  if (!view.flags.end_user_tracking) flagNotes.push('END_USER_TRACKING_ENABLED is off. X-End-User-Id is not read, so users are not counted.')
  if (!view.plan_is_enterprise) flagNotes.push(`This account is on ${view.plan_name || 'another plan'}. Move it to the Custom plan before turning Enterprise billing on.`)

  const headerLine = headerCoverageText(month?.header ?? { calls_with_id: 0, calls_missing_id: 0, calls_invalid_id: 0, share_with_id: null })
  const nextTier = month ? nextTierText(month) : null

  const monthItems = month
    ? [
        {
          label: 'Users',
          value: (
            <span className="flex items-center gap-3">
              <span className="whitespace-nowrap tabular-nums">{usageLine(month.users, month.statement.users_limit)}</span>
              {month.statement.users_limit ? (
                <RateBar value={percent(month.users, month.statement.users_limit)} className="max-w-[200px] flex-1" />
              ) : null}
            </span>
          ),
        },
        {
          label: 'Calls',
          value: (
            <span className="flex items-center gap-3">
              <span className="whitespace-nowrap tabular-nums">{usageLine(month.calls, month.statement.calls_included)}</span>
              <RateBar value={percent(month.calls, month.statement.calls_included)} className="max-w-[200px] flex-1" />
            </span>
          ),
        },
        {
          label: 'Photos',
          value: (
            <span className="tabular-nums">
              {usageLine(month.photos, month.statement.photos_included)}
              <span className="ml-2 text-xs text-dash-muted">safety limit {formatCount(month.photo_monthly_cap)}</span>
            </span>
          ),
        },
        {
          label: 'Bill so far',
          value: (
            <span className="flex flex-col gap-0.5 tabular-nums">
              {billLines(month.statement).map((line) => (
                <span key={line.label} className={line.label === 'Total' ? 'font-semibold' : 'text-xs text-dash-muted'}>
                  {line.label}: {line.value}
                </span>
              ))}
            </span>
          ),
        },
        { label: 'End-user IDs', value: headerLine ?? 'No calls recorded yet this month' },
        {
          label: 'Heavy end users',
          value: `${formatCount(month.heavy_end_users)} over 1,500 calls`,
        },
      ]
    : []

  const coverageItems = [
    { label: 'Foods this month', value: usageLine(coverage.distinct_month, coverage.month_limit) },
    {
      label: 'Foods in 12 months',
      value: coverage.distinct_12m === null
        ? 'Measured nightly once the scrape guard runs'
        : `${usageLine(coverage.distinct_12m, coverage.limit_12m)}${coverage.stats_day ? ` (as of ${coverage.stats_day})` : ''}`,
    },
  ]

  return (
    <AdminPanel>
      <AdminPanelHeader
        title={
          <span className="inline-flex items-center gap-2">
            Enterprise billing
            <DashboardPill tone={pill.tone}>{pill.label}</DashboardPill>
            {view.config && <DashboardPill tone="outline">{modeLabel(draft.mode)}</DashboardPill>}
          </span>
        }
        icon={Building2}
        actions={<InfoHint text={PANEL_HINT} />}
      />
      <AdminPanelBody className="space-y-5">
        {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
        {success && <DashboardAlert variant="success">{success}</DashboardAlert>}
        {flagNotes.map((note) => (
          <DashboardAlert key={note} variant="warning">
            {note}
          </DashboardAlert>
        ))}

        {view.slowdown && (
          <div className="flex flex-col gap-3 rounded-xl border border-dash-warning/30 bg-dash-warning-soft/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-[13px] text-dash-ink">
              <p className="font-medium">Slowed down until {shortTime(view.slowdown.until)}</p>
              {view.slowdown.reason && <p className="mt-0.5 text-xs text-dash-muted">{view.slowdown.reason}</p>}
            </div>
            <Button type="button" variant="outline" size="sm" className="h-8" disabled={busy} onClick={lift}>
              Lift
            </Button>
          </div>
        )}

        {month && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-dash-muted">
              {monthLabel(month.month)} so far, {month.statement.tier_label}
              {month.statement.tier_basis === 'calls' ? ', moved up on calls' : ''}
            </p>
            <AdminDetailGrid items={monthItems} />
            {nextTier && <p className="text-xs text-dash-muted">{nextTier}</p>}
          </div>
        )}

        {month && month.top_end_users.length > 0 && (
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <th>End user</th>
                  <th className="dashboard-num">Calls</th>
                  <th className="dashboard-num">Photos</th>
                  <th className="dashboard-num">Active days</th>
                </tr>
              </thead>
              <tbody>
                {month.top_end_users.map((u) => (
                  <tr key={u.end_user}>
                    <td className="font-mono text-xs">{u.end_user}</td>
                    <td className="dashboard-num">{formatCount(u.calls)}</td>
                    <td className="dashboard-num">{formatCount(u.photo_calls)}</td>
                    <td className="dashboard-num">{formatCount(u.active_days)}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        )}

        <AdminDetailGrid items={coverageItems} />

        {!editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" className="h-9" onClick={() => setEditing(true)}>
              {view.config ? 'Edit settings' : 'Set up Enterprise billing'}
            </Button>
          </div>
        ) : (
          <div className="space-y-5 border-t border-dash-border pt-5">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-dash-border bg-white px-4 py-3">
              <span className="text-[13px] font-medium text-dash-ink">
                {draft.isActive ? 'Enterprise billing on' : 'Enterprise billing off'}
              </span>
              <Switch
                checked={draft.isActive}
                disabled={busy}
                onCheckedChange={(next) => updateDraft({ isActive: next })}
                aria-label={draft.isActive ? 'Turn off Enterprise billing' : 'Turn on Enterprise billing'}
              />
            </label>

            <div className="space-y-2">
              <span className="dashboard-field-label inline-flex items-center gap-1.5">
                X-End-User-Id <InfoHint text={MODE_HINT} />
              </span>
              <DashboardSegmented
                value={draft.mode}
                options={MODE_OPTIONS}
                onChange={(mode) => updateDraft({ mode })}
                ariaLabel="End-user ID mode"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {NUMBER_FIELDS.map((field) => {
                const placeholder =
                  field.key in view.defaults
                    ? String(view.defaults[field.key as keyof typeof view.defaults])
                    : 'Default'
                return (
                  <div key={field.key}>
                    <label htmlFor={`ent-${field.key}`} className="dashboard-field-label inline-flex items-center gap-1.5">
                      {field.label} <InfoHint text={field.hint} />
                    </label>
                    <Input
                      id={`ent-${field.key}`}
                      inputMode="numeric"
                      placeholder={placeholder}
                      value={draft[field.key]}
                      onChange={(event) => updateDraft({ [field.key]: event.target.value } as Partial<EnterpriseDraft>)}
                      disabled={busy}
                      className="h-9"
                    />
                  </div>
                )
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ent-started-on" className="dashboard-field-label">
                  Billing starts on
                </label>
                <Input
                  id="ent-started-on"
                  type="date"
                  value={draft.startedOn}
                  onChange={(event) => updateDraft({ startedOn: event.target.value })}
                  disabled={busy}
                  className="h-9"
                />
              </div>
              <div>
                <label htmlFor="ent-notes" className="dashboard-field-label">
                  Notes
                </label>
                <Input
                  id="ent-notes"
                  maxLength={NOTES_MAX}
                  placeholder="Customer, contract, anything staff should know"
                  value={draft.notes}
                  onChange={(event) => updateDraft({ notes: event.target.value })}
                  disabled={busy}
                  className="h-9"
                />
              </div>
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-dash-border bg-white px-4 py-3">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-dash-ink">
                Saved user records allowed
                <InfoHint text="Lets the customer keep each user's logged meals and saved foods past the 30-day cache rule, under the End-User Records rules in the Commercial License. Shown to the customer on their dashboard." />
              </span>
              <Switch
                checked={draft.recordsAllowed}
                disabled={busy}
                onCheckedChange={(next) => updateDraft({ recordsAllowed: next })}
                aria-label="Saved user records allowed"
              />
            </label>

            {draftError && <p className="text-xs text-dash-negative">{draftError}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" className="h-9" disabled={!canSave} onClick={save}>
                {busy ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-9" disabled={busy} onClick={cancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </AdminPanelBody>
    </AdminPanel>
  )
}
