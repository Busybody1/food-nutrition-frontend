import type { FaqItem } from '@/lib/faq-data'

export const MCP_MONTHLY_USD = 29
export const MCP_ANNUAL_USD = 228

export const MCP_PAID_LIMITS = {
  perMinute: 20,
  perMonth: 10000,
  results: 25,
  visionMonth: 150,
  visionDay: 20,
} as const

export const MCP_TRIAL_LIMITS = {
  days: 7,
  perMinute: 5,
  totalCalls: 200,
  results: 10,
  visionTotal: 10,
} as const

export type McpTool = {
  name: string
  summary: string
  args: string
}

export const MCP_TOOLS: readonly McpTool[] = [
  {
    name: 'search_foods',
    summary: 'Search the catalog by name and return calories and macros per 100 g, plus a food_id.',
    args: 'query, limit (1-25), verified_only',
  },
  {
    name: 'get_food_nutrition',
    summary: 'Full nutrient list for one food_id from search_foods.',
    args: 'food_id',
  },
  {
    name: 'suggest_foods',
    summary: 'Short autocomplete suggestions for a partial food name.',
    args: 'query',
  },
  {
    name: 'lookup_barcode',
    summary: 'UPC or EAN digits to macros per 100 g. Open Food Facts is the fallback when the catalog misses.',
    args: 'upc (8-14 digits)',
  },
  {
    name: 'calculate_portion',
    summary: 'Scale one food_id to a gram weight.',
    args: 'food_id, grams',
  },
  {
    name: 'calculate_recipe',
    summary: 'Totals and per-serving macros for up to 40 ingredients.',
    args: 'ingredients[{food_id, grams}], servings',
  },
  {
    name: 'calculate_macro_targets',
    summary: 'Daily calorie and macro targets from age, sex, weight, height, activity, and goal.',
    args: 'age, gender, weight_kg, height_cm, activity, goal',
  },
  {
    name: 'analyze_food_photo',
    summary: 'Estimate foods in a JPEG, PNG, or WebP. Pass image_base64 yourself.',
    args: 'image_base64, content_type',
  },
]

export function mcpOauthConnectEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MCP_OAUTH_ENABLED === 'true'
}

export function claudeAppsConnectSentence(): string {
  if (mcpOauthConnectEnabled()) {
    return 'Claude.ai, Claude Desktop, and Claude mobile use the sign-in screen. Claude Code and Cursor use an API key header.'
  }
  return 'Claude Code and Cursor use an API key header. Browser sign-in for Claude apps stays off until the API enables OAuth.'
}

export const MCP_PAGE_FAQS: readonly FaqItem[] = [
  {
    q: 'What is this MCP service?',
    a: 'A nutrition server for assistants. Claude Code and Cursor call it over the Model Context Protocol to search foods, scale portions, total recipes, look up barcodes, set daily targets, or estimate a photo. The answers come from the catalog, not from the model guessing.',
  },
  {
    q: 'Which clients work?',
    a: 'Claude Code and Cursor, with an API key in the X-API-Key header. Claude.ai, Claude Desktop, and Claude mobile use browser sign-in once OAuth is enabled on the API.',
  },
  {
    q: 'Does this include the REST API?',
    a: 'No. This plan calls the MCP tools only. REST search, foods, calc, and vision return 403. Account and billing pages still work.',
  },
  {
    q: 'How do photos work?',
    a: 'analyze_food_photo takes image_base64 (JPEG, PNG, or WebP, up to 2 MB, no data: prefix). The chat app does not attach the file for you. A URL is not accepted.',
  },
  {
    q: 'What does the trial include?',
    a: '7 days, card required. Trial: 5 calls/min, 200 calls total, 10 results, 10 photos. Paid: 20/min, 10,000/month, 25 results, 150 photos/month and 20 photos/day.',
  },
  {
    q: 'Is this for a commercial app?',
    a: 'No. Personal use only. A commercial header is rejected. An app that resells the data needs a REST plan and a commercial license.',
  },
  {
    q: 'Will I be charged when the trial ends?',
    a: 'Yes, unless you cancel before the trial ends. Cancel from the billing page. Annual is $19/month. Monthly is $29. $120 USD Off on annual.',
  },
  {
    q: 'Where do I get the API key?',
    a: 'Dashboard, API keys, after checkout. The full key is shown once, when you create it. It is not emailed. Do not put it in a public repo.',
  },
  {
    q: 'What does personal use mean?',
    a: 'You use the tools in your own assistant. Reselling the data, or putting it in a product other people pay for, needs a commercial REST plan. Limits are sized for one person, not for scraping the catalog.',
  },
]

