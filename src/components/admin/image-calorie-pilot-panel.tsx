'use client'

import { useCallback, useEffect, useState } from 'react'
import { Camera } from 'lucide-react'
import { adminAPI, type ImageCaloriePilotStatus } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  PILOT_REASON_MAX,
  failedTodayText,
  formatPilotTimestamp,
  initialPilotDraft,
  pilotCanSave,
  pilotDraftError,
  pilotNotes,
  pilotPill,
  pilotRequestBody,
  usagePercent,
  usageText,
  type PilotDraft,
} from '@/lib/admin/image-calorie-pilot'
import {
  AdminDetailGrid,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  DashboardAlert,
  DashboardPill,
  InfoHint,
  RateBar,
} from '@/components/admin/admin-ui'

const PILOT_HINT =
  'Opens POST /api/v1/vision/calories for this account only. 100 successful calls a month, 20 a day. No charge and no credits.'

function savedMessage(next: ImageCaloriePilotStatus): string {
  if (next.state === 'active') return 'Image-to-calorie pilot saved.'
  return 'Image-to-calorie pilot is off for this account.'
}

export function ImageCaloriePilotPanel({ userId, refreshKey = 0 }: { userId: number; refreshKey?: number }) {
  const [status, setStatus] = useState<ImageCaloriePilotStatus | null>(null)
  const [draft, setDraft] = useState<PilotDraft | null>(null)
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const applyStatus = useCallback((next: ImageCaloriePilotStatus) => {
    setStatus(next)
    setDraft(initialPilotDraft(next))
  }, [])

  const load = useCallback(async () => {
    try {
      const next = await adminAPI.getImageCaloriePilot(userId)
      applyStatus(next)
      setLoadError('')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load the image-to-calorie pilot')
    }
  }, [userId, applyStatus])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    load()
  }, [load, refreshKey])

  if (!status || !draft) {
    if (!loadError) return null
    return (
      <AdminPanel>
        <AdminPanelHeader title="Image-to-calorie pilot" icon={Camera} />
        <AdminPanelBody>
          <DashboardAlert variant="error">{loadError}</DashboardAlert>
        </AdminPanelBody>
      </AdminPanel>
    )
  }

  const pill = pilotPill(status.state)
  const notes = pilotNotes(status)
  const body = pilotRequestBody(status, draft)
  const draftError = body ? pilotDraftError(status, draft) : null
  const canSave = pilotCanSave(status, draft, busy)
  const showCounts = status.meter === 'pilot'
  const failed = failedTodayText(status.failed_today)

  const updateDraft = (patch: Partial<PilotDraft>) => {
    setSuccess('')
    setDraft((current) => (current ? { ...current, ...patch } : current))
  }

  const save = async () => {
    if (!body || !canSave) return
    try {
      setBusy(true)
      setError('')
      setSuccess('')
      const next = await adminAPI.setImageCaloriePilot(userId, body)
      applyStatus(next)
      setSuccess(savedMessage(next))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the image-to-calorie pilot')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setError('')
    setSuccess('')
    setDraft(initialPilotDraft(status))
  }

  const details = [
    ...(showCounts
      ? [
          {
            label: 'Used this month',
            value: (
              <span className="flex items-center gap-3">
                <span className="whitespace-nowrap tabular-nums">
                  {usageText(status.used_this_month, status.monthly_cap)}
                </span>
                <RateBar
                  value={usagePercent(status.used_this_month, status.monthly_cap)}
                  className="max-w-[220px] flex-1"
                />
              </span>
            ),
          },
          {
            label: 'Used today',
            value: (
              <span className="tabular-nums">
                {usageText(status.used_today, status.daily_cap)}
                {failed && <span className="ml-2 text-xs text-dash-muted">{failed}</span>}
              </span>
            ),
          },
        ]
      : []),
    ...(status.enabled && status.enabled_at
      ? [
          {
            label: 'Turned on by',
            value: `${status.enabled_by_email || 'Unknown admin'} on ${formatPilotTimestamp(status.enabled_at)}`,
          },
        ]
      : []),
    ...(!status.enabled && status.disabled_at
      ? [{ label: 'Turned off', value: formatPilotTimestamp(status.disabled_at) }]
      : []),
  ]

  return (
    <AdminPanel>
      <AdminPanelHeader
        title={
          <span className="inline-flex items-center gap-2">
            Image-to-calorie pilot
            <DashboardPill tone={pill.tone}>{pill.label}</DashboardPill>
          </span>
        }
        icon={Camera}
        actions={<InfoHint text={PILOT_HINT} />}
      />
      <AdminPanelBody className="space-y-5">
        {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
        {success && <DashboardAlert variant="success">{success}</DashboardAlert>}
        {notes.map((note) => (
          <DashboardAlert key={note} variant="warning">
            {note}
          </DashboardAlert>
        ))}

        <label className="flex items-center justify-between gap-3 rounded-xl border border-dash-border bg-white px-4 py-3">
          <span className="text-[13px] font-medium text-dash-ink">
            {draft.enabled ? 'On for this account' : 'Off for this account'}
          </span>
          <Switch
            checked={draft.enabled}
            disabled={busy}
            onCheckedChange={(next) => updateDraft({ enabled: next })}
            aria-label={draft.enabled ? 'Turn off the image-to-calorie pilot' : 'Turn on the image-to-calorie pilot'}
          />
        </label>

        {draft.enabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pilot-ends-on" className="dashboard-field-label">
                Ends on
              </label>
              <Input
                id="pilot-ends-on"
                type="date"
                min={status.today}
                max={status.max_expires_on}
                value={draft.expiresOn}
                onChange={(event) => updateDraft({ expiresOn: event.target.value })}
                disabled={busy}
                className="h-9"
              />
            </div>
            <div>
              <label htmlFor="pilot-reason" className="dashboard-field-label">
                Reason
              </label>
              <Input
                id="pilot-reason"
                type="text"
                required
                maxLength={PILOT_REASON_MAX}
                placeholder="Prospect name"
                value={draft.reason}
                onChange={(event) => updateDraft({ reason: event.target.value })}
                disabled={busy}
                className="h-9"
              />
            </div>
          </div>
        )}

        {details.length > 0 && <AdminDetailGrid items={details} />}

        {draftError && <p className="text-xs text-dash-negative">{draftError}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" className="h-9" disabled={!canSave} onClick={save}>
            {busy ? 'Saving...' : 'Save'}
          </Button>
          {body && (
            <Button type="button" variant="outline" size="sm" className="h-9" disabled={busy} onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </AdminPanelBody>
    </AdminPanel>
  )
}
