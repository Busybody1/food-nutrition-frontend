/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in production (e.g. https://calorieapi.com). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Calorie API';

export const SITE_TITLE =
  process.env.NEXT_PUBLIC_SITE_TITLE?.trim() ||
  `Food Calorie API for Developers | ${SITE_NAME}`;

export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
  'Food calorie API for developers: REST search, barcode lookup, macros per 100g, and autocomplete across our food database API. Free tier for nutrition apps.';

export const LOGO_ALT = `${SITE_NAME} logo`;
export const HERO_IMAGE_ALT =
  'Healthy plant-based meals representing nutrition and food data for the Calorie API';

/** Alt text for link previews (Open Graph / Twitter) — all pages share one image. */
export const OG_IMAGE_ALT =
  process.env.NEXT_PUBLIC_OG_IMAGE_ALT?.trim() ||
  `${SITE_NAME} — accurate nutrition data for developers`;

export const SITE_KEYWORDS = (
  process.env.NEXT_PUBLIC_SITE_KEYWORDS?.trim() ||
  'food calorie api,food API,nutrition API,food database API,calorie API,nutrition database API,food search API,barcode nutrition API,macro API,meal tracking API'
)
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

/** Marketing label for catalog size — override with NEXT_PUBLIC_FOOD_DATABASE_SIZE. */
export const FOOD_DATABASE_SIZE_LABEL =
  process.env.NEXT_PUBLIC_FOOD_DATABASE_SIZE?.trim() || '4M+ foods';

/** Bump when replacing public/images/hero-bowl.jpg so Next/image and browsers fetch the new file. */
export const HERO_IMAGE_VERSION =
  process.env.NEXT_PUBLIC_HERO_IMAGE_VERSION?.trim() || '3';

export const HERO_IMAGE_SRC = `/images/hero-bowl.jpg?v=${HERO_IMAGE_VERSION}`;

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/** Stable JSON-LD @id anchors so Organization/WebSite/API nodes form one entity graph. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SOFTWARE_ID = `${SITE_URL}/#software`;
export const WEBAPI_ID = `${SITE_URL}/#api`;

/** Default social preview asset under /public. Override entirely with NEXT_PUBLIC_OG_IMAGE_URL. */
export const DEFAULT_OG_IMAGE_PATH = '/images/bg-banner.png';

/** Bump when replacing the default OG file so crawlers fetch the new image. */
export const OG_IMAGE_VERSION =
  process.env.NEXT_PUBLIC_OG_IMAGE_VERSION?.trim() || '1';

function resolveOgImageUrl(): string {
  const envOverride = process.env.NEXT_PUBLIC_OG_IMAGE_URL?.trim();
  if (envOverride) {
    return envOverride.startsWith('http') ? envOverride : absoluteUrl(envOverride);
  }
  return absoluteUrl(`${DEFAULT_OG_IMAGE_PATH}?v=${OG_IMAGE_VERSION}`);
}

/** Social preview image (Open Graph / Twitter) — one image for all shared links. */
export const OG_IMAGE_URL = resolveOgImageUrl();

export function ogImageMimeType(url: string): string {
  const path = url.split('?')[0].toLowerCase();
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

export const LEGAL_NAME =
  process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() || 'BusyBody FIT LTD';

/** Comma-separated profile URLs (GitHub org, X, LinkedIn, directories) for Organization sameAs. */
export const ORG_SAMEAS = (process.env.NEXT_PUBLIC_ORG_SAMEAS || '')
  .split(',')
  .map((url) => url.trim())
  .filter((url) => url.startsWith('http'));

/** ISO date (YYYY-MM-DD) — emitted as Organization foundingDate when set. */
export const ORG_FOUNDING_DATE =
  process.env.NEXT_PUBLIC_ORG_FOUNDING_DATE?.trim() || '';

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'busybody.office@gmail.com';

/** Legal / privacy contact — defaults to support email. */
export const PRIVACY_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || SUPPORT_EMAIL;

export const LEGAL_EMAIL =
  process.env.NEXT_PUBLIC_LEGAL_EMAIL?.trim() || SUPPORT_EMAIL;

export const DPO_EMAIL =
  process.env.NEXT_PUBLIC_DPO_EMAIL?.trim() || SUPPORT_EMAIL;

export const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS?.trim() ||
  'Address not configured — set NEXT_PUBLIC_COMPANY_ADDRESS';

export const SERVER_REGION =
  process.env.NEXT_PUBLIC_SERVER_REGION?.trim() ||
  'Not specified — set NEXT_PUBLIC_SERVER_REGION';

export const JURISDICTION =
  process.env.NEXT_PUBLIC_JURISDICTION?.trim() ||
  'Not specified — set NEXT_PUBLIC_JURISDICTION';

export const ARBITRATION_BODY =
  process.env.NEXT_PUBLIC_ARBITRATION_BODY?.trim() ||
  'Not specified — set NEXT_PUBLIC_ARBITRATION_BODY';

export const ARBITRATION_LOCATION =
  process.env.NEXT_PUBLIC_ARBITRATION_LOCATION?.trim() ||
  'Not specified — set NEXT_PUBLIC_ARBITRATION_LOCATION';
