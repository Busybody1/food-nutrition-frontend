import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, AlertCircle, Database, FlaskConical, Key, Zap } from 'lucide-react'
import { SITE_NAME, FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'
import { API_CONFIG } from '@/lib/config/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { DocsSeoContent } from '@/components/seo/public-page-seo-content'
import { StructuredData } from '@/components/seo/structured-data'
import { DocsShell } from '@/components/docs/docs-shell'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'
import { DocsLanguageTabs } from '@/components/docs/docs-language-tabs'
import { DOCS_SECTIONS, docsSectionPath } from '@/lib/docs/registry'
import { GUIDES, guidePath } from '@/lib/docs/guides-data'

export const metadata: Metadata = buildPublicPageMetadata('/docs')

const API_BASE = API_CONFIG.baseURL.replace(/\/$/, '')
const SEARCH_URL = `${API_BASE}/api/v1/search/foods`

const FIRST_REQUEST_EXAMPLES: Record<string, string> = {
  curl: `curl "${SEARCH_URL}?q=apple" \\
  -H "X-API-Key: your_api_key_here"`,

  javascript: `const response = await fetch('${SEARCH_URL}?q=apple', {
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,

  python: `import requests

url = "${SEARCH_URL}"
headers = {
    "X-API-Key": "your_api_key_here",
    "Content-Type": "application/json"
}
params = {"q": "apple"}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(data)`,

  php: `<?php
$url = '${SEARCH_URL}?q=apple';
$headers = [
    'X-API-Key: your_api_key_here',
    'Content-Type: application/json'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`,
}

/** Legacy /docs#anchor ids → new sub-route cards, so old deep links still land nearby. */
const SECTION_CARD_IDS: Record<string, string> = {
  'food-search': 'search',
  'barcode-lookup': 'barcode-lookup',
  'food-details': 'food-details',
  'reference-data': 'nutrients',
  'rate-limits': 'rate-limits',
  errors: 'error-handling',
  authentication: 'api-keys',
}

export default function DocsPage() {
  return (
    <div className="marketing-page docs-page min-h-screen">
      <PublicPageSchema path="/docs" pageName="Documentation" />
      <StructuredData type="api" />

      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-4 inline-flex">Documentation</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">
          {SITE_NAME} reference
        </h1>
        <p className="text-lg text-ink-muted max-w-2xl mx-auto">
          Search, retrieve, and analyze nutritional information with our REST API over HTTPS.
        </p>
        <p className="mt-4 text-sm text-ink-muted">
          Base URL: <code className="docs-inline-code">{API_BASE}/api/v1</code>
        </p>
      </MarketingImageHero>

      <DocsShell>
        <section id="introduction" className="mb-12 scroll-mt-[calc(var(--site-header-offset)+1rem)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-3xl">
            <div className="flex items-center gap-2 rounded-brand border border-surface-border px-4 py-3 text-sm text-ink-muted">
              <Key className="h-4 w-4 text-brand shrink-0" />
              API key auth
            </div>
            <div className="flex items-center gap-2 rounded-brand border border-surface-border px-4 py-3 text-sm text-ink-muted">
              <Zap className="h-4 w-4 text-brand shrink-0" />
              REST + JSON
            </div>
            <div className="flex items-center gap-2 rounded-brand border border-surface-border px-4 py-3 text-sm text-ink-muted">
              <Database className="h-4 w-4 text-brand shrink-0" />
              Food database
            </div>
          </div>

          <div className="marketing-callout mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-strong mt-0.5 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-ink mb-2">Quick start</h2>
                <p className="text-ink-muted mb-4 leading-relaxed">
                  Get started in minutes with our comprehensive food database API.
                  Create an account, choose a plan, get your API key, and start making requests.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="gap-1">
                    <Database className="w-3 h-3" />
                    {FOOD_DATABASE_SIZE_LABEL}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="w-3 h-3" />
                    Real-time data
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Key className="w-3 h-3" />
                    Easy integration
                  </Badge>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/playground">
                    <FlaskConical className="w-4 h-4 mr-2" />
                    Open API playground
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="create-account" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-6">Getting Started</h2>

          <div className="space-y-8">
            <div className="docs-step">
              <div className="marketing-step-number shrink-0">1</div>
              <div className="docs-step__body">
                <h3 className="text-xl font-semibold text-ink mb-2">Create Your Account</h3>
                <p className="text-ink-muted mb-4">
                  Sign up for a free account to access the Food API. No credit card required for the free tier.
                </p>
                <Button asChild>
                  <Link href="/auth/register">
                    Create Account <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div id="choose-plan" className="docs-step">
              <div className="marketing-step-number shrink-0">2</div>
              <div className="docs-step__body">
                <h3 className="text-xl font-semibold text-ink mb-2">Choose Your Plan</h3>
                <p className="text-ink-muted mb-4">
                  Start on the free plan and upgrade as your request volume grows. Paid plans raise
                  per-minute rate limits and monthly quotas — see{' '}
                  <Link href="/docs/rate-limits" className="text-brand-strong hover:underline">
                    rate limits &amp; quotas
                  </Link>{' '}
                  for how limits work.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/pricing">View All Plans</Link>
                </Button>
              </div>
            </div>

            <div id="get-api-key" className="docs-step">
              <div className="marketing-step-number shrink-0">3</div>
              <div className="docs-step__body">
                <h3 className="text-xl font-semibold text-ink mb-2">Get Your API Key</h3>
                <p className="text-ink-muted mb-4">
                  After subscribing to a plan, generate your API key from the dashboard. This key
                  authenticates your requests — see{' '}
                  <Link href="/docs/authentication" className="text-brand-strong hover:underline">
                    authentication
                  </Link>{' '}
                  for security best practices.
                </p>
                <DocsCodeBlock title="Your API Key" code="sk_live_1234567890abcdef" copyable />
                <Button asChild className="mt-4">
                  <Link href="/dashboard">
                    <Key className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            <div id="first-request" className="docs-step">
              <div className="marketing-step-number shrink-0">4</div>
              <div className="docs-step__body">
                <h3 className="text-xl font-semibold text-ink mb-2">Make Your First Request</h3>
                <p className="text-ink-muted mb-4">
                  Test your API key with a simple search request. Replace the API key with your actual key.
                </p>
                <DocsLanguageTabs title='Search for "apple"' examples={FIRST_REQUEST_EXAMPLES} />
              </div>
            </div>
          </div>
        </section>

        <section id="search" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4">API Reference</h2>
          <p className="text-ink-muted mb-8 max-w-3xl">
            Every endpoint has a dedicated reference page with parameters, response examples, and
            integration FAQs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCS_SECTIONS.map((section) => (
              <Link
                key={section.slug}
                id={SECTION_CARD_IDS[section.slug]}
                href={docsSectionPath(section.slug)}
                className="group rounded-brand border border-surface-border p-5 hover:border-brand transition-colors scroll-mt-24"
              >
                <h3 className="text-lg font-semibold text-ink mb-1 group-hover:text-brand-strong">
                  {section.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">{section.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-strong">
                  Read reference <ArrowRight className="w-4 h-4" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="guides" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4">Integration Guides</h2>
          <p className="text-ink-muted mb-8 max-w-3xl">
            Framework-specific walkthroughs with working code for common nutrition features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={guidePath(guide.slug)}
                className="group rounded-brand border border-surface-border p-5 hover:border-brand transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong mb-1">
                  {guide.framework}
                </p>
                <h3 className="text-lg font-semibold text-ink mb-1 group-hover:text-brand-strong">
                  {guide.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">{guide.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </DocsShell>

      <DocsSeoContent />
    </div>
  )
}
