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
} from '@/lib/blog-discovery-format'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'

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

/** RSS 2.0 feed for blog syndication and LLM/crawler discovery. */
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
    }))
  } catch {
    return undefined
  }
}

/** llms.txt body with a dynamic catalog of published blog posts. */
export async function buildLlmsTxt(posts: BlogListItem[]): Promise<string> {
  const pricingPlans = await loadPricingPlans()
  return buildLlmsTxtFromInput(posts, discoverySite(), pricingPlans)
}
