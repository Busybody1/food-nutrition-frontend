'use client'

import { useCallback, useEffect, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { adminAPI, type CheckoutExperiment } from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import {
  AdminPage,
  AdminPageBody,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminRefreshButton,
  DashboardAlert,
  DashboardLoading,
  DashboardPill,
} from '@/components/admin/admin-ui'

const SETTINGS_UPDATE = 'admin:settings:update'

export default function AdminExperimentsPage() {
  const { hasPermission, isLoading: adminLoading } = useAdmin()
  const [experiments, setExperiments] = useState<CheckoutExperiment[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const canUpdate = !adminLoading && hasPermission(SETTINGS_UPDATE)
  const envLocked = experiments.some((experiment) => experiment.env_locked)

  const loadExperiments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await adminAPI.getCheckoutExperiments()
      setExperiments(payload.experiments)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load experiments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadExperiments()
  }, [loadExperiments])

  const toggleExperiment = async (experiment: CheckoutExperiment, enabled: boolean) => {
    if (!canUpdate || experiment.env_locked || savingId) return
    setSavingId(experiment.id)
    setError('')
    try {
      const updated = await adminAPI.setCheckoutExperiment(experiment.id, enabled)
      setExperiments((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update the experiment')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Experiments"
        description="Turn checkout experiments on or off. New checkouts pick up a change within a few seconds. Subscriptions already started in Stripe keep the trial they began with."
        actions={<AdminRefreshButton onClick={loadExperiments} loading={loading} />}
      />
      <AdminPageBody>
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
        {envLocked ? (
          <DashboardAlert variant="warning">
            Both experiments are forced off by the server setting TRIAL_CARD_5D_EXPERIMENT. These
            switches stay off until that setting is turned back on.
          </DashboardAlert>
        ) : null}
        {!adminLoading && !canUpdate ? (
          <p className="text-[13px] text-dash-muted">
            You can view experiments. Settings update permission is required to change them.
          </p>
        ) : null}
        {loading && experiments.length === 0 ? (
          <DashboardLoading message="Loading experiments…" />
        ) : (
          <div className="flex flex-col gap-4">
            {experiments.map((experiment) => (
              <ExperimentCard
                key={experiment.id}
                experiment={experiment}
                disabled={!canUpdate || experiment.env_locked || savingId !== null}
                saving={savingId === experiment.id}
                onToggle={(enabled) => toggleExperiment(experiment, enabled)}
              />
            ))}
          </div>
        )}
      </AdminPageBody>
    </AdminPage>
  )
}

function ExperimentCard({
  experiment,
  disabled,
  saving,
  onToggle,
}: {
  experiment: CheckoutExperiment
  disabled: boolean
  saving: boolean
  onToggle: (enabled: boolean) => void
}) {
  const status = experiment.env_locked ? 'Forced off' : saving ? 'Saving…' : experiment.enabled ? 'On' : 'Off'
  const tone = experiment.env_locked ? 'orange' : experiment.enabled ? 'green' : 'neutral'

  return (
    <AdminPanel>
      <AdminPanelHeader
        title={experiment.name}
        icon={FlaskConical}
        actions={<DashboardPill tone={tone}>{status}</DashboardPill>}
      />
      <AdminPanelBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-[13px] leading-5 text-dash-muted">{experiment.summary}</p>
          <p className="text-[13px] leading-5 text-dash-body">
            <span className="font-semibold text-dash-ink">When on: </span>
            {experiment.treatment}
          </p>
          <p className="text-[13px] leading-5 text-dash-body">
            <span className="font-semibold text-dash-ink">When off: </span>
            {experiment.control}
          </p>
        </div>
        <label className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-dash-border bg-white px-4 py-3 sm:min-w-44">
          <span className="text-[13px] font-medium text-dash-ink">{experiment.enabled ? 'On' : 'Off'}</span>
          <Switch
            checked={experiment.enabled}
            disabled={disabled}
            onCheckedChange={onToggle}
            aria-label={`${experiment.enabled ? 'Turn off' : 'Turn on'} ${experiment.name}`}
          />
        </label>
      </AdminPanelBody>
    </AdminPanel>
  )
}
