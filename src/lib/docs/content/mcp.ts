import type { DocsSectionContent } from '@/lib/docs/types'
import {
  MCP_FAQS,
  MCP_TOOLS,
  claudeCodeCommand,
  claudeOAuthSteps,
  cursorConfig,
  genericHeaderConfig,
  mcpEndpoint,
} from '@/lib/mcp/catalog'

export const MCP_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'The MCP server exposes the nutrition catalog as tools. Claude Code and Cursor connect with an X-API-Key header. Claude.ai, Claude Desktop, and Claude mobile use browser sign-in when the API has OAuth enabled. The account must be on the MCP plan.',
    },
    { kind: 'h2', text: 'Install', id: 'install' },
    { kind: 'h3', text: 'Claude.ai, Claude Desktop, and Claude mobile' },
    { kind: 'code', title: 'Custom connector', code: claudeOAuthSteps(mcpEndpoint()) },
    { kind: 'h3', text: 'Claude Code' },
    { kind: 'code', title: 'Terminal', code: claudeCodeCommand(mcpEndpoint()) },
    { kind: 'h3', text: 'Cursor' },
    { kind: 'json', title: '.cursor/mcp.json', code: cursorConfig(mcpEndpoint()) },
    { kind: 'h3', text: 'Other header-capable clients' },
    { kind: 'code', title: 'Connection', code: genericHeaderConfig(mcpEndpoint()) },
    { kind: 'h2', text: 'Authentication', id: 'auth' },
    {
      kind: 'p',
      text: 'When the API has OAuth enabled, Claude apps sign in in the browser. A request that has neither a bearer token nor an API key is then HTTP 401 and carries a WWW-Authenticate challenge so the client can discover the sign-in server. Until that switch is on, use an API key. Claude Code and Cursor send the key on every request as X-API-Key. The key must belong to the MCP plan. Keys from Free, Basic, Core, Plus, or Custom are refused. Photo calls made through OAuth also need the nutrition:vision scope. A missing scope is HTTP 403 with scope="nutrition:vision" in WWW-Authenticate.',
    },
    {
      kind: 'list',
      items: [
        'Create the key in Dashboard → API keys. The full value is shown once, at creation.',
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
        { name: 'Rate', description: '20 calls per minute, shared with any REST calls on the same account' },
        { name: 'Quota', description: '10,000 successful MCP calls per month' },
        { name: 'Results', description: '25 foods per search' },
        { name: 'Distinct foods', description: '2% of the catalog per month' },
        { name: 'Photos', description: '150 per month and 20 per day' },
      ],
    },
    {
      kind: 'params',
      title: 'Trial',
      rows: [
        { name: 'Length', description: '7 days, card required' },
        { name: 'Rate', description: '5 calls per minute' },
        { name: 'Quota', description: '200 calls total, not reset on the 1st' },
        { name: 'Results', description: '10 foods per search' },
        { name: 'Photos', description: '10 calls total' },
      ],
    },
    {
      kind: 'params',
      title: 'Error cases',
      rows: [
        { name: 'Auth', description: 'No key, invalid key, or a plan without mcp_access' },
        { name: 'Plan', description: 'Commercial header, or REST routes on an MCP-only key (HTTP 403)' },
        { name: 'Limit', description: 'Rate, quota, distinct-food cap, or photo cap' },
        { name: 'Unavailable', description: 'The tool could not complete. Retry later. The message does not include a stack trace.' },
      ],
    },
    { kind: 'h2', text: 'Photos', id: 'photos' },
    {
      kind: 'p',
      text: 'analyze_food_photo requires image_base64 as raw base64, without a data: prefix. JPEG, PNG, or WebP. Maximum decoded size is 2 MB. Clients do not attach images automatically. Passing a URL is not enabled.',
    },
    { kind: 'h2', text: 'Troubleshooting', id: 'troubleshooting' },
    {
      kind: 'list',
      items: [
        '401 on the MCP URL while OAuth is enabled: Claude is starting sign-in. Approve the consent screen with an MCP-plan account. For Claude Code, the header name is X-API-Key.',
        '403 on /api/v1/search: expected. This plan is MCP only. Use the tools, or buy a REST plan.',
        'Claude opens a sign-in page and then says the account cannot connect: that login is not on the MCP plan. Start the trial from the MCP pricing page.',
        'The model names a food but never calls search_foods: the food_id it invents will fail. Ask it to search first.',
        'A photo call returns a size error: compress below 2 MB and send raw base64.',
      ],
    },
  ],
  faqs: MCP_FAQS.slice(0, 6),
}
