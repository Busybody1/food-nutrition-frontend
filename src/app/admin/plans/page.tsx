'use client'

import { useEffect, useState } from 'react'
import { adminAPI, AdminPlan, AdminPlanFeature } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Layers, Save, Power, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
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

const MAX_HIGHLIGHTS = 12

function formatPlanPriceLabel(price?: number): string {
  if (price === undefined || price === null) return '$0'
  return `$${price}`
}

function sanitizeHighlight(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
}

export default function AdminPlansPage() {
  const { hasPermission } = useAdmin()
  const canEdit = hasPermission('admin:settings:update')
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [selected, setSelected] = useState<AdminPlan | null>(null)
  const [planName, setPlanName] = useState('')
  const [description, setDescription] = useState('')
  const [priceDisplayLabel, setPriceDisplayLabel] = useState('')
  const [highlights, setHighlights] = useState<string[]>([])
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [quota, setQuota] = useState('')
  const [rateLimit, setRateLimit] = useState('')
  const [stripePriceId, setStripePriceId] = useState('')
  const [stripeTestPriceId, setStripeTestPriceId] = useState('')
  const [stripeLivePriceId, setStripeLivePriceId] = useState('')
  const [features, setFeatures] = useState<AdminPlanFeature[]>([])
  const [newFeatureName, setNewFeatureName] = useState('')
  const [newFeatureLimit, setNewFeatureLimit] = useState('')
  const [showFeatures, setShowFeatures] = useState(false)
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

  const loadFeatures = async (planId: number) => {
    try {
      const res = await adminAPI.getPlanFeatures(planId)
      setFeatures(res.features)
    } catch {
      setFeatures([])
    }
  }

  const selectPlan = (p: AdminPlan) => {
    setSelected(p)
    setPlanName(p.name ?? '')
    setDescription(p.description ?? '')
    setPriceDisplayLabel(p.price_display_label ?? '')
    setHighlights(Array.isArray(p.card_highlights) ? [...p.card_highlights] : [])
    setMonthlyPrice(String(p.monthly_price ?? ''))
    setQuota(String(p.monthly_quota ?? ''))
    setRateLimit(String(p.rate_limit_per_minute ?? ''))
    setStripePriceId(p.stripe_price_id ?? '')
    setStripeTestPriceId(p.stripe_test_price_id ?? '')
    setStripeLivePriceId(p.stripe_live_price_id ?? '')
    setSuccess('')
    setShowFeatures(false)
    void loadFeatures(p.id)
  }

  const addHighlight = () => {
    if (highlights.length >= MAX_HIGHLIGHTS) return
    setHighlights((prev) => [...prev, ''])
  }

  const updateHighlight = (index: number, value: string) => {
    setHighlights((prev) => prev.map((h, i) => (i === index ? value : h)))
  }

  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index))
  }

  const moveHighlight = (index: number, dir: -1 | 1) => {
    const next = index + dir
    if (next < 0 || next >= highlights.length) return
    setHighlights((prev) => {
      const copy = [...prev]
      const tmp = copy[index]
      copy[index] = copy[next]
      copy[next] = tmp
      return copy
    })
  }

  const save = async () => {
    if (!selected || !canEdit) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const cleanedHighlights = highlights
        .map(sanitizeHighlight)
        .filter(Boolean)
        .slice(0, MAX_HIGHLIGHTS)

      const payload: Parameters<typeof adminAPI.patchPlan>[1] = {
        is_active: selected.is_active,
        card_highlights: cleanedHighlights,
        price_display_label: priceDisplayLabel.trim() || null,
      }
      const cleanedName = sanitizeHighlight(planName)
      if (cleanedName) payload.name = cleanedName
      payload.description = sanitizeHighlight(description)
      if (monthlyPrice !== '') payload.monthly_price = Number(monthlyPrice)
      if (quota !== '') payload.monthly_quota = Number(quota)
      if (rateLimit !== '') payload.rate_limit_per_minute = Number(rateLimit)

      const legacyStripe = stripePriceId.trim()
      const testStripe = stripeTestPriceId.trim()
      const liveStripe = stripeLivePriceId.trim()
      if (legacyStripe) payload.stripe_price_id = legacyStripe
      else if (selected.stripe_price_id) payload.stripe_price_id = null
      if (testStripe) payload.stripe_test_price_id = testStripe
      else if (selected.stripe_test_price_id) payload.stripe_test_price_id = null
      if (liveStripe) payload.stripe_live_price_id = liveStripe
      else if (selected.stripe_live_price_id) payload.stripe_live_price_id = null

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

  const saveFeature = async () => {
    if (!selected || !canEdit) return
    const name = newFeatureName.trim().toLowerCase().replace(/\s+/g, '_')
    if (!/^[a-z0-9_]{1,100}$/.test(name)) {
      setError('Feature name must be alphanumeric/underscore')
      return
    }
    setError('')
    try {
      const limitRaw = newFeatureLimit.trim()
      await adminAPI.upsertPlanFeature(selected.id, {
        feature_name: name,
        feature_value: true,
        feature_limit: limitRaw === '' ? null : Number(limitRaw),
      })
      setNewFeatureName('')
      setNewFeatureLimit('')
      await loadFeatures(selected.id)
      setSuccess('Feature saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save feature')
    }
  }

  const removeFeature = async (featureName: string) => {
    if (!selected || !canEdit) return
    try {
      await adminAPI.deletePlanFeature(selected.id, featureName)
      await loadFeatures(selected.id)
      setSuccess('Feature deleted')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete feature')
    }
  }

  const activeCount = plans.filter((p) => p.is_active).length

  return (
    <AdminPage>
      <AdminPageHeader
        title="Plans & quotas"
        description="Manage plan pricing, marketing highlights, Stripe price IDs, quotas, and rate limits."
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
                        {formatCount(p.monthly_quota ?? 0)} · {p.rate_limit_per_minute ?? '-'}/min
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
                          Plan name
                        </label>
                        <Input
                          value={planName}
                          onChange={(e) => setPlanName(e.target.value)}
                          disabled={!canEdit}
                          maxLength={50}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink-dim block mb-1.5">
                          Price display label
                        </label>
                        <Input
                          value={priceDisplayLabel}
                          onChange={(e) => setPriceDisplayLabel(e.target.value)}
                          disabled={!canEdit}
                          placeholder="e.g. Enterprise"
                          maxLength={50}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-ink-dim block mb-1.5">
                          Description
                        </label>
                        <Input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={!canEdit}
                          maxLength={2000}
                        />
                      </div>
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
                      <div className="flex items-center justify-between pt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">
                          Pricing card highlights
                        </p>
                        {canEdit && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addHighlight}
                            disabled={highlights.length >= MAX_HIGHLIGHTS}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted">
                        Bullet points shown on the public pricing page (max {MAX_HIGHLIGHTS}).
                      </p>
                      <div className="space-y-2">
                        {highlights.length === 0 ? (
                          <p className="text-sm text-ink-muted">No highlights yet.</p>
                        ) : (
                          highlights.map((item, index) => (
                            <div key={`hl-${index}`} className="flex items-center gap-2">
                              <Input
                                value={item}
                                onChange={(e) => updateHighlight(index, e.target.value)}
                                disabled={!canEdit}
                                maxLength={120}
                                placeholder="Feature bullet"
                              />
                              {canEdit && (
                                <div className="flex shrink-0 gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveHighlight(index, -1)}
                                    disabled={index === 0}
                                    aria-label="Move up"
                                  >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveHighlight(index, 1)}
                                    disabled={index === highlights.length - 1}
                                    aria-label="Move down"
                                  >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeHighlight(index)}
                                    aria-label="Remove highlight"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
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

                    <div className="space-y-3 pt-1 border-t border-surface-border/60">
                      <button
                        type="button"
                        className="pt-3 text-xs font-medium uppercase tracking-wide text-ink-dim hover:text-ink"
                        onClick={() => setShowFeatures((v) => !v)}
                      >
                        Enforcement features {showFeatures ? '(hide)' : '(show)'}
                      </button>
                      {showFeatures && (
                        <div className="space-y-3">
                          <p className="text-xs text-ink-muted">
                            Runtime plan gates (commercial_use, unique_foods_pct, etc.).
                          </p>
                          <ul className="space-y-2">
                            {features.map((f) => (
                              <li
                                key={f.feature_name}
                                className="flex items-center justify-between gap-2 rounded-brand border border-surface-border/80 px-3 py-2 text-sm"
                              >
                                <span className="text-ink">
                                  {f.feature_name}
                                  <span className="text-ink-muted ml-2">
                                    {f.feature_value === false ? 'off' : 'on'}
                                    {f.feature_limit != null ? ` · limit ${f.feature_limit}` : ''}
                                  </span>
                                </span>
                                {canEdit && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFeature(f.feature_name)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </li>
                            ))}
                          </ul>
                          {canEdit && (
                            <div className="flex flex-wrap gap-2">
                              <Input
                                value={newFeatureName}
                                onChange={(e) => setNewFeatureName(e.target.value)}
                                placeholder="feature_name"
                                className="max-w-[180px]"
                              />
                              <Input
                                value={newFeatureLimit}
                                onChange={(e) => setNewFeatureLimit(e.target.value)}
                                placeholder="limit (optional)"
                                type="number"
                                className="max-w-[140px]"
                              />
                              <Button type="button" variant="outline" onClick={saveFeature}>
                                Save feature
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
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
