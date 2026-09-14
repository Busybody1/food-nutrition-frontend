'use client'

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  green: 'text-emerald-700',
  amber: 'text-amber-700',
  red: 'text-red-700',
  neutral: 'text-ink-dim',
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
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink-dim">
        All amounts are <strong>per 100 g</strong>. The source CSV was per 1 g; do not enter per-gram values here.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CORE_NUTRIENTS.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <Label htmlFor={`n-${item.id}`}>
              {item.label} ({item.unit} / 100 g)
            </Label>
            <Input
              id={`n-${item.id}`}
              type="number"
              min={0}
              step="0.01"
              disabled={disabled}
              value={values[item.id] ?? ''}
              onChange={(event) => onChange(item.id, event.target.value)}
            />
            <span className="text-xs text-ink-dim">DB was {original[item.id] ?? '—'}</span>
          </div>
        ))}
      </div>
      <div className={`text-sm ${TONE_CLASS[tone]}`}>
        Plausible energy {range.min.toFixed(0)}-{range.max.toFixed(0)} kcal/100 g after fiber
        (0-2-4 kcal/g) and alcohol (7). EU-style estimate {estimate.toFixed(0)}. Entered{' '}
        {kcal.toFixed(0)} {inBand ? 'is inside the range' : 'is outside the range'}.
      </div>
      {impossible && <p className="text-sm text-red-700">{impossible}</p>}
      <details>
        <summary className="cursor-pointer text-sm font-medium">Other nutrients (per 100 g)</summary>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {EXTRA_NUTRIENTS.map((item) => (
            <div key={item.id} className="flex flex-col gap-1">
              <Label htmlFor={`n-${item.id}`}>
                {item.label} ({item.unit} / 100 g)
              </Label>
              <Input
                id={`n-${item.id}`}
                type="number"
                min={0}
                step="0.01"
                disabled={disabled}
                value={values[item.id] ?? ''}
                onChange={(event) => onChange(item.id, event.target.value)}
              />
            </div>
          ))}
        </div>
      </details>
      {diffs.length > 0 && (
        <div className="text-sm">
          <p className="font-medium mb-1">Pending changes</p>
          <ul className="list-disc pl-5 text-ink-dim">
            {diffs.map((line) => (
              <li key={line}>{line}</li>
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
