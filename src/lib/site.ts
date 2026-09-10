
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

export const OG_IMAGE_ALT =
  process.env.NEXT_PUBLIC_OG_IMAGE_ALT?.trim() ||
  `${SITE_NAME} - accurate nutrition data for developers`;

export const SITE_KEYWORDS = (
  process.env.NEXT_PUBLIC_SITE_KEYWORDS?.trim() ||
  'food calorie api,food API,nutrition API,food database API,calorie API,nutrition database API,food search API,barcode nutrition API,macro API,meal tracking API'
)
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

export const FOOD_DATABASE_SIZE_LABEL =
  process.env.NEXT_PUBLIC_FOOD_DATABASE_SIZE?.trim() || '4M+ foods';

/**
 * Headline plan facts used in page titles, comparison tables and marketing copy.
 *
 * These are deliberately static so titles stay stable at build time, but they MUST
 * match the live plans shown on /pricing (which are fetched from the API). If a plan
 * price or quota changes, update these too, or override per environment.
 *
 * Concrete numbers in a title are the single strongest lever for both click-through
 * and AI-answer citation, so keep them exact - never round or soften them.
 */
export const FREE_TIER_CALLS = Number(
  process.env.NEXT_PUBLIC_FREE_TIER_CALLS?.trim() || 1000
);
export const ENTRY_PLAN_PRICE_USD = Number(
  process.env.NEXT_PUBLIC_ENTRY_PLAN_PRICE_USD?.trim() || 15
);
export const ENTRY_PLAN_CALLS = Number(
  process.env.NEXT_PUBLIC_ENTRY_PLAN_CALLS?.trim() || 20000
);

const nf = new Intl.NumberFormat('en-US');

/** e.g. "1,000 free calls/month" */
export const FREE_TIER_LABEL = `${nf.format(FREE_TIER_CALLS)} free calls/month`;
/** e.g. "$15 for 20,000" - used after the free-tier label in titles */
export const ENTRY_PLAN_LABEL = `$${ENTRY_PLAN_PRICE_USD} for ${nf.format(ENTRY_PLAN_CALLS)}`;
/** e.g. "Free tier: 1,000 calls/month. Paid from $15/mo for 20,000 calls." */
export const PRICING_SENTENCE =
  `Free tier: ${nf.format(FREE_TIER_CALLS)} calls/month. ` +
  `Paid from $${ENTRY_PLAN_PRICE_USD}/mo for ${nf.format(ENTRY_PLAN_CALLS)} calls.`;

export const HERO_IMAGE_VERSION =
  process.env.NEXT_PUBLIC_HERO_IMAGE_VERSION?.trim() || '3';

export const HERO_IMAGE_SRC = `/images/hero-bowl.jpg?v=${HERO_IMAGE_VERSION}`;

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SOFTWARE_ID = `${SITE_URL}/#software`;
export const WEBAPI_ID = `${SITE_URL}/#api`;

export const DEFAULT_OG_IMAGE_PATH = '/images/bg-banner.png';

export const OG_IMAGE_VERSION =
  process.env.NEXT_PUBLIC_OG_IMAGE_VERSION?.trim() || '1';

function resolveOgImageUrl(): string {
  const envOverride = process.env.NEXT_PUBLIC_OG_IMAGE_URL?.trim();
  if (envOverride) {
    return envOverride.startsWith('http') ? envOverride : absoluteUrl(envOverride);
  }
  return absoluteUrl(`${DEFAULT_OG_IMAGE_PATH}?v=${OG_IMAGE_VERSION}`);
}

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

export const ORG_SAMEAS = (process.env.NEXT_PUBLIC_ORG_SAMEAS || '')
  .split(',')
  .map((url) => url.trim())
  .filter((url) => url.startsWith('http'));

export const ORG_FOUNDING_DATE =
  process.env.NEXT_PUBLIC_ORG_FOUNDING_DATE?.trim() || '';

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'busybody.office@gmail.com';

export const PRIVACY_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || SUPPORT_EMAIL;

export const LEGAL_EMAIL =
  process.env.NEXT_PUBLIC_LEGAL_EMAIL?.trim() || SUPPORT_EMAIL;

export const DPO_EMAIL =
  process.env.NEXT_PUBLIC_DPO_EMAIL?.trim() || SUPPORT_EMAIL;

export const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS?.trim() ||
  'Address not configured, set NEXT_PUBLIC_COMPANY_ADDRESS';

export const SERVER_REGION =
  process.env.NEXT_PUBLIC_SERVER_REGION?.trim() ||
  'Not specified, set NEXT_PUBLIC_SERVER_REGION';

export const JURISDICTION =
  process.env.NEXT_PUBLIC_JURISDICTION?.trim() ||
  'Not specified, set NEXT_PUBLIC_JURISDICTION';

export const ARBITRATION_BODY =
  process.env.NEXT_PUBLIC_ARBITRATION_BODY?.trim() ||
  'Not specified, set NEXT_PUBLIC_ARBITRATION_BODY';

export const ARBITRATION_LOCATION =
  process.env.NEXT_PUBLIC_ARBITRATION_LOCATION?.trim() ||
  'Not specified, set NEXT_PUBLIC_ARBITRATION_LOCATION';
