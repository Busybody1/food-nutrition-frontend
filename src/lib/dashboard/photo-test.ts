export interface PhotoTestBlock {
  used_this_month: number
  monthly_cap: number
  used_today?: number
  daily_cap?: number
  resets_on: string
  ends_on: string | null
}

function utcDate(iso: string | null | undefined): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatResetDay(iso: string | null | undefined): string {
  const date = utcDate(iso)
  if (!date) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function formatEndDay(iso: string | null | undefined): string {
  const date = utcDate(iso)
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function count(value: number): string {
  const safe = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  return safe.toLocaleString('en-US')
}

export function photoTestSentence(block: PhotoTestBlock | null | undefined): string | null {
  if (!block) return null
  const parts = [`Photo test: ${count(block.used_this_month)} of ${count(block.monthly_cap)} used this month.`]
  const resets = formatResetDay(block.resets_on)
  if (resets) parts.push(`Resets ${resets}.`)
  const ends = formatEndDay(block.ends_on)
  if (ends) parts.push(`Ends ${ends}.`)
  return parts.join(' ')
}
