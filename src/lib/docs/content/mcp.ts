import type { DocsBlock, DocsSectionContent } from '@/lib/docs/types'
import {
  MCP_ANNUAL_USD,
  MCP_FAQS,
  MCP_MONTHLY_USD,
  MCP_PAID_LIMITS,
  MCP_TOOLS,
  MCP_TRIAL_LIMITS,
  claudeCodeCommand,
  claudeOAuthSteps,
  cursorConfig,
  genericHeaderConfig,
  mcpEndpoint,
  mcpOauthConnectEnabled,
} from '@/lib/mcp/catalog'

function connectBlocks(): DocsBlock[] {
  const oauthOn = mcpOauthConnectEnabled()
  const lead = oauthOn
    ? `A calorie MCP looks up calories and macros in Claude Code or Cursor with an X-API-Key header, or in Claude.ai, Claude Desktop, and Claude mobile with the sign-in screen. Personal use is $${MCP_MONTHLY_USD} a month or $${MCP_ANNUAL_USD} a year.`
    : `A calorie MCP looks up calories and macros in Claude Code or Cursor with an X-API-Key header. Browser sign-in for Claude.ai, Claude Desktop, and Claude mobile is off until OAuth is enabled. Personal use is $${MCP_MONTHLY_USD} a month or $${MCP_ANNUAL_USD} a year.`
  const claudeApps: DocsBlock[] = oauthOn
    ? [
        { kind: 'h3', text: 'Claude.ai, Claude Desktop, and Claude mobile' },
        { kind: 'code', title: 'Custom connector', code: claudeOAuthSteps(mcpEndpoint()) },
      ]
    : [
        {
          kind: 'p',
          text: 'Browser sign-in for Claude.ai, Claude Desktop, and Claude mobile is off until the API enables OAuth. Do not add this server in those apps and expect a login. Use Claude Code or Cursor with the header below.',
        },
      ]
  const auth = oauthOn
    ? 'When OAuth is enabled, Claude apps sign in in the browser. A request with neither a bearer token nor an API key is HTTP 401 and carries a WWW-Authenticate challenge. Claude Code and Cursor still send X-API-Key. The key must belong to the MCP plan. Keys from Free, Basic, Core, Plus, or Custom are refused. Photo calls made through OAuth also need the nutrition:vision scope.'
    : 'Claude Code and Cursor send X-API-Key on every request. The key must belong to the MCP plan. Keys from Free, Basic, Core, Plus, or Custom are refused. REST search, foods, calc, and vision return 403. Account and billing routes still work.'
  const troubleshooting = oauthOn
    ? [
        '401 on the MCP URL while OAuth is enabled: Claude is starting sign-in. Approve the consent screen with an MCP-plan account. For Claude Code, the header name is X-API-Key.',
        '403 on /api/v1/search: expected. This plan is MCP only. Use the tools, or buy a REST plan.',
        'The sign-in screen says the account cannot connect: that login is not on the MCP plan. Start the trial from the MCP pricing page.',
        'The model names a food but never calls search_foods: the food_id it invents will fail. Ask it to search first.',
        'A photo call returns a size error: compress below 2 MB and send raw base64.',
      ]
    : [
        'Browser sign-in is off. Use Claude Code or Cursor with X-API-Key. Do not wait for a login screen in Claude.ai, Claude Desktop, or Claude mobile.',
        '403 on /api/v1/search: expected. This plan is MCP only. Use the tools, or buy a REST plan.',
        'The model names a food but never calls search_foods: the food_id it invents will fail. Ask it to search first.',
        'A photo call returns a size error: compress below 2 MB and send raw base64.',
      ]

  return [
    { kind: 'p', text: lead },
    { kind: 'h2', text: 'Connect a calorie MCP server', id: 'install' },
    ...claudeApps,
    { kind: 'h3', text: 'Claude Code' },
    { kind: 'code', title: 'Terminal', code: claudeCodeCommand(mcpEndpoint()) },
    { kind: 'h3', text: 'Cursor' },
    { kind: 'json', title: '.cursor/mcp.json', code: cursorConfig(mcpEndpoint()) },
    { kind: 'h3', text: 'Other header-capable clients' },
    { kind: 'code', title: 'Connection', code: genericHeaderConfig(mcpEndpoint()) },
    { kind: 'h2', text: 'Authentication', id: 'auth' },
    { kind: 'p', text: auth },
    {
      kind: 'list',
      items: [
        'Create the key in Dashboard, on the MCP tab. The full value is shown once, at creation.',
        'Do not put the key in a public repo, a screenshot, or an email.',
        'This plan cannot call REST search, foods, calc, or vision. Those routes return 403.',
        'Account, billing, and auth routes still work.',
      ],
    },
    { kind: 'h2', text: 'Tools', id: 'tools' },
    {
      kind: 'params',
      title: 'Tool schemas',
      rows: MCP_TOOLS.map((tool) => ({
        name: `${tool.name}(${tool.args})`,
        description: tool.summary,
      })),
    },
    {
      kind: 'p',
      text: 'search_foods returns food_id values. calculate_portion, calculate_recipe, and get_food_nutrition need those ids. Do not invent a food_id.',
    },
    { kind: 'h2', text: 'Limits and errors', id: 'limits' },
    {
      kind: 'params',
      title: 'Paid plan',
      rows: [
        {
          name: 'Rate',
          description: `${MCP_PAID_LIMITS.perMinute} calls per minute, shared with any REST calls on the same account`,
        },
        { name: 'Quota', description: `${MCP_PAID_LIMITS.perMonth.toLocaleString('en-US')} successful MCP calls per month` },
        { name: 'Results', description: `${MCP_PAID_LIMITS.results} foods per search` },
        { name: 'Distinct foods', description: '2% of the catalog per month' },
        {
          name: 'Photos',
          description: `${MCP_PAID_LIMITS.visionMonth} per month and ${MCP_PAID_LIMITS.visionDay} per day`,
        },
      ],
    },
    {
      kind: 'params',
      title: 'Trial',
      rows: [
        { name: 'Length', description: `${MCP_TRIAL_LIMITS.days} days, card required` },
        { name: 'Rate', description: `${MCP_TRIAL_LIMITS.perMinute} calls per minute` },
        { name: 'Quota', description: `${MCP_TRIAL_LIMITS.totalCalls} calls total, not reset on the 1st` },
        { name: 'Results', description: `${MCP_TRIAL_LIMITS.results} foods per search` },
        { name: 'Photos', description: `${MCP_TRIAL_LIMITS.visionTotal} calls total` },
      ],
    },
    {
      kind: 'params',
      title: 'Error cases',
      rows: [
        { name: 'Auth', description: 'No key, invalid key, or a plan without mcp_access' },
        { name: 'Plan', description: 'Commercial header, or REST routes on an MCP-only key (HTTP 403)' },
        { name: 'Limit', description: 'Rate, quota, distinct-food cap, or photo cap' },
        {
          name: 'Unavailable',
          description: 'The tool could not complete. Retry later. The message does not include a stack trace.',
        },
      ],
    },
    { kind: 'h2', text: 'Photos', id: 'photos' },
    {
      kind: 'p',
      text: 'analyze_food_photo requires image_base64 as raw base64, without a data: prefix. JPEG, PNG, or WebP. Maximum decoded size is 2 MB. Clients do not attach images automatically. Passing a URL is not enabled.',
    },
    { kind: 'h2', text: 'Troubleshooting', id: 'troubleshooting' },
    { kind: 'list', items: troubleshooting },
  ]
}

export const MCP_CONTENT: DocsSectionContent = {
  blocks: connectBlocks(),
  faqs: MCP_FAQS.slice(0, 6),
}