export const MCP_FAQS: readonly FaqItem[] = [
  {
    q: 'Which clients can connect?',
    a: mcpOauthConnectEnabled()
      ? 'Claude Code and Cursor send an X-API-Key header. Claude.ai, Claude Desktop, and Claude mobile add the server URL and open a Calorie API sign-in. Approve access there. The account must be on the MCP plan. Do not paste the API key into those apps.'
      : 'Claude Code and Cursor send an X-API-Key header. Browser sign-in for Claude.ai, Claude Desktop, and Claude mobile stays off until the API enables OAuth. The account must be on the MCP plan.',
  },
  {
    q: 'Does this plan include the REST API?',
    a: 'No. MCP tools only. REST search, foods, calc, and vision return 403. Billing and account pages still work.',
  },
  {
    q: 'What are the trial limits?',
    a: '7 days, card required. Trial: 5/min, 200 calls total, 10 results, 10 photos. Paid: 20/min, 10,000/month, 25 results, 150 photos/month, 20 photos/day.',
  },
  {
    q: 'Is this for a commercial app?',
    a: 'No. Personal use only. A commercial header is rejected. Apps that resell the data need a REST plan and a commercial license.',
  },
  {
    q: 'How do food photos work?',
    a: 'Pass image_base64 yourself. JPEG, PNG, or WebP, up to 2 MB, no data: prefix.',
  },
  {
    q: 'Will I be charged when the trial ends?',
    a: 'Yes, unless you cancel before the trial ends. Cancel from the billing page.',
  },
  {
    q: 'Where do I get the API key?',
    a: 'Dashboard, API keys, after checkout. The full key is shown once, when you create it. It is not emailed.',
  },
  {
    q: 'What does personal use mean?',
    a: 'You use the tools in your own assistant. Reselling the data or putting it in a product other people pay for needs a commercial REST plan.',
  },
  {
    q: 'How is annual billing priced?',
    a: '$19/month if you buy annual. Monthly is $29. $120 USD Off.',
  },
]

export function mcpEndpoint(): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://calorieapiadmin.com').replace(/\/$/, '')
  return `${base}/mcp`
}

export function annualAsMonthlyUsd(annual: number): number {
  if (!Number.isFinite(annual) || annual <= 0) return 0
  return Math.round(annual / 12)
}

export function annualSavingsUsd(monthly: number, annual: number): number {
  if (!Number.isFinite(monthly) || !Number.isFinite(annual) || monthly < 0 || annual < 0) return 0
  const saved = Math.round(monthly * 12 - annual)
  return saved > 0 ? saved : 0
}

export function claudeCodeCommand(url: string = mcpEndpoint()): string {
  return `claude mcp add --transport http calorie-api ${url} --header "X-API-Key: YOUR_KEY"`
}

export function cursorConfig(url: string = mcpEndpoint(), apiKey = 'YOUR_KEY'): string {
  return JSON.stringify(
    {
      mcpServers: {
        'calorie-api': {
          url,
          headers: { 'X-API-Key': apiKey },
        },
      },
    },
    null,
    2
  )
}

export function claudeOAuthSteps(url: string = mcpEndpoint()): string {
  if (!mcpOauthConnectEnabled()) {
    return [
      `Server URL: ${url}`,
      'Browser sign-in is off on this server until the API enables OAuth.',
      'Use the Claude Code or Cursor tab with an API key until then.',
    ].join('\n')
  }
  return [
    `Server URL: ${url}`,
    'Transport: HTTP (streamable)',
    'Auth: OAuth sign-in. Do not paste an API key.',
    'In Claude.ai, Claude Desktop, or Claude mobile, add this URL as a custom connector.',
    'Approve the Calorie API consent screen. The account must be on the MCP plan.',
  ].join('\n')
}

export function genericHeaderConfig(url: string = mcpEndpoint()): string {
  return [
    `URL: ${url}`,
    'Transport: HTTP (streamable)',
    'Header: X-API-Key: YOUR_KEY',
    mcpOauthConnectEnabled()
      ? 'Use this for clients that can set a header. Claude.ai, Claude Desktop, and Claude mobile use the sign-in screen instead.'
      : 'Use this for clients that can set a header. Browser sign-in for Claude apps stays off until the API enables OAuth.',
  ].join('\n')
}

const SAFE_NEXT_PREFIXES = ['/mcp', '/dashboard']

export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null
  const value = raw.trim()
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.includes('://')) {
    return null
  }
  const path = value.split('?')[0].split('#')[0]
  if (path !== '/oauth/consent' && !SAFE_NEXT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return null
  }
  return value
}

export type McpTrialClick = 'login' | 'wait' | 'closed' | 'checkout'

export function mcpTrialClick(input: {
  loading: boolean
  isAuthenticated: boolean
  hasSession: boolean
  checkoutOpen: boolean
}): McpTrialClick {
  if (!input.isAuthenticated) {
    if (input.loading && input.hasSession) return 'wait'
    return 'login'
  }
  if (!input.checkoutOpen) return 'closed'
  return 'checkout'
}

export function isSafeOAuthRedirect(raw: string, expectedHost: string): boolean {
  try {
    const url = new URL(raw)
    if (url.username || url.password) return false
    const host = url.hostname.toLowerCase()
    const expected = expectedHost.trim().toLowerCase()
    if (!expected || host !== expected) return false
    if (url.protocol === 'https:') return true
    if (url.protocol === 'http:' && (host === 'localhost' || host === '127.0.0.1')) return true
    return false
  } catch {
    return false
  }
}
