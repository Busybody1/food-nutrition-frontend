type CanonicalSite = {
  host: string;
};

/** Parse production canonical host from NEXT_PUBLIC_SITE_URL (no www, no trailing slash). */
export function parseCanonicalSite(siteUrl: string | undefined): CanonicalSite | null {
  if (!siteUrl?.trim()) return null;

  try {
    const url = new URL(siteUrl.trim());
    const hostname = url.hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1'
    ) {
      return null;
    }

    return { host: hostname.replace(/^www\./, '') };
  } catch {
    return null;
  }
}

type RedirectInput = {
  pathname: string;
  search: string;
  protocol: string;
  host: string | null;
  forwardedProto: string | null;
  siteUrl: string | undefined;
};

/** Returns an absolute https URL when the request should 301 to the canonical host. */
export function getCanonicalRedirectUrl(input: RedirectInput): string | null {
  const canonical = parseCanonicalSite(input.siteUrl);
  if (!canonical) return null;

  const requestHost = input.host?.split(':')[0]?.toLowerCase();
  if (!requestHost) return null;

  const isHttps =
    input.forwardedProto === 'https' || input.protocol === 'https:';
  const needsHttpsRedirect = !isHttps;
  const needsHostRedirect = requestHost !== canonical.host;

  if (!needsHttpsRedirect && !needsHostRedirect) return null;

  const path = `${input.pathname}${input.search}`;
  return `https://${canonical.host}${path}`;
}
