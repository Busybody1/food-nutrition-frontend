import { SITE_NAME } from '@/lib/site'
import { MarketingSeoSection, SeoInlineLink } from '@/components/seo/marketing-seo-section'

export function PricingSeoContent() {
  return (
    <MarketingSeoSection title="Nutrition API plans for every stage">
      <p>
        {SITE_NAME} pricing is built for developers evaluating a nutrition and food database API,
        from hobby projects on the free tier to commercial meal-tracking apps on Plus. Each plan
        includes monthly request quotas, per-minute rate limits, and access to search, suggest, and
        barcode endpoints.
      </p>
      <p>
        Non-commercial development and personal use are supported on Free, Basic, and Core. Production
        apps with paying users should use Plus or Enterprise and send{' '}
        <code className="text-sm bg-surface-elevated px-1.5 py-0.5 rounded">X-API-Usage-Type: commercial</code>{' '}
        on requests. Compare feature limits in the table above or read the{' '}
        <SeoInlineLink href="/faq">FAQ</SeoInlineLink> for licensing details.
      </p>
      <p>
        Need custom volume, SLAs, or white-label terms?{' '}
        <SeoInlineLink href="/contact?inquiry=enterprise">Contact sales</SeoInlineLink> for an
        enterprise quote.
      </p>
    </MarketingSeoSection>
  )
}

export function DocsSeoContent() {
  return (
    <MarketingSeoSection title="Developer documentation for nutrition & food APIs">
      <p>
        This reference covers how to authenticate with API keys, search foods with multi-word queries
        and verified filters, run autocomplete suggest, and resolve products by UPC barcode. All
        responses are JSON over HTTPS with predictable pagination and error formats.
      </p>
      <p>
        Start with a free account to generate keys in the dashboard, or try the public demo on the{' '}
        <SeoInlineLink href="/">homepage</SeoInlineLink> before you integrate. Read our{' '}
        <SeoInlineLink href="/blog">developer blog</SeoInlineLink> for calorie API guides, or see{' '}
        <SeoInlineLink href="/pricing">pricing</SeoInlineLink> and monitor usage in your developer
        dashboard.
      </p>
    </MarketingSeoSection>
  )
}

export function AboutSeoContent() {
  return (
    <MarketingSeoSection title="Nutrition data infrastructure for health software">
      <p>
        {SITE_NAME} exists so engineering teams can ship calorie counting, macro tracking, and
        barcode scanning without curating millions of food records. We focus on verified nutrition
        values per 100g, fast search, and transparent developer experience from docs to billing.
      </p>
      <p>
        Whether you are building a fitness app, corporate wellness portal, or AI meal coach, you get
        the same REST API, rate-limited for fairness and documented for production. Explore{' '}
        <SeoInlineLink href="/docs">API documentation</SeoInlineLink>, read the{' '}
        <SeoInlineLink href="/blog">blog</SeoInlineLink>, review{' '}
        <SeoInlineLink href="/pricing">plans</SeoInlineLink>, or{' '}
        <SeoInlineLink href="/contact">get in touch</SeoInlineLink> with our team.
      </p>
    </MarketingSeoSection>
  )
}

export function ContactSeoContent() {
  return (
    <MarketingSeoSection title="Support, sales, and enterprise inquiries">
      <p>
        Use the form above for technical questions, billing help, or custom plan requests. We typically
        reply within one business day. For API integration guidance, start with our{' '}
        <SeoInlineLink href="/docs">documentation</SeoInlineLink> and{' '}
        <SeoInlineLink href="/faq">FAQ</SeoInlineLink>.
      </p>
      <p>
        Enterprise customers can discuss higher monthly quotas, dedicated support, and commercial
        licensing. Select Enterprise in the inquiry type when contacting us from{' '}
        <SeoInlineLink href="/pricing">pricing</SeoInlineLink>.
      </p>
    </MarketingSeoSection>
  )
}

export function FaqSeoIntro() {
  return (
    <MarketingSeoSection
      title="Common questions about our nutrition & food API"
      className="section-pad-sm border-t-0"
      id="faq-seo-intro"
    >
      <p>
        Developers choose {SITE_NAME} for production meal logging because search, barcode lookup, and
        macro nutrients per 100g are available through one REST API with clear rate limits and
        dashboard analytics.
      </p>
      <p>
        Below are answers on authentication, pricing tiers, commercial use, and search behavior. For
        step-by-step integration, visit the <SeoInlineLink href="/docs">API docs</SeoInlineLink> or
        the <SeoInlineLink href="/blog">blog</SeoInlineLink> for in-depth guides.
      </p>
    </MarketingSeoSection>
  )
}

export function ApiStatusSeoContent() {
  return (
    <MarketingSeoSection title="Monitoring API availability">
      <p>
        This page summarizes the operational status of {SITE_NAME} core services, including food
        search, suggest, barcode resolution, and authentication. During maintenance we post updates
        here and in the developer dashboard.
      </p>
      <p>
        For incident history and release notes, see the <SeoInlineLink href="/changelog">changelog</SeoInlineLink>.
        Integration guides live on the <SeoInlineLink href="/blog">blog</SeoInlineLink>. Enterprise
        customers with SLA requirements should <SeoInlineLink href="/contact">contact support</SeoInlineLink>.
      </p>
    </MarketingSeoSection>
  )
}

export function BlogSeoContent() {
  return (
    <MarketingSeoSection title="Nutrition & food API guides for developers">
      <p>
        The {SITE_NAME} blog covers calorie APIs, nutrition data integration, barcode lookup, macro
        tracking, and how to choose a food database API for production apps. Each article targets
        real developer search queries with code examples and comparison tables.
      </p>
      <p>
        New to the platform? Start with <SeoInlineLink href="/docs">API documentation</SeoInlineLink>,{' '}
        compare <SeoInlineLink href="/pricing">plans</SeoInlineLink>, or{' '}
        <SeoInlineLink href="/auth/register">create a free account</SeoInlineLink> to get your API key.
      </p>
    </MarketingSeoSection>
  )
}

export function ChangelogSeoContent() {
  return (
    <MarketingSeoSection title="API and platform release history">
      <p>
        The changelog documents new search parameters, rate-limit changes, dashboard improvements,
        and fixes that affect integrators. Subscribe to updates by following releases here or
        checking the <SeoInlineLink href="/api-status">API status</SeoInlineLink> page during
        deployments.
      </p>
      <p>
        Breaking changes are announced in advance when possible. Full integration details remain in
        the <SeoInlineLink href="/docs">documentation</SeoInlineLink>.
      </p>
    </MarketingSeoSection>
  )
}
