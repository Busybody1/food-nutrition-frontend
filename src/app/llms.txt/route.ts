import { NextResponse } from 'next/server';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SUPPORT_EMAIL } from '@/lib/site';

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## Overview
${SITE_NAME} is a REST API for food and nutrition data. Developers use API keys (X-API-Key header) or JWT from the dashboard.

## Base URL
- API: configured per deployment (see developer docs)
- Website: ${SITE_URL}

## Key endpoints
- GET /api/v1/search/foods — search with q, limit, skip, match_mode (any|all), verified_only
- GET /api/v1/search/suggest — autocomplete (q, limit)
- GET /api/v1/search/barcode/{upc} — barcode lookup
- GET /api/v1/public/search/foods — IP-rate-limited public demo (no API key)

## Authentication
- Header: X-API-Key: <your_key>
- Or: Authorization: Bearer <jwt>

## Pricing
See ${SITE_URL}/pricing for Free, Core, and Plus tiers with monthly quotas.

## Documentation
${SITE_URL}/docs

## Support
${SUPPORT_EMAIL}

## Legal
${SITE_URL}/privacy
${SITE_URL}/terms
`;

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
