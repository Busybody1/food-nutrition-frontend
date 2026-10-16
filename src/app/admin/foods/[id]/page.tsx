'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ClipboardCheck, FileText, FlaskConical, History, Inbox, Save } from 'lucide-react'
import {
  adminAPI,
  type AdminFoodDetail,
  type AdminFoodQueueItem,
} from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  DashboardAlert,
  DashboardLoading,
  DashboardPill,
  DashboardStatList,
  DASHBOARD_ICON_STROKE,
} from '@/components/admin/admin-ui'
import {
  FoodMacroEditor,
  amountsFromRows,
  buildNutrientPatch,
} from '@/components/admin/food-macro-editor'
import { physicallyImpossible } from '@/lib/food-macros'

export default function AdminFoodDetailPage() {
  const params = useParams<{ id: string }>()
  const foodId = Number(params.id)
  const { hasPermission } = useAdmin()
  const canView = hasPermission('admin:foods:view')
  const canUpdate = hasPermission('admin:foods:update')

  const [food, setFood] = useState<AdminFoodDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<Record<number, string>>({})
  const [original, setOriginal] = useState<Record<number, string>>({})
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [locked, setLocked] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewClass, setReviewClass] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const detail = await adminAPI.getFood(foodId)
      setFood(detail)
      const mapped = amountsFromRows(detail.nutrients || [])
      setValues(mapped)
      setOriginal(mapped)
      setName(detail.name || '')
      setDescription(detail.description || '')
      setLocked(Boolean(detail.nutrition_locked))
      const openItem = (detail.queue || []).find((item) => item.status === 'open')
      setReviewClass(openItem?.issue_class || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food')
    } finally {
      setLoading(false)
    }
  }, [foodId])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (canView && Number.isFinite(foodId)) load()
  }, [canView, foodId, load])

  if (!canView) {
    return (
      <AdminPage>
        <DashboardAlert variant="error">You do not have permission to view this food.</DashboardAlert>
      </AdminPage>
    )
  }

  const servingIsOneGram = String(food?.serving_size || '') === '1'
  const kcal = Number(values[106888] || 0)
  const protein = Number(values[106899] || 0)
  const carbs = Number(values[106896] || 0)
  const fat = Number(values[106891] || 0)
  const impossible = physicallyImpossible({ kcal, protein, carbs, fat })

  async function saveNutrients() {
    const patch = buildNutrientPatch(values, original)
    if (Object.keys(patch).length === 0) {
      setError('No nutrient changes to save')
      return
    }
    if (impossible) {
      setError(impossible)
      return
    }
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      setWarning(null)
      const res = await adminAPI.patchFoodNutrients(foodId, { nutrients: patch })
      setSuccess('Nutrients saved')
      if (res.warning?.message) setWarning(res.warning.message)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function saveMetadata() {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      await adminAPI.patchFood(foodId, {
        name,
        description,
        nutrition_locked: locked,
      })
      setSuccess('Metadata saved')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function resolveQueue(action: 'resolved' | 'dismissed') {
    if (!reviewClass || !reviewNote.trim()) {
      setError('Issue class and note are required')
      return
    }
    try {
      setSaving(true)
      setError(null)
      await adminAPI.resolveFoodReview(foodId, {
        issue_class: reviewClass,
        action,
        note: reviewNote.trim(),
      })
      setSuccess(`Issue ${action}`)
      setReviewNote('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={food?.name || 'Verified food'}
        description={food?.external_id || ''}
        actions={
          <Button variant="outline" size="sm" className="h-9 gap-1.5" asChild>
            <Link href="/admin/foods">
              <ArrowLeft className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              Back to catalog
            </Link>
          </Button>
        }
      />
      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {success && <DashboardAlert variant="success">{success}</DashboardAlert>}
      {warning && <DashboardAlert variant="warning">{warning}</DashboardAlert>}
      {loading || !food ? (
        <DashboardLoading />
      ) : (
        <>
          {servingIsOneGram && (
            <DashboardAlert variant="warning">
              serving_size is 1 g for this food (true of the verified CSV ingest). Display and
              meal scaling can look wrong if clients treat that as a default portion.
            </DashboardAlert>
          )}
          <div className="dashboard-grid-wide items-start">
            <div className="flex min-w-0 flex-col gap-5">
              <AdminPanel>
                <AdminPanelHeader title="Details" icon={FileText} />
                <AdminPanelBody className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="min-w-0">
                      <label htmlFor="food-name" className="dashboard-field-label">
                        Name
                      </label>
                      <Input id="food-name" value={name} disabled={!canUpdate} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="min-w-0">
                      <label htmlFor="food-desc" className="dashboard-field-label">
                        Description / aliases
                      </label>
                      <Input
                        id="food-desc"
                        value={description}
                        disabled={!canUpdate}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border bg-dash-hover px-4 py-3">
                    <label htmlFor="lock" className="text-[13px] font-medium leading-5 text-dash-body">
                      Lock nutrition (ingest scripts will not overwrite this row)
                    </label>
                    <Switch id="lock" checked={locked} disabled={!canUpdate} onCheckedChange={setLocked} />
                  </div>
                </AdminPanelBody>
                {canUpdate && (
                  <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
                    <Button type="button" size="sm" className="h-9 gap-1.5" onClick={saveMetadata} disabled={saving}>
                      <Save className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                      Save metadata
                    </Button>
                  </div>
                )}
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Nutrients" icon={FlaskConical} />
                <FoodMacroEditor
                  values={values}
                  original={original}
                  disabled={!canUpdate || saving}
                  onChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
                />
                {canUpdate && (
                  <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 gap-1.5"
                      onClick={saveNutrients}
                      disabled={saving || Boolean(impossible)}
                    >
                      <Save className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                      Save nutrients
                    </Button>
                  </div>
                )}
              </AdminPanel>
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <AdminPanel>
                <AdminPanelHeader title="Source and review" icon={ClipboardCheck} />
                <AdminPanelBody>
                  <DashboardStatList
                    items={[
                      { label: 'Source', value: food.nutrition_source || '—' },
                      { label: 'Reviewed', value: food.nutrition_reviewed_at || 'never' },
                      {
                        label: 'Reviewed by',
                        value: food.nutrition_reviewed_by ? `user ${food.nutrition_reviewed_by}` : null,
                      },
                      { label: 'Category', value: food.category_name || null },
                      {
                        label: 'Serving size',
                        value: food.serving_size
                          ? `${food.serving_size}${food.serving_unit ? ` ${food.serving_unit}` : ''}`
                          : null,
                      },
                    ]}
                  />
                </AdminPanelBody>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Review queue" icon={Inbox} />
                <AdminPanelBody>
                  {(food.queue || []).length === 0 ? (
                    <p className="rounded-xl bg-dash-hover px-4 py-3 text-[13px] text-dash-muted">
                      No queue items.
                    </p>
                  ) : (
                    <ul className="divide-y divide-dash-border/70">
                      {(food.queue || []).map((item: AdminFoodQueueItem) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                          <span className="min-w-0">
                            <span className="text-dash-ink">{item.issue_class.replaceAll('_', ' ')}</span>{' '}
                            <span className="text-xs text-dash-muted">(severity {item.severity})</span>
                          </span>
                          <DashboardPill tone={item.status === 'open' ? 'orange' : 'neutral'}>
                            {item.status}
                          </DashboardPill>
                        </li>
                      ))}
                    </ul>
                  )}
                </AdminPanelBody>
                {canUpdate && (
                  <>
                    <div className="space-y-4 border-t border-dash-border px-5 py-4">
                      <div>
                        <label htmlFor="food-review-class" className="dashboard-field-label">
                          Issue class
                        </label>
                        <Input
                          id="food-review-class"
                          placeholder="Issue class"
                          value={reviewClass}
                          onChange={(e) => setReviewClass(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="food-review-note" className="dashboard-field-label">
                          Resolution note
                        </label>
                        <Input
                          id="food-review-note"
                          placeholder="Resolution note (required)"
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => resolveQueue('dismissed')}
                        disabled={saving}
                      >
                        Dismiss
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-9"
                        onClick={() => resolveQueue('resolved')}
                        disabled={saving}
                      >
                        Resolve
                      </Button>
                    </div>
                  </>
                )}
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Audit history" icon={History} />
                <AdminPanelBody>
                  {(food.audit || []).length === 0 ? (
                    <p className="rounded-xl bg-dash-hover px-4 py-3 text-[13px] text-dash-muted">
                      No audit rows.
                    </p>
                  ) : (
                    <ul className="divide-y divide-dash-border/70">
                      {(food.audit || []).map((row) => (
                        <li key={row.id} className="py-2.5">
                          <p className="text-[13px] font-medium text-dash-ink">{row.action}</p>
                          <p className="mt-0.5 text-xs tabular-nums text-dash-muted">{row.created_at || ''}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </AdminPanelBody>
              </AdminPanel>
            </div>
          </div>
        </>
      )}
    </AdminPage>
  )
}
