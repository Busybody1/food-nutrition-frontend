/** Normalize API key list payloads from GET /users/api-keys (raw array or wrapped). */
export interface ApiKeyRecord {
  id: number
  name: string
  key?: string | null
  is_active: boolean
  last_used_at: string | null
  created_at: string | null
  usage_count?: number
}

export interface CreatedApiKeyResult {
  id: number
  name: string
  key: string
}

const CREATED_KEY_PREFIX = 'api_key_plaintext:'

export function isApiKeyPlaintext(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.startsWith('fn_') && value.length > 10
}

export function normalizeApiKeyList(payload: unknown): ApiKeyRecord[] {
  let raw: unknown[] = []
  if (Array.isArray(payload)) {
    raw = payload
  } else if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.data)) raw = obj.data
    else if (Array.isArray(obj.api_keys)) raw = obj.api_keys
    else if (Array.isArray(obj.items)) raw = obj.items
  }

  return raw
    .map((item): ApiKeyRecord | null => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const id = Number(row.id ?? row.key_id)
      const name = typeof row.name === 'string' ? row.name.trim() : ''
      if (!Number.isFinite(id) || id <= 0 || !name) return null
      const key = typeof row.key === 'string' ? row.key : null
      const record: ApiKeyRecord = {
        id,
        name,
        is_active: row.is_active === true || row.is_active === 'true',
        last_used_at: (row.last_used_at as string | null) ?? null,
        created_at: (row.created_at as string | null) ?? null,
      }
      if (isApiKeyPlaintext(key)) record.key = key
      if (typeof row.usage_count === 'number') record.usage_count = row.usage_count
      return record
    })
    .filter((k): k is ApiKeyRecord => k !== null)
}

export function stashCreatedApiKeyPlaintext(id: number, plaintext: string): void {
  if (typeof window === 'undefined' || !isApiKeyPlaintext(plaintext)) return
  try {
    localStorage.setItem(`${CREATED_KEY_PREFIX}${id}`, plaintext)
  } catch {
    /* ignore quota errors */
  }
}

export function getStashedApiKeyPlaintext(id: number): string | null {
  if (typeof window === 'undefined') return null
  try {
    const value = localStorage.getItem(`${CREATED_KEY_PREFIX}${id}`)
    return isApiKeyPlaintext(value) ? value : null
  } catch {
    return null
  }
}

export function resolveApiKeyPlaintext(id: number, inline?: string | null): string | null {
  if (isApiKeyPlaintext(inline)) return inline
  return getStashedApiKeyPlaintext(id)
}

export function formatMaskedApiKey(plaintext: string | null | undefined): string {
  if (!isApiKeyPlaintext(plaintext)) {
    return 'Hidden — copy only available right after creation'
  }
  if (plaintext.length <= 12) return plaintext
  return `${plaintext.slice(0, 8)}...${plaintext.slice(-4)}`
}

export function removeStashedApiKeyPlaintext(id: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(`${CREATED_KEY_PREFIX}${id}`)
  } catch {
    /* ignore */
  }
}

export function clearStashedApiKeys(): void {
  if (typeof window === 'undefined') return
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(CREATED_KEY_PREFIX)) keysToRemove.push(k)
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}
