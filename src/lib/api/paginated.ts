import type { PaginatedResponse } from '@/types/api'

const ITEM_KEYS = ['data', 'results', 'items', 'foods'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** True when the payload is `{ data: T[], total: number, ... }`. */
export function isPaginatedEnvelope(value: unknown): value is PaginatedResponse {
  if (!isRecord(value)) return false
  return Array.isArray(value.data) && typeof value.total === 'number'
}

/**
 * Unwrap `{ data }` wrappers without dropping paginated envelopes.
 * `data.data || data` in the client turned search hits into a bare array and
 * discarded `total`, so the playground then read `array.data` and showed empty.
 */
export function unwrapSuccessPayload(body: unknown): unknown {
  if (!isRecord(body)) return body
  if (isPaginatedEnvelope(body)) return body
  if (body.data !== undefined && body.data !== null) return body.data
  return body
}

function pickItems<T>(record: Record<string, unknown>): T[] {
  for (const key of ITEM_KEYS) {
    const value = record[key]
    if (Array.isArray(value)) return value as T[]
  }
  return []
}

function asFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/** Normalize search/catalog payloads whether they are envelopes, arrays, or nested wraps. */
export function normalizePaginatedResponse<T>(payload: unknown): PaginatedResponse<T> {
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      total: payload.length,
      skip: 0,
      limit: payload.length,
    }
  }

  if (!isRecord(payload)) {
    return { data: [], total: 0, skip: 0, limit: 0 }
  }

  if (isRecord(payload.data) && isPaginatedEnvelope(payload.data)) {
    return normalizePaginatedResponse<T>(payload.data)
  }

  const items = pickItems<T>(payload)
  const total = asFiniteNumber(payload.total ?? payload.total_results ?? payload.count, items.length)

  return {
    data: items,
    total,
    skip: asFiniteNumber(payload.skip, 0),
    limit: asFiniteNumber(payload.limit, items.length),
  }
}

export function normalizeListPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!isRecord(payload)) return []
  if (Array.isArray(payload.data)) return payload.data as T[]
  return pickItems<T>(payload)
}
