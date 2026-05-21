/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in production (e.g. https://calorieapi.com). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Calorie API';

export const SITE_DESCRIPTION =
  'Food and nutrition database API with advanced search, barcode lookup, and verified macros. Built for health, fitness, and meal-tracking apps.';

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@calorieapi.com';

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

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}
