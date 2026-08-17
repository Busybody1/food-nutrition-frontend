const CALENDLY_HOST = 'calendly.com'
const DEFAULT_CALENDLY_ENTERPRISE_URL = 'https://calendly.com/busybodycomp/30min'

/** Only allow https Calendly URLs so an env misconfig cannot become an iframe XSS vector. */
export function resolveCalendlyUrl(raw: string | undefined): string {
  const candidate = raw?.trim() || DEFAULT_CALENDLY_ENTERPRISE_URL
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:') return DEFAULT_CALENDLY_ENTERPRISE_URL
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (host !== CALENDLY_HOST && !host.endsWith(`.${CALENDLY_HOST}`)) {
      return DEFAULT_CALENDLY_ENTERPRISE_URL
    }
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return DEFAULT_CALENDLY_ENTERPRISE_URL
  }
}

export const CALENDLY_ENTERPRISE_URL = resolveCalendlyUrl(
  process.env.NEXT_PUBLIC_CALENDLY_ENTERPRISE_URL
)

export function calendlyEmbedSrc(pageUrl = CALENDLY_ENTERPRISE_URL): string {
  const url = new URL(resolveCalendlyUrl(pageUrl))
  url.searchParams.set('hide_gdpr_banner', '1')
  return url.toString()
}
