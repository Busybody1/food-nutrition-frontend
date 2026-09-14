'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  adminAPI,
  type AdminFoodDetail,
  type AdminFoodQueueItem,
} from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  DashboardAlert,
  DashboardLoading,
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
          <Button variant="outline" asChild>
            <Link href="/admin/foods">Back to catalog</Link>
          </Button>
        }
      />
      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {success && <DashboardAlert variant="success">{success}</DashboardAlert>}
      {warning && <DashboardAlert variant="warning">{warning}</DashboardAlert>}
      {loading || !food ? (
        <DashboardLoading />
      ) : (
        <div className="flex flex-col gap-6">
          {servingIsOneGram && (
            <DashboardAlert variant="warning">
              serving_size is 1 g for this food (true of the verified CSV ingest). Display and
              meal scaling can look wrong if clients treat that as a default portion.
            </DashboardAlert>
          )}
          <AdminPanel>
            <AdminPanelBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="food-name">Name</Label>
                  <Input id="food-name" value={name} disabled={!canUpdate} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="food-desc">Description / aliases</Label>
                  <Input
                    id="food-desc"
                    value={description}
                    disabled={!canUpdate}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <Switch id="lock" checked={locked} disabled={!canUpdate} onCheckedChange={setLocked} />
                <Label htmlFor="lock">
                  Lock nutrition (ingest scripts will not overwrite this row)
                </Label>
              </div>
              <p className="text-sm text-ink-dim mb-4">
                Source: {food.nutrition_source || '—'} · Reviewed: {food.nutrition_reviewed_at || 'never'}
                {food.nutrition_reviewed_by ? ` by user ${food.nutrition_reviewed_by}` : ''}
              </p>
              {canUpdate && (
                <Button type="button" onClick={saveMetadata} disabled={saving}>
                  Save metadata
                </Button>
              )}
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelBody>
              <FoodMacroEditor
                values={values}
                original={original}
                disabled={!canUpdate || saving}
                onChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
              />
              {canUpdate && (
                <div className="mt-6">
                  <Button type="button" onClick={saveNutrients} disabled={saving || Boolean(impossible)}>
                    Save nutrients
                  </Button>
                </div>
              )}
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelBody>
              <h2 className="font-medium mb-3">Review queue</h2>
              {(food.queue || []).length === 0 ? (
                <p className="text-sm text-ink-dim">No queue items.</p>
              ) : (
                <ul className="flex flex-col gap-2 mb-4">
                  {(food.queue || []).map((item: AdminFoodQueueItem) => (
                    <li key={item.id} className="text-sm">
                      <Badge variant={item.status === 'open' ? 'warning' : 'secondary'}>
                        {item.status}
                      </Badge>{' '}
                      {item.issue_class.replaceAll('_', ' ')} (severity {item.severity})
                    </li>
                  ))}
                </ul>
              )}
              {canUpdate && (
                <div className="flex flex-col gap-3 max-w-lg">
                  <Input
                    placeholder="Issue class"
                    value={reviewClass}
                    onChange={(e) => setReviewClass(e.target.value)}
                  />
                  <Input
                    placeholder="Resolution note (required)"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => resolveQueue('resolved')} disabled={saving}>
                      Resolve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => resolveQueue('dismissed')}
                      disabled={saving}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelBody>
              <h2 className="font-medium mb-3">Audit history</h2>
              {(food.audit || []).length === 0 ? (
                <p className="text-sm text-ink-dim">No audit rows.</p>
              ) : (
                <ul className="text-sm flex flex-col gap-2">
                  {(food.audit || []).map((row) => (
                    <li key={row.id}>
                      {row.created_at || ''} · {row.action}
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanelBody>
          </AdminPanel>
        </div>
      )}
    </AdminPage>
  )
}
