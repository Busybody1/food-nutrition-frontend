import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowRight, Database, FlaskConical, Key, Zap } from 'lucide-react'
import { BarcodeIcon, BookOpenIcon, CodeIcon, DatabaseIcon, DeviceMobileIcon, FileTextIcon, GaugeIcon, GlobeIcon, KeyIcon, LightningIcon, MagnifyingGlassIcon, StackIcon, TerminalWindowIcon, WarningIcon } from '@phosphor-icons/react/ssr'
import type { MarketingIcon } from '@/components/marketing/marketing-shell'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'
import { API_CONFIG } from '@/lib/config/api'
import { MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { MarketingIconDisc, discToneAt } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { DocsSeoContent } from '@/components/seo/public-page-seo-content'
import { StructuredData } from '@/components/seo/structured-data'
import { DocsShell } from '@/components/docs/docs-shell'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'
import { DocsLanguageTabs } from '@/components/docs/docs-language-tabs'
import { DOCS_H2_CLASS } from '@/components/docs/docs-blocks'
import { DOCS_SECTIONS, docsSectionPath } from '@/lib/docs/registry'
import { GUIDES, guidePath } from '@/lib/docs/guides-data'
import type { HeroMark } from '@/components/marketing/hero-backdrop'

export const metadata: Metadata = buildPublicPageMetadata('/docs')

const DOCS_SEO = getPublicPageSeo('/docs')

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

const SECTION_CARD_IDS: Record<string, string> = {
  'food-search': 'search',
  'barcode-lookup': 'barcode-lookup',
  'food-details': 'food-details',
  'reference-data': 'nutrients',
  'rate-limits': 'rate-limits',
  errors: 'error-handling',
  authentication: 'api-keys',
}

const DOCS_HERO_MARKS: HeroMark[] = [
  { icon: BookOpenIcon, tone: 'blue' },
  { icon: KeyIcon, tone: 'coral' },
  { icon: CodeIcon, tone: 'violet' },
  { icon: TerminalWindowIcon, tone: 'green' },
]

const SECTION_ICONS: Record<string, MarketingIcon> = {
  authentication: KeyIcon,
  'food-search': MagnifyingGlassIcon,
  'barcode-lookup': BarcodeIcon,
  'food-details': FileTextIcon,
  'reference-data': DatabaseIcon,
  'rate-limits': GaugeIcon,
  errors: WarningIcon,
}

const GUIDE_ICONS: Record<string, MarketingIcon> = {
  'React Native': DeviceMobileIcon,
  'Next.js': GlobeIcon,
  Flutter: StackIcon,
  'Node.js': TerminalWindowIcon,
  Python: CodeIcon,
}

const CARD_LINK_CLASS =
  'marketing-card group flex h-full min-w-0 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

const INLINE_LINK_CLASS =
  'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong'

const HERO_CHIP_CLASS =
  'inline-flex h-7 items-center gap-1.5 rounded-full border border-mk-line bg-white px-3 text-[13px] font-medium text-mk-ink'

const INTRO_CHIP_CLASS =
  'flex items-center gap-3 rounded-2xl border border-mk-hair bg-white px-4 py-3 text-sm font-medium text-mk-ink shadow-card'

const CARD_TITLE_CLASS =
  'text-xl font-semibold tracking-[-0.01em] text-mk-ink mb-1 group-hover:text-brand-strong transition-colors duration-200'

export default function DocsPage() {
  return (
    <div className="marketing-page min-h-screen">
      <PublicPageSchema path="/docs" pageName={DOCS_SEO.title ?? 'Nutrition API documentation'} speakable />
      <StructuredData type="api" />

      <MarketingSheetHero
        marks={DOCS_HERO_MARKS}
        badge="Documentation"
        title={DOCS_SEO.title}
        lead={DOCS_SEO.description}
        leadClassName="aeo-answer"
        actions={
          <>
            <Link href="/auth/register" className="btn-brand">
              Create Account
            </Link>
            <Link href="/playground" className="btn-brand-outline">
              <FlaskConical className="h-4 w-4" aria-hidden />
              Open API playground
            </Link>
          </>
        }
      >
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className={HERO_CHIP_CLASS}>
            <Database className="h-3.5 w-3.5 text-mk-muted" aria-hidden />
            {FOOD_DATABASE_SIZE_LABEL}
          </span>
          <span className={HERO_CHIP_CLASS}>
            <Zap className="h-3.5 w-3.5 text-mk-muted" aria-hidden />
            Real-time data
          </span>
          <span className={HERO_CHIP_CLASS}>
            <Key className="h-3.5 w-3.5 text-mk-muted" aria-hidden />
            Easy integration
          </span>
        </div>
        <p className="mt-5 text-sm text-mk-muted">
          Base URL: <code className="docs-inline-code">{API_BASE}/api/v1</code>
        </p>
      </MarketingSheetHero>

      <DocsShell withHero>
        <section id="introduction" className="mb-16 scroll-mt-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
            <div className={INTRO_CHIP_CLASS}>
              <MarketingIconDisc icon={KeyIcon} tone="blue" className="h-8 w-8" />
              API key auth
            </div>
            <div className={INTRO_CHIP_CLASS}>
              <MarketingIconDisc icon={LightningIcon} tone="green" className="h-8 w-8" />
              REST + JSON
            </div>
            <div className={INTRO_CHIP_CLASS}>
              <MarketingIconDisc icon={DatabaseIcon} tone="violet" className="h-8 w-8" />
              Food database
            </div>
          </div>

          <div className="marketing-callout mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-mk-muted mt-0.5 shrink-0" aria-hidden />
              <div>
                <h2 className="text-lg font-semibold text-mk-ink mb-2">Quick start</h2>
                <p className="text-mk-body mb-4 leading-relaxed">
                  Get started in minutes with our comprehensive{' '}
                  <Link href="/food-database-api" className={INLINE_LINK_CLASS}>
                    food database API
                  </Link>
                  . Create an account, choose a plan, get your API key, and start making requests.
                </p>
                <Link href="/playground" className="btn-brand-outline">
                  <FlaskConical className="w-4 h-4" aria-hidden />
                  Open API playground
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="create-account" className="mb-16 scroll-mt-24">
          <h2 className={`${DOCS_H2_CLASS} mb-6`}>Getting Started</h2>

          <div className="space-y-8">
            <div className="docs-step">
              <div className="marketing-step-number shrink-0">1</div>
              <div className="docs-step__body">
                <h3 className="text-xl font-semibold tracking-[-0.01em] text-mk-ink mb-2">Create Your Account</h3>
                <p className="text-mk-body mb-4">
                  Sign up for a free account to access the Food API. No credit card required for the free tier.
                </p>
                <Link href="/auth/register" className="btn-brand">
                  Create Account
                </Link>
              </div>
            </div>

            <div id="choose-plan" className="docs-step">
              <div className="marketing-step-number shrink-0">2</div>
              <div className="docs-step__body">
                <h3 className="text-xl font-semibold tracking-[-0.01em] text-mk-ink mb-2">Choose Your Plan</h3>
                <p className="text-mk-body mb-4">
                  Start on the free plan and upgrade as your request volume grows. Paid plans raise
                  per-minute rate limits and monthly quotas. See{' '}
                  <Link href="/docs/rate-limits" className={INLINE_LINK_CLASS}>
                    rate limits &amp; quotas
                  </Link>{' '}
                  for how limits work.
                </p>
                <Link href="/pricing" className="btn-brand-outline">
                  View All Plans
                </Link>
              </div>
            </div>

            <div id="get-api-key" className="docs-step">
              <div className="marketing-step-number shrink-0">3</div>
              <div className="docs-step__body">
                <h3 className="text-xl font-semibold tracking-[-0.01em] text-mk-ink mb-2">Get Your API Key</h3>
                <p className="text-mk-body mb-4">
                  After subscribing to a plan, generate your API key from the dashboard. This key
                  authenticates your requests. See{' '}
                  <Link href="/docs/authentication" className={INLINE_LINK_CLASS}>
                    authentication
                  </Link>{' '}
                  for security best practices.
                </p>
                <DocsCodeBlock title="Your API Key" code="sk_live_1234567890abcdef" copyable />
                <Link href="/dashboard" className="btn-brand mt-4">
                  <Key className="w-4 h-4" aria-hidden />
                  Go to Dashboard
                </Link>
              </div>
            </div>

            <div id="first-request" className="docs-step">
              <div className="marketing-step-number shrink-0">4</div>
              <div className="docs-step__body">
                <h3 className="text-xl font-semibold tracking-[-0.01em] text-mk-ink mb-2">Make Your First Request</h3>
                <p className="text-mk-body mb-4">
                  Test your API key with a simple search request. Replace the API key with your actual key.
                </p>
                <DocsLanguageTabs title='Search for "apple"' examples={FIRST_REQUEST_EXAMPLES} />
              </div>
            </div>
          </div>
        </section>

        <section id="search" className="mb-16 scroll-mt-24">
          <div className="rounded-[22px] border border-mk-hair bg-mk-stage p-5 sm:p-6 md:p-8">
            <h2 className={`${DOCS_H2_CLASS} mb-4`}>API Reference</h2>
            <p className="text-mk-body mb-8 max-w-3xl">
              Every endpoint has a dedicated reference page with parameters, response examples, and
              integration FAQs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {DOCS_SECTIONS.map((section, index) => {
                const Icon = SECTION_ICONS[section.slug] ?? DatabaseIcon
                const featured = index === 0
                return (
                  <Reveal
                    key={section.slug}
                    delay={Math.min(index, 6) * 80}
                    className={featured ? 'h-full min-w-0 md:col-span-2' : 'h-full min-w-0'}
                  >
                    <Link
                      id={SECTION_CARD_IDS[section.slug]}
                      href={docsSectionPath(section.slug)}
                      className={
                        featured
                          ? `${CARD_LINK_CLASS} p-6 scroll-mt-24`
                          : `${CARD_LINK_CLASS} scroll-mt-24`
                      }
                    >
                      <MarketingIconDisc icon={Icon} tone={discToneAt(index)} className="mb-3" />
                      <h3 className={CARD_TITLE_CLASS}>{section.title}</h3>
                      <p className="text-sm text-mk-muted leading-relaxed">{section.summary}</p>
                      <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-medium text-mk-ink">
                        Read reference{' '}
                        <ArrowRight
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section id="guides" className="mb-16 scroll-mt-24">
          <h2 className={`${DOCS_H2_CLASS} mb-4`}>Integration Guides</h2>
          <p className="text-mk-body mb-8 max-w-3xl">
            Framework-specific walkthroughs with working code for common nutrition features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {GUIDES.map((guide, index) => {
              const Icon = GUIDE_ICONS[guide.framework] ?? CodeIcon
              const featured = index === 0
              return (
                <Reveal
                  key={guide.slug}
                  delay={Math.min(index, 6) * 80}
                  className={featured ? 'h-full min-w-0 md:col-span-2' : 'h-full min-w-0'}
                >
                  <Link
                    href={guidePath(guide.slug)}
                    className={featured ? `${CARD_LINK_CLASS} p-6` : CARD_LINK_CLASS}
                  >
                    <div className="mb-3 flex items-center gap-2.5">
                      <MarketingIconDisc icon={Icon} tone={discToneAt(index)} />
                      <p className="marketing-section-label">{guide.framework}</p>
                    </div>
                    <h3 className={CARD_TITLE_CLASS}>{guide.title}</h3>
                    <p className="text-sm text-mk-muted leading-relaxed">{guide.summary}</p>
                    <span className="mt-auto pt-3 inline-flex items-center text-mk-ink">
                      <ArrowRight
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>
      </DocsShell>

      <DocsSeoContent />
    </div>
  )
}
