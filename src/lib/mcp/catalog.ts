import type { FaqItem } from '@/lib/faq-data'

export const MCP_MONTHLY_USD = 29
export const MCP_ANNUAL_USD = 228

export const MCP_LANDING_H1 = 'Nutrition MCP server for Claude and Cursor'
export const MCP_PRICING_H1 = 'Nutrition MCP server pricing'

export function mcpLandingMetaDescription(): string {
  return `A nutrition MCP server lets Claude Code and Cursor look up calories and macros instead of guessing. Personal use is $${MCP_MONTHLY_USD} a month or $${MCP_ANNUAL_USD} a year.`
}

export function mcpLandingLead(foodCountLabel: string): string {
  const apps = mcpOauthConnectEnabled()
    ? 'Claude.ai, Claude Desktop, and Claude mobile use the sign-in screen.'
    : 'Browser sign-in for Claude apps is off until OAuth is enabled.'
  return `${mcpLandingMetaDescription()} The catalog covers ${foodCountLabel}. ${apps}`
}

export function mcpPricingLead(): string {
  return `Nutrition MCP server pricing is $${MCP_MONTHLY_USD} a month, or $${MCP_ANNUAL_USD} a year. The 7-day trial requires a card. REST search, foods, calc, and vision return 403 on this plan.`
}

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

export const MCP_CONNECT_STEPS = [
  {
    name: 'Start the nutrition MCP trial',
    text: 'A card is required. The API key is shown once in the dashboard.',
  },
  {
    name: 'Connect Claude Code or Cursor',
    text: 'Paste the server URL and the X-API-Key header into Claude Code or Cursor.',
  },
  {
    name: 'Track calories in the chat',
    text: 'Ask for a food and a weight. The assistant calls the tools. You do not write the request.',
  },
] as const

export const MCP_FEATURE_TITLES = [
  'Search foods',
  'Food photo calories',
  'Portion calculator',
  'Recipe macros',
  'Barcode lookup',
  'Daily calorie target',
] as const

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
    q: 'What is a nutrition MCP server?',
    a: 'A nutrition MCP server is a Model Context Protocol endpoint that looks up foods, portions, recipes, barcodes, daily calorie targets, and food photos. Claude Code and Cursor call it with an API key. The numbers come from the catalog, not from the model guessing.',
  },
  {
    q: 'How do I connect a nutrition MCP server to Claude Code or Cursor?',
    a: 'Start the trial, create an API key in the dashboard, and add the server URL with an X-API-Key header. Claude.ai, Claude Desktop, and Claude mobile use browser sign-in only after OAuth is enabled on the API.',
  },
  {
    q: 'Can I track calories with Claude AI?',
    a: 'Yes. Ask for a food and a gram weight. The assistant calls search_foods, then calculate_portion on the food_id that search returned. The server does not store a food diary. You keep the log.',
  },
  {
    q: 'How do I estimate calories from a food photo?',
    a: 'Call analyze_food_photo with image_base64. JPEG, PNG, or WebP, up to 2 MB, with no data: prefix. Pasting a picture into the chat does not attach the file. A URL is not accepted.',
  },
  {
    q: 'How much does a nutrition MCP server cost?',
    a: 'Personal use is $29 a month, or $228 a year, which is $19 a month and $120 off the monthly price. The 7-day trial requires a card. Paid limits are 20 calls a minute, 10,000 calls a month, 25 foods per search, and 150 photos a month.',
  },
  {
    q: 'Does the nutrition MCP plan include the REST API?',
    a: 'No. REST search, foods, calc, and vision return 403. Account and billing pages still work. An app that needs HTTP endpoints needs a REST plan.',
  },
  {
    q: 'Is a nutrition MCP server a MyFitnessPal alternative?',
    a: 'It can replace the lookup: you log food in Claude instead of in a tracking app. It does not scan with a camera, store history, or chart the week. Those stay in a file or app you already use.',
  },
  {
    q: 'Can I use a nutrition MCP server in a commercial app?',
    a: 'No. This plan is personal use. A commercial header is rejected. Reselling the data, or putting it in a product other people pay for, needs a REST plan and a commercial license.',
  },
]

export const MCP_FAQS: readonly FaqItem[] = [
  {
    q: 'Which clients can connect to a nutrition MCP server?',
    a: mcpOauthConnectEnabled()
      ? 'Claude Code and Cursor send an X-API-Key header. Claude.ai, Claude Desktop, and Claude mobile add the server URL and open a Calorie API sign-in. Approve access there. The account must be on the MCP plan. Do not paste the API key into those apps.'
      : 'Claude Code and Cursor send an X-API-Key header. Browser sign-in for Claude.ai, Claude Desktop, and Claude mobile stays off until the API enables OAuth. The account must be on the MCP plan.',
  },
  {
    q: 'Does the nutrition MCP plan include the REST API?',
    a: 'No. MCP tools only. REST search, foods, calc, and vision return 403. Billing and account pages still work.',
  },
  {
    q: 'What are the nutrition MCP server trial limits?',
    a: '7 days, card required. Trial: 5/min, 200 calls total, 10 results, 10 photos. Paid: 20/min, 10,000/month, 25 results, 150 photos/month, 20 photos/day.',
  },
  {
    q: 'Can I use a nutrition MCP server in a commercial app?',
    a: 'No. Personal use only. A commercial header is rejected. Apps that resell the data need a REST plan and a commercial license.',
  },
  {
    q: 'How do I estimate calories from a food photo?',
    a: 'Pass image_base64 yourself. JPEG, PNG, or WebP, up to 2 MB, no data: prefix. Pasting a picture into the chat does not attach the file.',
  },
  {
    q: 'Will I be charged when the nutrition MCP trial ends?',
    a: 'Yes, unless you cancel before the trial ends. Cancel from the billing page.',
  },
  {
    q: 'Where do I get the nutrition MCP API key?',
    a: 'Dashboard, API keys, after checkout. The full key is shown once, when you create it. It is not emailed.',
  },
  {
    q: 'What does personal use mean for a nutrition MCP server?',
    a: 'You use the tools in your own assistant. Reselling the data or putting it in a product other people pay for needs a commercial REST plan.',
  },
  {
    q: 'How much does nutrition MCP server pricing cost per year?',
    a: '$228 a year, which is $19 a month. Monthly is $29. That is $120 off versus paying monthly.',
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
