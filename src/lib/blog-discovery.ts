import type { BlogListItem } from '@/lib/api/blog'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
  absoluteUrl,
} from '@/lib/site'
import {
  buildBlogRssXmlFromInput,
  buildLlmsTxtFromInput,
  type BlogDiscoveryPricingPlan,
  type BlogDiscoverySite,
  type DiscoveryCatalog,
} from '@/lib/blog-discovery-format'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import { DOCS_SECTIONS, docsSectionPath } from '@/lib/docs/registry'
import { GUIDES, guidePath } from '@/lib/docs/guides-data'
import { CAPABILITY_PAGES, capabilityPath } from '@/lib/capability-pages-data'
import { SOLUTION_PAGES, solutionPath } from '@/lib/solutions-data'
import { COMPARISON_PAGES, comparisonPath } from '@/lib/comparisons-data'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function discoverySite(): BlogDiscoverySite {
  return {
    siteName: SITE_NAME,
    siteDescription: SITE_DESCRIPTION,
    siteUrl: SITE_URL,
    supportEmail: SUPPORT_EMAIL,
    apiBaseUrl: API_BASE_URL,
    blogUrl: absoluteUrl('/blog'),
    feedUrl: absoluteUrl('/blog/feed.xml'),
    blogPostUrl: (slug) => absoluteUrl(`/blog/${slug}`),
  }
}

export function buildBlogRssXml(posts: BlogListItem[]): string {
  return buildBlogRssXmlFromInput(posts, discoverySite())
}

async function loadPricingPlans(): Promise<BlogDiscoveryPricingPlan[] | undefined> {
  try {
    const plans = await fetchPublicPlans()
    return plans.map((plan) => ({
      name: plan.name,
      monthly_price: plan.monthly_price,
      monthly_quota: plan.monthly_quota,
      rate_limit_per_minute: plan.rate_limit_per_minute,
      max_results_per_query: plan.max_results_per_query,
    }))
  } catch {
    return undefined
  }
}

function discoveryCatalog(): DiscoveryCatalog {
  return {
    docs: DOCS_SECTIONS.map((s) => ({
      url: absoluteUrl(docsSectionPath(s.slug)),
      title: s.title,
      summary: s.summary,
    })),
    guides: GUIDES.map((g) => ({
      url: absoluteUrl(guidePath(g.slug)),
      title: g.title,
      summary: g.summary,
    })),
    capabilities: [
      ...CAPABILITY_PAGES.map((p) => ({
        url: absoluteUrl(capabilityPath(p.slug)),
        title: p.h1,
        summary: p.summary,
      })),
      {
        url: absoluteUrl('/mcp'),
        title: 'Nutrition MCP for Claude Code and Cursor',
        summary: 'Personal-use MCP tools. Claude Code and Cursor use an API key. Claude apps use browser sign-in when the API has OAuth enabled.',
      },
      {
        url: absoluteUrl('/mcp/pricing'),
        title: 'MCP pricing',
        summary: '$29 per month or $228 per year. 7-day trial. No REST access.',
      },
    ],
    solutions: SOLUTION_PAGES.map((p) => ({
      url: absoluteUrl(solutionPath(p.slug)),
      title: p.h1,
      summary: p.summary,
    })),
    comparisons: COMPARISON_PAGES.map((p) => ({
      url: absoluteUrl(comparisonPath(p.slug)),
      title: `${SITE_NAME} vs ${p.competitor}`,
      summary: p.summary,
    })),
  }
}

export async function buildLlmsTxt(posts: BlogListItem[]): Promise<string> {
  const pricingPlans = await loadPricingPlans()
  return buildLlmsTxtFromInput(posts, discoverySite(), pricingPlans, discoveryCatalog())
}
