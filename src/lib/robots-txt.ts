const PRIVATE_PATHS = [
  '/dashboard/',
  '/admin/',
  '/auth/',
  '/checkout',
  '/feedback/',
  '/api/',
]

const CITATION_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'Bingbot',
]

function agentGroup(userAgent: string): string[] {
  return [
    `User-agent: ${userAgent}`,
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    'Allow: /',
    ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
    '',
  ]
}

export function buildRobotsTxt(siteUrl: string): string {
  return [
    ...agentGroup('*'),
    ...CITATION_BOTS.flatMap((bot) => agentGroup(bot)),
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
}
