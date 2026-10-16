'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  adminAPI,
  SecurityHoldRow,
  SecurityIncident,
  SystemSettingRow,
} from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ShieldAlert,
  Lock,
  Unlock,
  Activity,
  ScanSearch,
  Eye,
  Settings2,
  UserRound,
} from 'lucide-react'
import {
  AdminPage,
  AdminPageHeader,
  AdminStatGrid,
  DashboardStatCard,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminTableWrap,
  AdminTable,
  AdminRefreshButton,
  AdminDetailGrid,
  DASHBOARD_ICON_STROKE,
  DashboardIconTile,
  DashboardLoading,
  DashboardEmpty,
  DashboardAlert,
  DashboardPill,
} from '@/components/admin/admin-ui'

const DETECTION_KEY = 'anomaly_detection_enabled'
const AUTOBLOCK_KEY = 'anomaly_autoblock_enabled'

function settingIsTrue(settings: SystemSettingRow[], key: string): boolean {
  return settings.find((s) => s.setting_key === key)?.setting_value === 'true'
}

function KindBadge({ kind }: { kind: string }) {
  if (kind === 'breadth_foods') {
    return <DashboardPill tone="rose">Scrape breadth</DashboardPill>
  }
  if (kind === 'volume_hourly' || kind === 'volume_daily') {
    return (
      <DashboardPill tone="orange">
        {kind === 'volume_hourly' ? 'Volume · hourly' : 'Volume · daily'}
      </DashboardPill>
    )
  }
  if (kind === 'manual') return <DashboardPill tone="neutral">Manual</DashboardPill>
  return <DashboardPill tone="outline">{kind}</DashboardPill>
}

function ActionBadge({ action }: { action: string }) {
  return action === 'held' ? (
    <DashboardPill tone="rose">Held (423)</DashboardPill>
  ) : (
    <DashboardPill tone="orange">Alert only</DashboardPill>
  )
}

function ResolvedBadge({ resolved }: { resolved: boolean }) {
  return resolved ? (
    <DashboardPill tone="neutral">Resolved</DashboardPill>
  ) : (
    <DashboardPill tone="orange">Open</DashboardPill>
  )
}

function UserAvatar() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-pill text-dash-body"
      aria-hidden
    >
      <UserRound className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
    </span>
  )
}

