'use client'

import { useEffect, useState } from 'react'
import { adminAPI, AdminPlan } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Layers, Save, Power } from 'lucide-react'
import { formatCount } from '@/lib/utils/format'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  DashboardStatCard,
  AdminStatGrid,
  DashboardAlert,
  DashboardLoading,
  DashboardEmpty,
} from '@/components/admin/admin-ui'

function formatPlanPriceLabel(price?: number): string {
  if (price === undefined || price === null) return '$0'
  return `$${price}`
}

export default function AdminPlansPage() {
  const { hasPermission } = useAdmin()
  const canEdit = hasPermission('admin:settings:update')
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [selected, setSelected] = useState<AdminPlan | null>(null)
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [quota, setQuota] = useState('')
  const [rateLimit, setRateLimit] = useState('')
  const [stripePriceId, setStripePriceId] = useState('')
  const [stripeTestPriceId, setStripeTestPriceId] = useState('')
  const [stripeLivePriceId, setStripeLivePriceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadPlans = () => {
    setLoading(true)
    adminAPI
      .getPlans()
      .then((d) => setPlans(d.plans))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load plans'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const selectPlan = (p: AdminPlan) => {
    setSelected(p)
    setMonthlyPrice(String(p.monthly_price ?? ''))
    setQuota(String(p.monthly_quota ?? ''))
    setRateLimit(String(p.rate_limit_per_minute ?? ''))
    setStripePriceId(p.stripe_price_id ?? '')
    setStripeTestPriceId(p.stripe_test_price_id ?? '')
    setStripeLivePriceId(p.stripe_live_price_id ?? '')
    setSuccess('')
  }

  const save = async () => {
    if (!selected || !canEdit) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload: Parameters<typeof adminAPI.patchPlan>[1] = {
        is_active: selected.is_active,
      }
      if (monthlyPrice !== '') payload.monthly_price = Number(monthlyPrice)
      if (quota !== '') payload.monthly_quota = Number(quota)
      if (rateLimit !== '') payload.rate_limit_per_minute = Number(rateLimit)
      payload.stripe_price_id = stripePriceId.trim() || null
      payload.stripe_test_price_id = stripeTestPriceId.trim() || null
      payload.stripe_live_price_id = stripeLivePriceId.trim() || null

      await adminAPI.patchPlan(selected.id, payload)
      const refreshed = await adminAPI.getPlans()
      setPlans(refreshed.plans)
      const updated = refreshed.plans.find((p) => p.id === selected.id)
      if (updated) selectPlan(updated)
      setSuccess('Plan updated successfully')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (p: AdminPlan) => {
    if (!canEdit) return
    await adminAPI.patchPlan(p.id, { is_active: !p.is_active })
    loadPlans()
  }

  const activeCount = plans.filter((p) => p.is_active).length

  return (
    <AdminPage>
      <AdminPageHeader
        title="Plans & quotas"
        description="Manage plan pricing, Stripe price IDs, monthly quotas, and rate limits."
      />

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {success && <DashboardAlert variant="success">{success}</DashboardAlert>}

      {loading ? (
        <DashboardLoading message="Loading plans…" />
      ) : (
        <>
          <AdminStatGrid className="mb-6">
            <DashboardStatCard label="Total plans" value={plans.length} icon={Layers} accent="brand" />
            <DashboardStatCard label="Active" value={activeCount} accent="green" />
            <DashboardStatCard
              label="Inactive"
              value={plans.length - activeCount}
              accent="orange"
            />
          </AdminStatGrid>

          <div className="grid gap-6 lg:grid-cols-5">
            <AdminPanel className="lg:col-span-2">
              <AdminPanelHeader title="All plans" icon={Layers} />
              <AdminPanelBody className="space-y-2 !p-3">
                {plans.length === 0 ? (
                  <DashboardEmpty icon={Layers} title="No plans found" />
                ) : (
                  plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPlan(p)}
                      className={`w-full text-left rounded-brand border p-4 transition-all ${
                        selected?.id === p.id
                          ? 'border-violet-400 bg-violet-50/80 shadow-sm'
                          : 'border-surface-border/80 hover:border-brand/30 hover:bg-surface-elevated/50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-ink">{p.name}</span>
                        <Badge variant={p.is_active ? 'default' : 'outline'}>
                          {p.is_active ? 'Active' : 'Off'}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink-muted mt-2">
                        {formatPlanPriceLabel(p.monthly_price)}/mo · quota{' '}
                        {formatCount(p.monthly_quota ?? 0)} · {p.rate_limit_per_minute ?? '—'}/min
                      </p>
                    </button>
                  ))
                )}
              </AdminPanelBody>
            </AdminPanel>

            <AdminPanel className="lg:col-span-3">
              {selected ? (
                <>
                  <AdminPanelHeader title={`Edit ${selected.name}`} />
                  <AdminPanelBody className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-ink-dim block mb-1.5">
                          Monthly price (USD)
                        </label>
                        <Input
                          value={monthlyPrice}
                          onChange={(e) => setMonthlyPrice(e.target.value)}
                          disabled={!canEdit}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink-dim block mb-1.5">
                          Monthly quota
                        </label>
                        <Input
                          value={quota}
                          onChange={(e) => setQuota(e.target.value)}
                          disabled={!canEdit}
                          type="number"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink-dim block mb-1.5">
                          Rate limit (per minute)
                        </label>
                        <Input
                          value={rateLimit}
                          onChange={(e) => setRateLimit(e.target.value)}
                          disabled={!canEdit}
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-1 border-t border-surface-border/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-dim pt-3">
                        Stripe price IDs
                      </p>
                      <div>
                        <label className="text-xs font-medium text-ink-dim block mb-1.5">
                          Legacy price ID (fallback)
                        </label>
                        <Input
                          value={stripePriceId}
                          onChange={(e) => setStripePriceId(e.target.value)}
                          disabled={!canEdit}
                          placeholder="price_..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink-dim block mb-1.5">
                          Test mode price ID
                        </label>
                        <Input
                          value={stripeTestPriceId}
                          onChange={(e) => setStripeTestPriceId(e.target.value)}
                          disabled={!canEdit}
                          placeholder="price_..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink-dim block mb-1.5">
                          Live mode price ID
                        </label>
                        <Input
                          value={stripeLivePriceId}
                          onChange={(e) => setStripeLivePriceId(e.target.value)}
                          disabled={!canEdit}
                          placeholder="price_..."
                        />
                      </div>
                      <p className="text-xs text-ink-muted">
                        Checkout uses test or live IDs based on your Stripe secret key. Clear a field
                        to remove the stored ID.
                      </p>
                    </div>

                    {canEdit && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button onClick={save} disabled={saving}>
                          <Save className="h-4 w-4 mr-1.5" />
                          {saving ? 'Saving…' : 'Save changes'}
                        </Button>
                        <Button variant="outline" onClick={() => toggleActive(selected)}>
                          <Power className="h-4 w-4 mr-1.5" />
                          {selected.is_active ? 'Deactivate plan' : 'Activate plan'}
                        </Button>
                      </div>
                    )}
                  </AdminPanelBody>
                </>
              ) : (
                <DashboardEmpty
                  icon={Layers}
                  title="Select a plan"
                  description="Choose a plan from the list to view and edit pricing settings."
                />
              )}
            </AdminPanel>
          </div>
        </>
      )}
    </AdminPage>
  )
}
