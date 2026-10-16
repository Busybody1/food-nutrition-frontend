'use client'

import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import {
  DASHBOARD_ICON_STROKE,
  DashboardTable,
  DashboardTableWrap,
} from '@/components/dashboard/dashboard-shell'
import {
  atwaterEnergyRange,
  atwaterInBand,
  atwaterKcal,
  atwaterToneForStated,
  physicallyImpossible,
} from '@/lib/food-macros'
import type { AdminFoodNutrientRow } from '@/lib/api/admin'

export const CORE_NUTRIENTS: Array<{ id: number; label: string; unit: string }> = [
  { id: 106888, label: 'Calories', unit: 'kcal' },
  { id: 106899, label: 'Protein', unit: 'g' },
  { id: 106896, label: 'Carbohydrates', unit: 'g' },
  { id: 106891, label: 'Fat', unit: 'g' },
  { id: 106898, label: 'Fiber', unit: 'g' },
  { id: 106897, label: 'Sugar', unit: 'g' },
]

export const EXTRA_NUTRIENTS: Array<{ id: number; label: string; unit: string }> = [
  { id: 106916, label: 'Saturated fat', unit: 'g' },
  { id: 106917, label: 'Polyunsaturated fat', unit: 'g' },
  { id: 106918, label: 'Monounsaturated fat', unit: 'g' },
  { id: 106912, label: 'Net carbs', unit: 'g' },
  { id: 106901, label: 'Sodium', unit: 'mg' },
  { id: 106902, label: 'Potassium', unit: 'mg' },
  { id: 106895, label: 'Cholesterol', unit: 'mg' },
  { id: 106908, label: 'Alcohol', unit: 'g' },
  { id: 106909, label: 'Caffeine', unit: 'mg' },
  { id: 106913, label: 'Vitamin A', unit: 'mg' },
  { id: 106914, label: 'Vitamin B', unit: 'mg' },
  { id: 106907, label: 'Vitamin C', unit: 'mg' },
  { id: 106906, label: 'Vitamin D', unit: 'µg' },
  { id: 106903, label: 'Calcium', unit: 'mg' },
  { id: 106904, label: 'Iron', unit: 'mg' },
  { id: 106905, label: 'Magnesium', unit: 'mg' },
]

const TONE_CLASS = {
  green: 'border-dash-positive/20 bg-dash-positive-soft text-dash-positive',
  amber: 'border-dash-warning/20 bg-dash-warning-soft text-dash-warning',
  red: 'border-dash-negative/20 bg-dash-negative-soft text-dash-negative',
  neutral: 'border-dash-border bg-dash-hover text-dash-muted',
}

function num(values: Record<number, string>, id: number): number {
  const raw = values[id]
  if (raw === undefined || raw === '') return 0
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

export function amountsFromRows(rows: AdminFoodNutrientRow[]): Record<number, string> {
  const out: Record<number, string> = {}
  for (const row of rows) {
    out[row.nutrient_id] = String(row.amount)
  }
  return out
}

function NutrientRow({
  item,
  value,
  previous,
  showPrevious,
  disabled,
  onChange,
}: {
  item: { id: number; label: string; unit: string }
  value: string | undefined
  previous?: string
  showPrevious?: boolean
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const inputId = `n-${item.id}`
  return (
    <tr>
      <td>
        <label htmlFor={inputId} className="block">
          <span className="block font-medium text-dash-ink">{item.label}</span>
          <span className="block text-xs text-dash-muted">{item.unit} / 100 g</span>
        </label>
      </td>
      {showPrevious && <td className="dashboard-num text-dash-muted">{previous ?? '—'}</td>}
      <td className="dashboard-num">
        <div className="ml-auto flex w-full max-w-[200px] items-center justify-end gap-2">
          <Input
            id={inputId}
            type="number"
            min={0}
            step="0.01"
            disabled={disabled}
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value)}
            className="text-right tabular-nums"
          />
          <span className="w-9 shrink-0 text-left text-xs text-dash-muted">{item.unit}</span>
        </div>
      </td>
    </tr>
  )
}

