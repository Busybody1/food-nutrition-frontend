'use client'

import { useEffect, useState } from 'react'
import { adminAPI, AdminPlan, AdminPlanFeature } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdmin } from '@/lib/hooks/use-admin'
import {
  Layers,
  Save,
  Power,
  PowerOff,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  CheckCircle2,
  Pencil,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { formatCount } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminTableWrap,
  AdminTable,
  DashboardStatCard,
  AdminStatGrid,
  DashboardAlert,
  DashboardLoading,
  DashboardEmpty,
  DashboardIconTile,
  DashboardPanelHeader,
  DashboardPill,
  DASHBOARD_ICON_STROKE,
} from '@/components/admin/admin-ui'

const MAX_HIGHLIGHTS = 12

function formatPlanPriceLabel(price?: number): string {
  if (price === undefined || price === null) return '$0'
  return `$${price}`
}

function sanitizeHighlight(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
}

function Field({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="dashboard-field-label">
        {label}
      </label>
      {children}
      {hint && <p className="dashboard-field-hint">{hint}</p>}
    </div>
  )
}

function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string
  hint?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-[13px] font-semibold leading-5 text-dash-ink">{title}</h3>
        {hint && <p className="mt-0.5 text-xs leading-4 text-dash-muted">{hint}</p>}
      </div>
      {action}
    </div>
  )
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
  const [annualPrice, setAnnualPrice] = useState('')
  const [quota, setQuota] = useState('')
  const [rateLimit, setRateLimit] = useState('')
  const [resultsPerQuery, setResultsPerQuery] = useState('')
  const [stripePriceId, setStripePriceId] = useState('')
  const [stripeTestPriceId, setStripeTestPriceId] = useState('')
  const [stripeLivePriceId, setStripeLivePriceId] = useState('')
  const [stripeTestAnnualPriceId, setStripeTestAnnualPriceId] = useState('')
  const [stripeLiveAnnualPriceId, setStripeLiveAnnualPriceId] = useState('')
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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
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
    setAnnualPrice(p.annual_price == null ? '' : String(p.annual_price))
    setQuota(String(p.monthly_quota ?? ''))
    setRateLimit(String(p.rate_limit_per_minute ?? ''))
    setResultsPerQuery(String(p.max_results_per_query ?? ''))
    setStripePriceId(p.stripe_price_id ?? '')
    setStripeTestPriceId(p.stripe_test_price_id ?? '')
    setStripeLivePriceId(p.stripe_live_price_id ?? '')
    setStripeTestAnnualPriceId(p.stripe_test_annual_price_id ?? '')
    setStripeLiveAnnualPriceId(p.stripe_live_annual_price_id ?? '')
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
      if (annualPrice !== '') {
        const annual = Number(annualPrice)
        if (!Number.isFinite(annual) || annual < 0) {
          setError('Annual price must be zero or greater')
          setSaving(false)
          return
        }
        payload.annual_price = annual
      } else if (selected.annual_price != null) {
        payload.annual_price = null
      }
      if (quota !== '') payload.monthly_quota = Number(quota)
      if (rateLimit !== '') payload.rate_limit_per_minute = Number(rateLimit)
      if (resultsPerQuery !== '') {
        const perQuery = Number(resultsPerQuery)
        if (!Number.isInteger(perQuery) || perQuery < 1 || perQuery > 100) {
          setError('Foods per query must be a whole number between 1 and 100')
          setSaving(false)
          return
        }
        payload.max_results_per_query = perQuery
      }

      const legacyStripe = stripePriceId.trim()
      const testStripe = stripeTestPriceId.trim()
      const liveStripe = stripeLivePriceId.trim()
      if (legacyStripe) payload.stripe_price_id = legacyStripe
      else if (selected.stripe_price_id) payload.stripe_price_id = null
      if (testStripe) payload.stripe_test_price_id = testStripe
      else if (selected.stripe_test_price_id) payload.stripe_test_price_id = null
      if (liveStripe) payload.stripe_live_price_id = liveStripe
      else if (selected.stripe_live_price_id) payload.stripe_live_price_id = null
      const testAnnual = stripeTestAnnualPriceId.trim()
      const liveAnnual = stripeLiveAnnualPriceId.trim()
      const priceIdOk = (value: string) => /^price_[A-Za-z0-9]+$/.test(value)
      if (testAnnual && !priceIdOk(testAnnual)) {
        setError('Test annual price ID must look like price_abc123')
        setSaving(false)
        return
      }
      if (liveAnnual && !priceIdOk(liveAnnual)) {
        setError('Live annual price ID must look like price_abc123')
        setSaving(false)
        return
      }
      if (testAnnual) payload.stripe_test_annual_price_id = testAnnual
      else if (selected.stripe_test_annual_price_id) payload.stripe_test_annual_price_id = null
      if (liveAnnual) payload.stripe_live_annual_price_id = liveAnnual
      else if (selected.stripe_live_annual_price_id) payload.stripe_live_annual_price_id = null

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

  const setRecommended = async (p: AdminPlan, recommended: boolean) => {
    if (!canEdit) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (recommended) await adminAPI.setRecommendedPlan(p.id)
      else await adminAPI.clearRecommendedPlan(p.id)
      const refreshed = await adminAPI.getPlans()
      setPlans(refreshed.plans)
      const updated = refreshed.plans.find((plan) => plan.id === selected?.id)
      if (updated) setSelected(updated)
      setSuccess(
        recommended
          ? `"${p.name}" is now the recommended plan on the pricing page.`
          : 'Recommended plan cleared — no card is highlighted.'
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update recommended plan')
    } finally {
      setSaving(false)
    }
  }

  const recommendedPlan = plans.find((p) => p.is_recommended) ?? null

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
          <AdminStatGrid>
            <DashboardStatCard label="Total plans" value={plans.length} icon={Layers} accent="brand" />
            <DashboardStatCard label="Active" value={activeCount} icon={CheckCircle2} accent="green" />
            <DashboardStatCard
              label="Inactive"
              value={plans.length - activeCount}
              icon={PowerOff}
              accent="orange"
            />
            <DashboardStatCard
              label="Recommended"
              value={recommendedPlan?.name ?? 'None'}
              hint="Shown as “Most popular” on /pricing"
              icon={Star}
              accent="indigo"
            />
          </AdminStatGrid>

          <AdminPanel>
            <AdminPanelHeader
              title="All plans"
              icon={Layers}
              description="Select a plan to edit its pricing, quotas, and features."
            />
            {plans.length === 0 ? (
              <DashboardEmpty icon={Layers} title="No plans found" />
            ) : (
              <AdminPanelBody noPadding>
                <AdminTableWrap>
                  <AdminTable className="[&_td]:px-3 [&_th]:px-3">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Status</th>
                        <th className="dashboard-num">Monthly</th>
                        <th className="dashboard-num">Annual</th>
                        <th className="dashboard-num">Quota</th>
                        <th className="dashboard-num">Rate limit</th>
                        <th className="dashboard-num">Foods / query</th>
                        <th className="dashboard-num">Users</th>
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((p) => {
                        const isSelected = selected?.id === p.id
                        return (
                          <tr
                            key={p.id}
                            onClick={() => selectPlan(p)}
                            aria-selected={isSelected}
                            className={cn(
                              'dashboard-table-row-clickable',
                              isSelected && 'bg-dash-teal-soft/60'
                            )}
                          >
                            <td>
                              <div className="flex min-w-0 items-center gap-3">
                                <DashboardIconTile
                                  icon={Layers}
                                  tone={p.is_active ? 'brand' : 'neutral'}
                                  className="h-8 w-8"
                                />
                                <span className="truncate font-medium text-dash-ink">{p.name}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <DashboardPill tone={p.is_active ? 'green' : 'neutral'}>
                                  {p.is_active ? 'Active' : 'Off'}
                                </DashboardPill>
                                {p.is_recommended && (
                                  <DashboardPill tone="brand" icon={Star} title="Recommended plan">
                                    Recommended
                                  </DashboardPill>
                                )}
                              </div>
                            </td>
                            <td className="dashboard-num whitespace-nowrap font-medium text-dash-ink">
                              {formatPlanPriceLabel(p.monthly_price)}/mo
                            </td>
                            <td className="dashboard-num whitespace-nowrap">
                              {p.annual_price != null ? `${formatPlanPriceLabel(p.annual_price)}/yr` : '—'}
                            </td>
                            <td className="dashboard-num">{formatCount(p.monthly_quota ?? 0)}</td>
                            <td className="dashboard-num whitespace-nowrap">
                              {p.rate_limit_per_minute != null ? `${p.rate_limit_per_minute}/min` : '—'}
                            </td>
                            <td className="dashboard-num">{p.max_results_per_query ?? '—'}</td>
                            <td className="dashboard-num">
                              {p.users_count != null ? formatCount(p.users_count) : '—'}
                            </td>
                            <td className="text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5"
                                aria-label={`Edit ${p.name}`}
                              >
                                <Pencil className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                                Edit
                              </Button>
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

          <div className="dashboard-grid-wide items-start">
            <AdminPanel>
              {selected ? (
                <>
                  <AdminPanelHeader
                    title={`Edit ${selected.name}`}
                    icon={Pencil}
                    actions={
                      <DashboardPill tone={selected.is_active ? 'green' : 'neutral'}>
                        {selected.is_active ? 'Active' : 'Off'}
                      </DashboardPill>
                    }
                  />
                  <AdminPanelBody className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="plan-name" label="Plan name">
                        <Input
                          id="plan-name"
                          value={planName}
                          onChange={(e) => setPlanName(e.target.value)}
                          disabled={!canEdit}
                          maxLength={50}
                        />
                      </Field>
                      <Field id="plan-price-label" label="Price display label">
                        <Input
                          id="plan-price-label"
                          value={priceDisplayLabel}
                          onChange={(e) => setPriceDisplayLabel(e.target.value)}
                          disabled={!canEdit}
                          placeholder="e.g. Enterprise"
                          maxLength={50}
                        />
                      </Field>
                      <Field id="plan-description" label="Description" className="sm:col-span-2">
                        <Input
                          id="plan-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={!canEdit}
                          maxLength={2000}
                        />
                      </Field>
                      <Field id="plan-monthly-price" label="Monthly price (USD)">
                        <Input
                          id="plan-monthly-price"
                          value={monthlyPrice}
                          onChange={(e) => setMonthlyPrice(e.target.value)}
                          disabled={!canEdit}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </Field>
                      <Field id="plan-annual-price" label="Annual price (USD)">
                        <Input
                          id="plan-annual-price"
                          value={annualPrice}
                          onChange={(e) => setAnnualPrice(e.target.value)}
                          disabled={!canEdit}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </Field>
                      <Field id="plan-quota" label="Monthly quota">
                        <Input
                          id="plan-quota"
                          value={quota}
                          onChange={(e) => setQuota(e.target.value)}
                          disabled={!canEdit}
                          type="number"
                        />
                      </Field>
                      <Field id="plan-rate-limit" label="Rate limit (per minute)">
                        <Input
                          id="plan-rate-limit"
                          value={rateLimit}
                          onChange={(e) => setRateLimit(e.target.value)}
                          disabled={!canEdit}
                          type="number"
                        />
                      </Field>
                      <Field
                        id="plan-results-per-query"
                        label="Foods per query"
                        className="sm:col-span-2"
                        hint="Max foods returned in one search or catalog request (1–100). Free default 20; paid default 100."
                      >
                        <Input
                          id="plan-results-per-query"
                          value={resultsPerQuery}
                          onChange={(e) => setResultsPerQuery(e.target.value)}
                          disabled={!canEdit}
                          type="number"
                          min="1"
                          max="100"
                          className="sm:max-w-[calc(50%-0.5rem)]"
                        />
                      </Field>
                    </div>

                    <section className="space-y-3 border-t border-dash-border pt-5">
                      <SectionHeading
                        title="Pricing card highlights"
                        hint={`Bullet points shown on the public pricing page (max ${MAX_HIGHLIGHTS}).`}
                        action={
                          canEdit ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 gap-1.5"
                              onClick={addHighlight}
                              disabled={highlights.length >= MAX_HIGHLIGHTS}
                            >
                              <Plus className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                              Add
                            </Button>
                          ) : undefined
                        }
                      />
                      <div className="space-y-2">
                        {highlights.length === 0 ? (
                          <p className="rounded-xl bg-dash-hover px-4 py-3 text-[13px] text-dash-muted">
                            No highlights yet.
                          </p>
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
                                <div className="flex shrink-0 gap-0.5">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => moveHighlight(index, -1)}
                                    disabled={index === 0}
                                    aria-label="Move up"
                                  >
                                    <ChevronUp className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => moveHighlight(index, 1)}
                                    disabled={index === highlights.length - 1}
                                    aria-label="Move down"
                                  >
                                    <ChevronDown className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                                    onClick={() => removeHighlight(index)}
                                    aria-label="Remove highlight"
                                  >
                                    <Trash2 className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="space-y-4 border-t border-dash-border pt-5">
                      <SectionHeading
                        title="Stripe price IDs"
                        hint="Checkout uses test or live IDs based on your Stripe secret key. Clear a field to remove the stored ID."
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          id="plan-stripe-legacy"
                          label="Legacy price ID (fallback)"
                          className="sm:col-span-2"
                        >
                          <Input
                            id="plan-stripe-legacy"
                            value={stripePriceId}
                            onChange={(e) => setStripePriceId(e.target.value)}
                            disabled={!canEdit}
                            placeholder="price_..."
                            className="font-mono"
                          />
                        </Field>
                        <Field id="plan-stripe-test" label="Test mode price ID">
                          <Input
                            id="plan-stripe-test"
                            value={stripeTestPriceId}
                            onChange={(e) => setStripeTestPriceId(e.target.value)}
                            disabled={!canEdit}
                            placeholder="price_..."
                            className="font-mono"
                          />
                        </Field>
                        <Field id="plan-stripe-live" label="Live mode price ID">
                          <Input
                            id="plan-stripe-live"
                            value={stripeLivePriceId}
                            onChange={(e) => setStripeLivePriceId(e.target.value)}
                            disabled={!canEdit}
                            placeholder="price_..."
                            className="font-mono"
                          />
                        </Field>
                        <Field id="plan-stripe-test-annual" label="Test annual price ID">
                          <Input
                            id="plan-stripe-test-annual"
                            value={stripeTestAnnualPriceId}
                            onChange={(e) => setStripeTestAnnualPriceId(e.target.value)}
                            disabled={!canEdit}
                            placeholder="price_..."
                            className="font-mono"
                          />
                        </Field>
                        <Field id="plan-stripe-live-annual" label="Live annual price ID">
                          <Input
                            id="plan-stripe-live-annual"
                            value={stripeLiveAnnualPriceId}
                            onChange={(e) => setStripeLiveAnnualPriceId(e.target.value)}
                            disabled={!canEdit}
                            placeholder="price_..."
                            className="font-mono"
                          />
                        </Field>
                      </div>
                    </section>
                  </AdminPanelBody>
                  {canEdit && (
                    <div className="flex flex-wrap justify-end gap-2 border-t border-dash-border px-5 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={() => toggleActive(selected)}
                      >
                        <Power className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                        {selected.is_active ? 'Deactivate plan' : 'Activate plan'}
                      </Button>
                      <Button size="sm" className="h-9 gap-1.5" onClick={save} disabled={saving}>
                        <Save className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                        {saving ? 'Saving…' : 'Save changes'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <DashboardEmpty
                  icon={Layers}
                  title="Select a plan"
                  description="Choose a plan from the list to view and edit pricing settings."
                />
              )}
            </AdminPanel>

            <div className="flex min-w-0 flex-col gap-5">
              <AdminPanel>
                <AdminPanelHeader
                  title="Recommended plan"
                  icon={Star}
                  actions={
                    recommendedPlan && canEdit ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5"
                        disabled={saving}
                        onClick={() => setRecommended(recommendedPlan, false)}
                      >
                        <X className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                        Clear
                      </Button>
                    ) : undefined
                  }
                />
                <AdminPanelBody className="space-y-4">
                  <p className="text-[13px] leading-5 text-dash-muted">
                    Pick the plan that carries the “Most popular” badge on the public pricing page.
                    Only one plan can hold it, and the change is live immediately — no redeploy.
                  </p>
                  <div className="flex flex-col gap-2">
                    {plans.map((p) => {
                      const isRecommended = Boolean(p.is_recommended)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={!canEdit || saving || !p.is_active}
                          onClick={() => setRecommended(p, !isRecommended)}
                          title={
                            !p.is_active
                              ? 'Inactive plans are not shown on the pricing page'
                              : isRecommended
                                ? 'Clear the recommended badge'
                                : `Make ${p.name} the recommended plan`
                          }
                          className={cn(
                            'flex h-10 w-full items-center gap-2.5 rounded-[10px] border px-3 text-left text-[13px] font-medium transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50',
                            isRecommended
                              ? 'border-dash-teal bg-dash-teal-soft text-dash-teal-strong'
                              : 'border-dash-border bg-white text-dash-ink hover:border-dash-border-strong hover:bg-dash-hover'
                          )}
                          aria-pressed={isRecommended}
                        >
                          <Star
                            className={cn(
                              'h-4 w-4 shrink-0',
                              isRecommended ? 'fill-dash-teal text-dash-teal-strong' : 'text-dash-dim'
                            )}
                            strokeWidth={DASHBOARD_ICON_STROKE}
                            aria-hidden
                          />
                          <span className="min-w-0 truncate">{p.name}</span>
                          {!p.is_active && (
                            <DashboardPill tone="neutral" className="ml-auto">
                              off
                            </DashboardPill>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {!recommendedPlan && (
                    <p className="text-xs text-dash-muted">
                      No plan is highlighted right now — the pricing grid renders every card equally.
                    </p>
                  )}
                </AdminPanelBody>
              </AdminPanel>

              {selected && (
                <AdminPanel>
                  <DashboardPanelHeader
                    className={showFeatures ? undefined : 'pb-4'}
                    title="Enforcement features"
                    icon={SlidersHorizontal}
                    description="Runtime plan gates (commercial_use, unique_foods_pct, etc.)."
                    actions={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={() => setShowFeatures((v) => !v)}
                        aria-expanded={showFeatures}
                      >
                        {showFeatures ? (
                          <ChevronUp className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                        ) : (
                          <ChevronDown className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                        )}
                        {showFeatures ? 'Hide' : 'Show'}
                      </Button>
                    }
                  />
                  {showFeatures && (
                    <>
                      <AdminPanelBody className="space-y-4">
                        <ul className="flex flex-wrap gap-2">
                          {features.map((f) => (
                            <li
                              key={f.feature_name}
                              className={cn(
                                'inline-flex h-8 max-w-full items-center gap-1.5 rounded-md bg-dash-pill pl-2.5 text-xs text-dash-body',
                                canEdit ? 'pr-1' : 'pr-2.5'
                              )}
                            >
                              <span className="truncate font-mono font-medium text-dash-ink">
                                {f.feature_name}
                              </span>
                              <span className="shrink-0 text-dash-muted">
                                {f.feature_value === false ? 'off' : 'on'}
                                {f.feature_limit != null ? ` · limit ${f.feature_limit}` : ''}
                              </span>
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => removeFeature(f.feature_name)}
                                  aria-label={`Delete ${f.feature_name}`}
                                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-dash-dim transition-colors hover:bg-dash-negative-soft hover:text-dash-negative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                                >
                                  <Trash2 className="h-3.5 w-3.5" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                        {canEdit && (
                          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                            <Field id="plan-feature-name" label="Feature name">
                              <Input
                                id="plan-feature-name"
                                value={newFeatureName}
                                onChange={(e) => setNewFeatureName(e.target.value)}
                                placeholder="feature_name"
                                className="font-mono"
                              />
                            </Field>
                            <Field id="plan-feature-limit" label="Limit">
                              <Input
                                id="plan-feature-limit"
                                value={newFeatureLimit}
                                onChange={(e) => setNewFeatureLimit(e.target.value)}
                                placeholder="limit (optional)"
                                type="number"
                              />
                            </Field>
                          </div>
                        )}
                      </AdminPanelBody>
                      {canEdit && (
                        <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5"
                            onClick={saveFeature}
                          >
                            <Plus className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                            Save feature
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </AdminPanel>
              )}
            </div>
          </div>
        </>
      )}
    </AdminPage>
  )
}