export default function AdminSecurityPage() {
  const [holds, setHolds] = useState<SecurityHoldRow[]>([])
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [settings, setSettings] = useState<SystemSettingRow[]>([])
  const [onlyUnresolved, setOnlyUnresolved] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [detail, setDetail] = useState<SecurityIncident | null>(null)
  const [holdDialogOpen, setHoldDialogOpen] = useState(false)
  const [holdUserId, setHoldUserId] = useState('')
  const [holdMinutes, setHoldMinutes] = useState('45')
  const [holdReason, setHoldReason] = useState('Manual hold by admin')
  const [holdSubmitting, setHoldSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [holdsRes, incidentsRes, settingsRes] = await Promise.all([
        adminAPI.getSecurityHolds(),
        adminAPI.getSecurityIncidents({ resolved: onlyUnresolved ? false : undefined, limit: 100 }),
        adminAPI.getSystemSettings(),
      ])
      setHolds(holdsRes.holds)
      setIncidents(incidentsRes.incidents)
      setSettings(settingsRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security data')
    } finally {
      setLoading(false)
    }
  }, [onlyUnresolved])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    load()
  }, [load])

  const detectionOn = settingIsTrue(settings, DETECTION_KEY)
  const autoblockOn = settingIsTrue(settings, AUTOBLOCK_KEY)

  const toggleSetting = async (key: string, value: boolean) => {
    setNotice('')
    setError('')
    try {
      await adminAPI.updateSystemSetting(key, value ? 'true' : 'false')
      setSettings((prev) =>
        prev.map((s) => (s.setting_key === key ? { ...s, setting_value: value ? 'true' : 'false' } : s))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
    }
  }

  const releaseHold = async (userId: number, label?: string) => {
    setNotice('')
    setError('')
    try {
      await adminAPI.releaseSecurityHold(userId)
      setNotice(`Released hold on ${label || `user ${userId}`}.`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release hold')
    }
  }

  const submitHold = async () => {
    const uid = Number(holdUserId)
    if (!Number.isInteger(uid) || uid <= 0) {
      setError('Enter a valid numeric user ID to hold.')
      return
    }
    setHoldSubmitting(true)
    setError('')
    setNotice('')
    try {
      await adminAPI.placeSecurityHold(uid, {
        minutes: Math.max(1, Number(holdMinutes) || 45),
        reason: holdReason.trim() || 'Manual hold by admin',
      })
      setNotice(`Placed a hold on user ${uid}.`)
      setHoldDialogOpen(false)
      setHoldUserId('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place hold')
    } finally {
      setHoldSubmitting(false)
    }
  }

  const unresolvedCount = incidents.filter((i) => !i.resolved).length

  return (
    <AdminPage>
      <AdminPageHeader
        title="Security"
        description="Usage-anomaly incidents and temporary account holds for suspected scraping / abuse."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setHoldDialogOpen(true)}
            >
              <Lock className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              Hold a user
            </Button>
            <AdminRefreshButton onClick={load} loading={loading} />
          </>
        }
      />

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {notice && <DashboardAlert variant="success">{notice}</DashboardAlert>}

      <AdminStatGrid>
        <DashboardStatCard label="Active holds" value={holds.length} icon={Lock} accent="orange" />
        <DashboardStatCard
          label={onlyUnresolved ? 'Open incidents' : 'Incidents shown'}
          value={onlyUnresolved ? unresolvedCount : incidents.length}
          icon={ShieldAlert}
          accent="rose"
        />
        <DashboardStatCard
          label="Auto-block"
          value={autoblockOn ? 'Armed' : 'Shadow'}
          icon={Activity}
          accent={autoblockOn ? 'indigo' : 'orange'}
        />
        <DashboardStatCard
          label="Detection"
          value={detectionOn ? 'On' : 'Off'}
          icon={ScanSearch}
          accent="green"
        />
      </AdminStatGrid>

      <AdminPanel
        className={autoblockOn ? undefined : 'border-dash-warning/30 bg-dash-warning-soft/40'}
      >
        <AdminPanelHeader title="Detection status" icon={Settings2} />
        <AdminPanelBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-[13px] leading-5 text-dash-muted">
            {autoblockOn
              ? 'Tripwires auto-place a temporary, auto-expiring hold (HTTP 423) and alert Discord. Holds appear below for review.'
              : 'Shadow mode: tripwires alert Discord but do not block. Calibrate thresholds on the Settings page, then arm auto-block once the signals look right.'}
          </p>
          <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:w-[600px]">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-dash-border bg-white px-4 py-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[13px] font-semibold text-dash-ink">Anomaly detection</p>
                <DashboardPill tone={detectionOn ? 'green' : 'outline'}>
                  {detectionOn ? 'On' : 'Off'}
                </DashboardPill>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-[13px]">
                <Switch
                  checked={detectionOn}
                  onCheckedChange={(v) => toggleSetting(DETECTION_KEY, v)}
                />
                <span className="text-dash-muted">Detect</span>
              </label>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-dash-border bg-white px-4 py-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[13px] font-semibold text-dash-ink">Auto-block</p>
                <DashboardPill tone={autoblockOn ? 'rose' : 'orange'}>
                  {autoblockOn ? 'Armed' : 'Shadow (alert only)'}
                </DashboardPill>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-[13px]">
                <Switch
                  checked={autoblockOn}
                  onCheckedChange={(v) => toggleSetting(AUTOBLOCK_KEY, v)}
                />
                <span className="text-dash-muted">Auto-block</span>
              </label>
            </div>
          </div>
        </AdminPanelBody>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader title={`Active holds (${holds.length})`} icon={Lock} />
        {loading && holds.length === 0 ? (
          <DashboardLoading message="Loading holds…" />
        ) : holds.length === 0 ? (
          <DashboardEmpty
            icon={Unlock}
            title="No accounts on hold"
            description="Held accounts (auto or manual) appear here until they expire or you release them."
          />
        ) : (
          <AdminPanelBody noPadding>
            <AdminTableWrap>
              <AdminTable>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Reason</th>
                    <th className="dashboard-num">Holds</th>
                    <th>Until</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holds.map((h) => (
                    <tr key={h.id}>
                      <td>
                        <div className="flex min-w-0 items-center gap-3">
                          <UserAvatar />
                          <div className="min-w-0">
                            <div className="max-w-[200px] truncate font-medium text-dash-ink">
                              {h.email || `User ${h.id}`}
                            </div>
                            <div className="text-xs tabular-nums text-dash-muted">ID {h.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[280px] text-xs text-dash-muted">
                        {h.security_hold_reason || '—'}
                      </td>
                      <td className="dashboard-num">{h.security_hold_count ?? 1}</td>
                      <td className="whitespace-nowrap text-xs tabular-nums text-dash-muted">
                        {new Date(h.security_hold_until).toLocaleString()}
                      </td>
                      <td className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => releaseHold(h.id, h.email)}
                        >
                          <Unlock className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                          Release
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTableWrap>
          </AdminPanelBody>
        )}
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          title="Incidents"
          icon={ShieldAlert}
          actions={
            <label className="flex items-center gap-2 text-xs text-dash-muted">
              <Switch checked={onlyUnresolved} onCheckedChange={setOnlyUnresolved} />
              Unresolved only
            </label>
          }
        />
        {loading && incidents.length === 0 ? (
          <DashboardLoading message="Loading incidents…" />
        ) : incidents.length === 0 ? (
          <DashboardEmpty
            icon={ShieldAlert}
            title="No incidents"
            description={
              onlyUnresolved
                ? 'No open incidents. Toggle off "Unresolved only" to see resolved history.'
                : 'Anomaly tripwires will record incidents here.'
            }
          />
        ) : (
          <AdminPanelBody noPadding>
            <AdminTableWrap>
              <AdminTable>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Signal</th>
                    <th>Detail</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => {
                    const heldOpen = inc.action_taken === 'held' && !inc.resolved
                    return (
                      <tr key={inc.id}>
                        <td className="whitespace-nowrap text-xs tabular-nums text-dash-muted">
                          {new Date(inc.created_at).toLocaleString()}
                        </td>
                        <td>
                          <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar />
                            <div className="min-w-0">
                              <div className="max-w-[160px] truncate font-medium text-dash-ink">
                                {inc.email || (inc.user_id ? `User ${inc.user_id}` : '—')}
                              </div>
                              {inc.ip_address && (
                                <div className="font-mono text-xs text-dash-muted">{inc.ip_address}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <KindBadge kind={inc.kind} />
                        </td>
                        <td className="max-w-[260px] text-xs text-dash-muted">
                          {(inc.detail?.reasons && inc.detail.reasons[0]) ||
                            inc.detail?.reason ||
                            '—'}
                        </td>
                        <td>
                          <ActionBadge action={inc.action_taken} />
                        </td>
                        <td>
                          <ResolvedBadge resolved={inc.resolved} />
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setDetail(inc)}
                              aria-label={`View incident #${inc.id}`}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                            </Button>
                            {heldOpen && inc.user_id && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => releaseHold(inc.user_id!, inc.email)}
                              >
                                Release
                              </Button>
                            )}
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

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <DashboardIconTile icon={ShieldAlert} tone="rose" />
              <DialogTitle>Incident #{detail?.id}</DialogTitle>
            </div>
          </DialogHeader>
          {detail && (
            <div className="space-y-5 text-[13px]">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={detail.kind} />
                <ActionBadge action={detail.action_taken} />
                <ResolvedBadge resolved={detail.resolved} />
              </div>

              <div>
                <p className="dashboard-field-label">Signals</p>
                <ul className="space-y-1 rounded-xl border border-dash-border bg-dash-hover px-3 py-2.5">
                  {(detail.detail?.reasons || (detail.detail?.reason ? [detail.detail.reason] : [])).map(
                    (r, i) => (
                      <li key={i} className="text-dash-ink">• {String(r)}</li>
                    )
                  )}
                </ul>
              </div>

              <AdminDetailGrid
                items={[
                  { label: 'User', value: detail.email || `ID ${detail.user_id ?? '—'}` },
                  { label: 'When', value: new Date(detail.created_at).toLocaleString() },
                  {
                    label: 'Requests / hr',
                    value: <span className="tabular-nums">{detail.requests_in_window ?? '—'}</span>,
                  },
                  {
                    label: 'Distinct foods / hr',
                    value: <span className="tabular-nums">{detail.distinct_foods ?? '—'}</span>,
                  },
                  { label: 'IP', value: detail.ip_address || '—', mono: true },
                  { label: 'Last path', value: detail.detail?.path || '—', mono: true },
                ]}
              />

              {detail.user_agent && (
                <div>
                  <p className="dashboard-field-label">User agent</p>
                  <p className="dashboard-code-block block">{detail.user_agent}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {detail?.action_taken === 'held' && !detail?.resolved && detail?.user_id && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => {
                  releaseHold(detail.user_id!, detail.email)
                  setDetail(null)
                }}
              >
                <Unlock className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                Release hold
              </Button>
            )}
            <Button size="sm" className="h-9" onClick={() => setDetail(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={holdDialogOpen} onOpenChange={(open) => !open && setHoldDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <DashboardIconTile icon={Lock} tone="orange" />
              <DialogTitle>Place a security hold</DialogTitle>
            </div>
            <DialogDescription>
              Temporarily blocks the user&apos;s API traffic (HTTP 423). The hold auto-expires after
              the set minutes and can be released any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="dashboard-field-label">User ID</label>
              <Input
                inputMode="numeric"
                placeholder="e.g. 128"
                value={holdUserId}
                onChange={(e) => setHoldUserId(e.target.value)}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Duration (minutes)</label>
              <Input
                inputMode="numeric"
                value={holdMinutes}
                onChange={(e) => setHoldMinutes(e.target.value)}
                className="tabular-nums"
              />
            </div>
            <div>
              <label className="dashboard-field-label">Reason</label>
              <Input value={holdReason} onChange={(e) => setHoldReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setHoldDialogOpen(false)}
              disabled={holdSubmitting}
            >
              Cancel
            </Button>
            <Button size="sm" className="h-9" onClick={submitHold} disabled={holdSubmitting}>
              {holdSubmitting ? 'Placing…' : 'Place hold'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
