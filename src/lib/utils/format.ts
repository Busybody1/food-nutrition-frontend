/** Coerce API values (string | null | Decimal-like) to a finite number. */
export function toNumber(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function formatMs(value: unknown, decimals = 1): string {
  return toNumber(value).toFixed(decimals)
}

export function formatPercent(value: unknown, decimals = 2): string {
  return toNumber(value).toFixed(decimals)
}

export function formatCount(value: unknown): string {
  return toNumber(value).toLocaleString()
}
