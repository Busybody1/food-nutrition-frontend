export type PilotState = 'off' | 'active' | 'expired'
export type PilotMeter = 'pilot' | 'credits' | 'mcp'
export type PilotPillTone = 'neutral' | 'green' | 'orange'

export const PILOT_REASON_MAX = 200

export interface PilotStatusFields {
  state: PilotState
  enabled: boolean
  expires_on: string | null
  reason: string | null
  meter: PilotMeter | null
  plan_name: string | null
  platform_enabled: boolean
  today: string
  default_expires_on: string
  max_expires_on: string
}

export interface PilotDraft {
  enabled: boolean
  expiresOn: string
  reason: string
}

export interface PilotRequestBody {
  enabled: boolean
  expires_on?: string
  reason?: string
}

export function initialPilotDraft(status: PilotStatusFields): PilotDraft {
  const keepsDate = status.state === 'active' && Boolean(status.expires_on)
  return {
    enabled: status.enabled,
    expiresOn: keepsDate ? (status.expires_on as string) : status.default_expires_on,
    reason: status.reason ?? '',
  }
}

export function pilotRequestBody(status: PilotStatusFields, draft: PilotDraft): PilotRequestBody | null {
  if (!draft.enabled) {
    return status.enabled ? { enabled: false } : null
  }
  const reason = draft.reason.trim()
  const body: PilotRequestBody = { enabled: true, expires_on: draft.expiresOn, reason }
  if (status.state !== 'active') return body
  const sameDate = draft.expiresOn === (status.expires_on ?? '')
  const sameReason = reason === (status.reason ?? '').trim()
  return sameDate && sameReason ? null : body
}

export function pilotEndDateError(value: string, today: string, max: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Pick an end date.'
  if (value < today) return 'The end date cannot be in the past.'
  if (value > max) return 'The end date cannot be more than 365 days away.'
  return null
}

export function pilotReasonError(value: string): string | null {
  const reason = value.trim()
  if (!reason) return 'A reason is required to turn the pilot on.'
  if (reason.length > PILOT_REASON_MAX) return `Keep the reason to ${PILOT_REASON_MAX} characters.`
  return null
}

export function pilotDraftError(status: PilotStatusFields, draft: PilotDraft): string | null {
  if (!draft.enabled) return null
  return (
    pilotReasonError(draft.reason) ??
    pilotEndDateError(draft.expiresOn, status.today, status.max_expires_on)
  )
}

export function pilotCanSave(status: PilotStatusFields, draft: PilotDraft, busy = false): boolean {
  if (busy) return false
  if (!pilotRequestBody(status, draft)) return false
  return pilotDraftError(status, draft) === null
}

export function pilotPill(state: PilotState): { label: string; tone: PilotPillTone } {
  if (state === 'active') return { label: 'Active', tone: 'green' }
  if (state === 'expired') return { label: 'Expired', tone: 'orange' }
  return { label: 'Off', tone: 'neutral' }
}

export function formatPilotDate(iso: string | null | undefined): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return ''
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatPilotTimestamp(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const day = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
  return `${day}, ${time} UTC`
}

export function pilotNotes(status: PilotStatusFields, mcpSupported = true): string[] {
  const notes: string[] = []
  if (!status.platform_enabled) {
    notes.push('The pilot is switched off for the whole platform. Grants are saved but not applied.')
  }
  if (status.state === 'expired') {
    notes.push(`Ended ${formatPilotDate(status.expires_on)}. Set a new end date to resume.`)
  }
  if (status.meter === 'credits') {
    notes.push(
      `This account is on ${status.plan_name || 'its plan'}. That plan already includes photo analysis, billed in credits. The 100 call cap is not added.`
    )
  }
  if (status.meter === 'mcp') {
    notes.push(
      mcpSupported
        ? 'This account is on the MCP plan. Saving opens the REST photo endpoint for it. Calls draw from the MCP photo allowance of 150 a month and 20 a day. The 100 call cap is not added.'
        : 'The pilot does not apply to the MCP plan in this release.'
    )
  }
  return notes
}

export function usageText(used: number, cap: number): string {
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.floor(used) : 0
  const safeCap = Number.isFinite(cap) && cap > 0 ? Math.floor(cap) : 0
  return `${safeUsed.toLocaleString('en-US')} / ${safeCap.toLocaleString('en-US')}`
}

export function usagePercent(used: number, cap: number): number {
  if (!Number.isFinite(used) || !Number.isFinite(cap) || cap <= 0 || used <= 0) return 0
  return Math.min(100, (used / cap) * 100)
}

export function failedTodayText(failed: number): string | null {
  if (!Number.isFinite(failed) || failed <= 0) return null
  return `${Math.floor(failed)} failed today`
}
