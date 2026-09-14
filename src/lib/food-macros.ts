export const ATWATER_PROTEIN = 4
export const ATWATER_CARBS = 4
export const ATWATER_FAT = 9
export const ATWATER_ALCOHOL = 7
export const ATWATER_FIBER_EU = 2
export const MAX_KCAL_PER_100G = 902
export const MAX_MACRO_G = 100.5
export const ATWATER_AMBER = 10
export const ATWATER_RED = 25
export const ATWATER_BAND_REL_SLACK = 0.1
export const ATWATER_BAND_ABS_SLACK = 20
export const ATWATER_FIBER_INSIDE_CARBS_TOL = 0.51

export function availableCarbs(carbs: number, fiber: number): number {
  if (fiber <= carbs + ATWATER_FIBER_INSIDE_CARBS_TOL) {
    return Math.max(carbs - fiber, 0)
  }
  return carbs
}

export function atwaterKcal(
  protein: number,
  carbs: number,
  fat: number,
  alcohol = 0,
  fiber = 0
): number {
  return (
    protein * ATWATER_PROTEIN +
    availableCarbs(carbs, fiber) * ATWATER_CARBS +
    fiber * ATWATER_FIBER_EU +
    fat * ATWATER_FAT +
    alcohol * ATWATER_ALCOHOL
  )
}

export function atwaterEnergyRange(
  protein: number,
  carbs: number,
  fat: number,
  alcohol = 0,
  fiber = 0
): { min: number; max: number } {
  const base = protein * ATWATER_PROTEIN + fat * ATWATER_FAT + alcohol * ATWATER_ALCOHOL
  const available = availableCarbs(carbs, fiber)
  const low = base + available * ATWATER_CARBS
  const eu = low + fiber * ATWATER_FIBER_EU
  const high = fiber <= carbs + ATWATER_FIBER_INSIDE_CARBS_TOL ? base + carbs * ATWATER_CARBS : eu
  return { min: Math.min(low, eu, high), max: Math.max(low, eu, high) }
}

export function atwaterInBand(
  stated: number,
  range: { min: number; max: number },
  relSlack = ATWATER_BAND_REL_SLACK,
  absSlack = ATWATER_BAND_ABS_SLACK
): boolean {
  const min = range.min * (1 - relSlack) - absSlack
  const max = range.max * (1 + relSlack) + absSlack
  return stated >= min && stated <= max
}

export function atwaterDeltaPct(stated: number, computed: number): number | null {
  if (!Number.isFinite(stated) || !Number.isFinite(computed)) return null
  if (stated < 5 && computed < 5) return 0
  return ((stated - computed) / Math.max(computed, 1)) * 100
}

export function atwaterTone(deltaPct: number | null): 'green' | 'amber' | 'red' | 'neutral' {
  if (deltaPct === null) return 'neutral'
  const abs = Math.abs(deltaPct)
  if (abs < ATWATER_AMBER) return 'green'
  if (abs <= ATWATER_RED) return 'amber'
  return 'red'
}

export function atwaterToneForStated(
  stated: number,
  range: { min: number; max: number }
): 'green' | 'amber' | 'red' {
  if (atwaterInBand(stated, range)) return 'green'
  const dist = stated < range.min ? range.min - stated : stated - range.max
  if (dist <= ATWATER_BAND_ABS_SLACK || dist <= 0.1 * Math.max(range.max, 1)) return 'amber'
  return 'red'
}

export function physicallyImpossible(input: {
  kcal: number
  protein: number
  carbs: number
  fat: number
}): string | null {
  if (input.kcal < 0 || input.protein < 0 || input.carbs < 0 || input.fat < 0) {
    return 'Amounts cannot be negative'
  }
  if (input.kcal > MAX_KCAL_PER_100G) {
    return `Calories cannot exceed ${MAX_KCAL_PER_100G} per 100 g`
  }
  if (input.protein > MAX_MACRO_G || input.carbs > MAX_MACRO_G || input.fat > MAX_MACRO_G) {
    return `Each macro cannot exceed ${MAX_MACRO_G} g per 100 g`
  }
  if (input.protein + input.carbs + input.fat > MAX_MACRO_G) {
    return `Protein + carbs + fat cannot exceed ${MAX_MACRO_G} g per 100 g`
  }
  return null
}