export function FoodMacroEditor({
  values,
  original,
  onChange,
  disabled,
}: {
  values: Record<number, string>
  original: Record<number, string>
  onChange: (nutrientId: number, value: string) => void
  disabled?: boolean
}) {
  const kcal = num(values, 106888)
  const protein = num(values, 106899)
  const carbs = num(values, 106896)
  const fat = num(values, 106891)
  const fiber = num(values, 106898)
  const alcohol = num(values, 106908)
  const range = atwaterEnergyRange(protein, carbs, fat, alcohol, fiber)
  const estimate = atwaterKcal(protein, carbs, fat, alcohol, fiber)
  const inBand = atwaterInBand(kcal, range)
  const tone = atwaterToneForStated(kcal, range)
  const impossible = physicallyImpossible({ kcal, protein, carbs, fat })

  const diffs = useMemo(() => {
    const changed: string[] = []
    const ids = new Set([...Object.keys(values), ...Object.keys(original)].map(Number))
    for (const id of ids) {
      if ((values[id] ?? '') !== (original[id] ?? '')) {
        const meta = [...CORE_NUTRIENTS, ...EXTRA_NUTRIENTS].find((item) => item.id === id)
        changed.push(`${meta?.label ?? id}: ${original[id] || '—'} → ${values[id] || '—'}`)
      }
    }
    return changed
  }, [original, values])

  return (
    <div className="flex flex-col">
      <p className="px-5 pb-4 pt-3 text-[13px] leading-5 text-dash-muted">
        All amounts are <strong className="font-semibold text-dash-ink">per 100 g</strong>. The source CSV was
        per 1 g; do not enter per-gram values here.
      </p>
      <DashboardTableWrap>
        <DashboardTable>
          <thead>
            <tr>
              <th>Nutrient</th>
              <th className="dashboard-num">DB was</th>
              <th className="dashboard-num">Per 100 g</th>
            </tr>
          </thead>
          <tbody>
            {CORE_NUTRIENTS.map((item) => (
              <NutrientRow
                key={item.id}
                item={item}
                value={values[item.id]}
                previous={original[item.id]}
                showPrevious
                disabled={disabled}
                onChange={(next) => onChange(item.id, next)}
              />
            ))}
          </tbody>
        </DashboardTable>
      </DashboardTableWrap>
      <div className="flex flex-col gap-3 border-t border-dash-border px-5 py-4">
        <div className={cn('rounded-xl border px-4 py-3 text-[13px] leading-5', TONE_CLASS[tone])}>
          Plausible energy {range.min.toFixed(0)}-{range.max.toFixed(0)} kcal/100 g after fiber
          (0-2-4 kcal/g) and alcohol (7). EU-style estimate {estimate.toFixed(0)}. Entered{' '}
          {kcal.toFixed(0)} {inBand ? 'is inside the range' : 'is outside the range'}.
        </div>
        {impossible && <p className="text-[13px] font-medium text-dash-negative">{impossible}</p>}
      </div>
      <details className="group border-t border-dash-border">
        <summary className="flex h-12 cursor-pointer list-none items-center gap-2 px-5 text-[13px] font-medium text-dash-ink transition-colors hover:text-dash-teal-strong [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="h-4 w-4 shrink-0 text-dash-dim transition-transform group-open:rotate-90"
            strokeWidth={DASHBOARD_ICON_STROKE}
            aria-hidden
          />
          Other nutrients (per 100 g)
        </summary>
        <DashboardTableWrap>
          <DashboardTable>
            <thead>
              <tr>
                <th>Nutrient</th>
                <th className="dashboard-num">Per 100 g</th>
              </tr>
            </thead>
            <tbody>
              {EXTRA_NUTRIENTS.map((item) => (
                <NutrientRow
                  key={item.id}
                  item={item}
                  value={values[item.id]}
                  disabled={disabled}
                  onChange={(next) => onChange(item.id, next)}
                />
              ))}
            </tbody>
          </DashboardTable>
        </DashboardTableWrap>
      </details>
      {diffs.length > 0 && (
        <div className="border-t border-dash-border px-5 py-4 text-[13px]">
          <p className="mb-2 font-medium text-dash-ink">Pending changes</p>
          <ul className="space-y-1 rounded-xl border border-dash-border bg-dash-hover px-4 py-3 text-dash-body">
            {diffs.map((line) => (
              <li key={line} className="tabular-nums">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function buildNutrientPatch(
  values: Record<number, string>,
  original: Record<number, string>
): Record<number, number | null> {
  const patch: Record<number, number | null> = {}
  const ids = new Set([...Object.keys(values), ...Object.keys(original)].map(Number))
  for (const id of ids) {
    const next = (values[id] ?? '').trim()
    const prev = (original[id] ?? '').trim()
    if (next === prev) continue
    if (next === '') {
      patch[id] = null
      continue
    }
    const amount = Number(next)
    if (Number.isFinite(amount)) patch[id] = amount
  }
  return patch
}
