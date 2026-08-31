/** Public OpenAPI for /openapi.json: allowlist product paths, brand the spec, drop unused schemas. */

export type PublicOpenApiSite = {
  siteName: string
  siteDescription: string
  siteUrl: string
  supportEmail: string
  apiBaseUrl: string
  docsUrl: string
  termsUrl: string
  licenseUrl: string
}

type JsonObject = Record<string, unknown>

export const OPENAPI_FETCH_MAX_BYTES = 2 * 1024 * 1024

const PRODUCT_PATH_PREFIXES = [
  '/api/v1/search',
  '/api/v1/foods',
  '/api/v1/catalog',
  '/api/v1/calc',
  '/api/v1/auth',
] as const

/** True when the path is a public product endpoint (not admin/webhooks/demo). */
export function isPublicProductPath(path: string): boolean {
  if (path === '/health') return true
  return PRODUCT_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** Hardcoded /openapi.json on the configured API origin only — never a caller URL. */
export function resolveOpenApiSourceUrl(apiBase: string): string | null {
  const trimmed = apiBase.trim()
  if (!trimmed) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  const isLoopback = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  if (parsed.protocol === 'http:' && !isLoopback) return null
  if (parsed.username || parsed.password) return null

  return `${parsed.origin}/openapi.json`
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectRefs(value: unknown, into: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, into)
    return
  }
  if (!isJsonObject(value)) return
  const ref = value.$ref
  if (typeof ref === 'string' && ref.startsWith('#/components/')) {
    into.add(ref)
  }
  for (const nested of Object.values(value)) {
    collectRefs(nested, into)
  }
}

function parseComponentRef(ref: string): { section: string; name: string } | null {
  const match = /^#\/components\/([^/]+)\/(.+)$/.exec(ref)
  if (!match) return null
  return { section: match[1], name: match[2] }
}

function pruneUnusedComponents(components: JsonObject, usedRefs: Set<string>): JsonObject {
  const pending = new Set(usedRefs)
  const kept = new Set<string>()

  while (pending.size > 0) {
    const ref = pending.values().next().value as string
    pending.delete(ref)
    if (kept.has(ref)) continue
    kept.add(ref)
    const parsed = parseComponentRef(ref)
    if (!parsed) continue
    const section = components[parsed.section]
    if (!isJsonObject(section)) continue
    collectRefs(section[parsed.name], pending)
  }

  const pruned: JsonObject = {}
  for (const [sectionName, sectionValue] of Object.entries(components)) {
    if (!isJsonObject(sectionValue)) continue
    const keptEntries: JsonObject = {}
    for (const name of Object.keys(sectionValue)) {
      if (kept.has(`#/components/${sectionName}/${name}`)) {
        keptEntries[name] = sectionValue[name]
      }
    }
    if (Object.keys(keptEntries).length > 0) {
      pruned[sectionName] = keptEntries
    }
  }
  return pruned
}

function usedTagNames(paths: JsonObject): Set<string> {
  const names = new Set<string>()
  for (const operations of Object.values(paths)) {
    if (!isJsonObject(operations)) continue
    for (const operation of Object.values(operations)) {
      if (!isJsonObject(operation)) continue
      const tags = operation.tags
      if (!Array.isArray(tags)) continue
      for (const tag of tags) {
        if (typeof tag === 'string') names.add(tag)
      }
    }
  }
  return names
}

/** Filter a FastAPI spec down to the public product API and brand it. */
export function toPublicOpenApiDocument(raw: unknown, site: PublicOpenApiSite): JsonObject {
  if (!isJsonObject(raw) || !isJsonObject(raw.paths) || typeof raw.openapi !== 'string') {
    throw new Error('invalid_openapi')
  }

  const publicPaths: JsonObject = {}
  for (const [path, operations] of Object.entries(raw.paths)) {
    if (isPublicProductPath(path)) {
      publicPaths[path] = operations
    }
  }

  const usedRefs = new Set<string>()
  collectRefs(publicPaths, usedRefs)

  const rawComponents = isJsonObject(raw.components) ? raw.components : {}
  const components = pruneUnusedComponents(rawComponents, usedRefs)
  const tagAllow = usedTagNames(publicPaths)
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((tag) => isJsonObject(tag) && typeof tag.name === 'string' && tagAllow.has(tag.name))
    : undefined

  const sourceUrl = resolveOpenApiSourceUrl(site.apiBaseUrl)
  if (!sourceUrl) {
    throw new Error('invalid_api_origin')
  }
  const apiOrigin = new URL(sourceUrl).origin

  const document: JsonObject = {
    openapi: raw.openapi,
    info: {
      title: site.siteName,
      description: site.siteDescription,
      version: isJsonObject(raw.info) && typeof raw.info.version === 'string' ? raw.info.version : '1.0.0',
      contact: {
        name: site.siteName,
        url: site.siteUrl,
        email: site.supportEmail,
      },
      termsOfService: site.termsUrl,
      license: {
        name: 'Commercial',
        url: site.licenseUrl,
      },
    },
    servers: [{ url: apiOrigin, description: 'Production' }],
    externalDocs: {
      description: `${site.siteName} documentation`,
      url: site.docsUrl,
    },
    paths: publicPaths,
  }

  if (Object.keys(components).length > 0) {
    document.components = components
  }
  if (tags && tags.length > 0) {
    document.tags = tags
  }

  return document
}

/** Fetch the backend spec from the configured API origin and publish a sanitized copy. */
export async function loadPublicOpenApiDocument(
  site: PublicOpenApiSite,
  fetchImpl: typeof fetch = fetch
): Promise<JsonObject> {
  const sourceUrl = resolveOpenApiSourceUrl(site.apiBaseUrl)
  if (!sourceUrl) {
    throw new Error('invalid_api_origin')
  }

  const response = await fetchImpl(sourceUrl, {
    method: 'GET',
    redirect: 'error',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('openapi_upstream')
  }

  const contentLength = Number(response.headers.get('content-length') || '0')
  if (contentLength > OPENAPI_FETCH_MAX_BYTES) {
    throw new Error('openapi_too_large')
  }

  const body = await response.text()
  if (body.length > OPENAPI_FETCH_MAX_BYTES) {
    throw new Error('openapi_too_large')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error('openapi_invalid_json')
  }

  return toPublicOpenApiDocument(parsed, site)
}
