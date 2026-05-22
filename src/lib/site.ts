/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in production (e.g. https://calorieapi.com). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Calorie API';

export const SITE_TITLE =
  process.env.NEXT_PUBLIC_SITE_TITLE?.trim() ||
  `${SITE_NAME} — Food & Nutrition Database API`;

export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
  'Food & nutrition REST API with search, barcode lookup, macros per 100g, and autocomplete. Free tier for developers.';

export const LOGO_ALT = `${SITE_NAME} logo`;
export const HERO_IMAGE_ALT =
  'Healthy plant-based meals representing food and nutrition data for the Calorie API';

export const OG_IMAGE_ALT = HERO_IMAGE_ALT;

export const SITE_KEYWORDS = (
  process.env.NEXT_PUBLIC_SITE_KEYWORDS?.trim() ||
  'food nutrition API,calorie API,nutrition database API,food search API,barcode nutrition API,macro API,meal tracking API,REST food API,health app API'
)
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

/** Bump when replacing public/images/hero-bowl.jpg so Next/image and browsers fetch the new file. */
export const HERO_IMAGE_VERSION =
  process.env.NEXT_PUBLIC_HERO_IMAGE_VERSION?.trim() || '3';

export const HERO_IMAGE_SRC = `/images/hero-bowl.jpg?v=${HERO_IMAGE_VERSION}`;

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/** Social preview image (Open Graph / Twitter). */
export const OG_IMAGE_URL = absoluteUrl(HERO_IMAGE_SRC);

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
