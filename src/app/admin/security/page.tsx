'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  adminAPI,
  SecurityHoldRow,
  SecurityIncident,
  SystemSettingRow,
} from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
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
  DashboardLoading,
  DashboardEmpty,
  DashboardAlert,
} from '@/components/admin/admin-ui'

const DETECTION_KEY = 'anomaly_detection_enabled'
const AUTOBLOCK_KEY = 'anomaly_autoblock_enabled'

function settingIsTrue(settings: SystemSettingRow[], key: string): boolean {
  return settings.find((s) => s.setting_key === key)?.setting_value === 'true'
}

function KindBadge({ kind }: { kind: string }) {
  if (kind === 'breadth_foods') {
    return <Badge variant="destructive">Scrape breadth</Badge>
  }
  if (kind === 'volume_hourly' || kind === 'volume_daily') {
    return <Badge variant="warning">{kind === 'volume_hourly' ? 'Volume · hourly' : 'Volume · daily'}</Badge>
  }
  if (kind === 'manual') return <Badge variant="secondary">Manual</Badge>
  return <Badge variant="outline">{kind}</Badge>
}

function ActionBadge({ action }: { action: string }) {
  return action === 'held' ? (
    <Badge variant="destructive">Held (423)</Badge>
  ) : (
    <Badge variant="warning">Alert only</Badge>
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setHoldDialogOpen(true)}>
              <Lock className="h-4 w-4 mr-1.5" aria-hidden />
              Hold a user
            </Button>
            <AdminRefreshButton onClick={load} loading={loading} />
          </div>
        }
      />

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {notice && <DashboardAlert variant="success">{notice}</DashboardAlert>}

      {/* Detection status / arming */}
      <AdminPanel
        className={autoblockOn ? '' : 'border-amber-200/80 bg-amber-50/40'}
      >
        <AdminPanelHeader title="Detection status" icon={Settings2} />
        <AdminPanelBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">Anomaly detection</span>
              <Badge variant={detectionOn ? 'success' : 'outline'}>
                {detectionOn ? 'On' : 'Off'}
              </Badge>
              <span className="text-ink-dim">·</span>
              <span className="font-semibold text-ink">Auto-block</span>
              <Badge variant={autoblockOn ? 'destructive' : 'warning'}>
                {autoblockOn ? 'Armed' : 'Shadow (alert only)'}
              </Badge>
            </div>
            <p className="text-sm text-ink-muted max-w-2xl">
              {autoblockOn
                ? 'Tripwires auto-place a temporary, auto-expiring hold (HTTP 423) and alert Discord. Holds appear below for review.'
                : 'Shadow mode: tripwires alert Discord but do not block. Calibrate thresholds on the Settings page, then arm auto-block once the signals look right.'}
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={detectionOn}
                onCheckedChange={(v) => toggleSetting(DETECTION_KEY, v)}
              />
              <span className="text-ink-muted">Detect</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={autoblockOn}
                onCheckedChange={(v) => toggleSetting(AUTOBLOCK_KEY, v)}
              />
              <span className="text-ink-muted">Auto-block</span>
            </label>
          </div>
        </AdminPanelBody>
      </AdminPanel>

      <AdminStatGrid>
        <DashboardStatCard label="Active holds" value={holds.length} icon={Lock} accent="orange" />
        <DashboardStatCard
          label={onlyUnresolved ? 'Open incidents' : 'Incidents shown'}
          value={onlyUnresolved ? unresolvedCount : incidents.length}
          icon={ShieldAlert}
          accent="brand"
        />
        <DashboardStatCard
          label="Auto-block"
          value={autoblockOn ? 'Armed' : 'Shadow'}
          icon={Activity}
          accent={autoblockOn ? 'purple' : 'orange'}
        />
        <DashboardStatCard
          label="Detection"
          value={detectionOn ? 'On' : 'Off'}
          icon={ScanSearch}
          accent="green"
        />
      </AdminStatGrid>

      {/* Active holds */}
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
                    <th>Holds</th>
                    <th>Until</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holds.map((h) => (
                    <tr key={h.id}>
                      <td>
                        <div className="font-medium text-ink">{h.email || `User ${h.id}`}</div>
                        <div className="text-xs text-ink-muted">ID {h.id}</div>
                      </td>
                      <td className="max-w-[280px] text-xs text-ink-muted">
                        {h.security_hold_reason || '—'}
                      </td>
                      <td className="tabular-nums">{h.security_hold_count ?? 1}</td>
                      <td className="whitespace-nowrap text-xs text-ink-muted">
                        {new Date(h.security_hold_until).toLocaleString()}
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => releaseHold(h.id, h.email)}
                        >
                          <Unlock className="h-4 w-4 mr-1.5" aria-hidden />
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

      {/* Incidents */}
      <AdminPanel>
        <AdminPanelHeader
          title="Incidents"
          icon={ShieldAlert}
          actions={
            <label className="flex items-center gap-2 text-xs text-ink-muted">
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => {
                    const heldOpen = inc.action_taken === 'held' && !inc.resolved
                    return (
                      <tr key={inc.id}>
                        <td className="whitespace-nowrap text-xs text-ink-muted">
                          {new Date(inc.created_at).toLocaleString()}
                        </td>
                        <td>
                          <div className="font-medium text-ink truncate max-w-[160px]">
                            {inc.email || (inc.user_id ? `User ${inc.user_id}` : '—')}
                          </div>
                          {inc.ip_address && (
                            <div className="text-xs text-ink-muted font-mono">{inc.ip_address}</div>
                          )}
                        </td>
                        <td>
                          <KindBadge kind={inc.kind} />
                        </td>
                        <td className="max-w-[260px] text-xs text-ink-muted">
                          {(inc.detail?.reasons && inc.detail.reasons[0]) ||
                            inc.detail?.reason ||
                            '—'}
                        </td>
                        <td>
                          <ActionBadge action={inc.action_taken} />
                        </td>
                        <td>
                          {inc.resolved ? (
                            <Badge variant="secondary">Resolved</Badge>
                          ) : (
                            <Badge variant="warning">Open</Badge>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setDetail(inc)}>
                              <Eye className="h-4 w-4" aria-hidden />
                            </Button>
                            {heldOpen && inc.user_id && (
                              <Button
                                variant="outline"
                                size="sm"
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

      {/* Incident detail */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Incident #{detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={detail.kind} />
                <ActionBadge action={detail.action_taken} />
                {detail.resolved ? (
                  <Badge variant="secondary">Resolved</Badge>
                ) : (
                  <Badge variant="warning">Open</Badge>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-dim mb-1">
                  Signals
                </p>
                <ul className="space-y-1">
                  {(detail.detail?.reasons || (detail.detail?.reason ? [detail.detail.reason] : [])).map(
                    (r, i) => (
                      <li key={i} className="text-ink">• {String(r)}</li>
                    )
                  )}
                </ul>
              </div>

              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-dim">User</dt>
                  <dd className="text-ink">{detail.email || `ID ${detail.user_id ?? '—'}`}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-dim">When</dt>
                  <dd className="text-ink">{new Date(detail.created_at).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-dim">Requests / hr</dt>
                  <dd className="text-ink tabular-nums">{detail.requests_in_window ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-dim">Distinct foods / hr</dt>
                  <dd className="text-ink tabular-nums">{detail.distinct_foods ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-dim">IP</dt>
                  <dd className="text-ink font-mono text-xs break-all">{detail.ip_address || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-dim">Last path</dt>
                  <dd className="text-ink font-mono text-xs break-all">{detail.detail?.path || '—'}</dd>
                </div>
              </dl>

              {detail.user_agent && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim mb-1">
                    User agent
                  </p>
                  <p className="text-ink font-mono text-xs break-all">{detail.user_agent}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {detail?.action_taken === 'held' && !detail?.resolved && detail?.user_id && (
              <Button
                variant="outline"
                onClick={() => {
                  releaseHold(detail.user_id!, detail.email)
                  setDetail(null)
                }}
              >
                <Unlock className="h-4 w-4 mr-1.5" aria-hidden />
                Release hold
              </Button>
            )}
            <Button onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual hold */}
      <Dialog open={holdDialogOpen} onOpenChange={(open) => !open && setHoldDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Place a security hold</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-ink-muted">
              Temporarily blocks the user&apos;s API traffic (HTTP 423). The hold auto-expires after
              the set minutes and can be released any time.
            </p>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-dim mb-1">
                User ID
              </label>
              <Input
                inputMode="numeric"
                placeholder="e.g. 128"
                value={holdUserId}
                onChange={(e) => setHoldUserId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-dim mb-1">
                Duration (minutes)
              </label>
              <Input
                inputMode="numeric"
                value={holdMinutes}
                onChange={(e) => setHoldMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-dim mb-1">
                Reason
              </label>
              <Input value={holdReason} onChange={(e) => setHoldReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHoldDialogOpen(false)} disabled={holdSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitHold} disabled={holdSubmitting}>
              {holdSubmitting ? 'Placing…' : 'Place hold'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
