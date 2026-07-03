import type { Metadata } from 'next'
import { FaqList } from '@/components/marketing/faq-section'
import { ALL_FAQ_ITEMS, FAQ_GROUPS, buildFaqPageJsonLd } from '@/lib/faq-data'
import { JsonLdScript } from '@/components/seo/structured-data'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { FaqSeoIntro } from '@/components/seo/public-page-seo-content'

export const metadata: Metadata = buildPublicPageMetadata('/faq')

const FAQ_NAV_LINK_CLASS =
  'inline-flex items-center rounded-pill px-3.5 py-1.5 text-sm font-medium text-ink-muted ' +
  'cursor-pointer transition-colors duration-200 hover:bg-brand-muted hover:text-brand-strong ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

export default function FaqPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema path="/faq" pageName="FAQ" />
      <MarketingImageHero compact centered waveTone="white">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight text-ink mb-4 text-balance">
          FAQ
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
          Authentication, search, pricing, and integration, answered for developers.
        </p>
      </MarketingImageHero>
      <section
        className="bg-white section-pad pt-8 md:pt-10"
        id="faq"
        aria-label="Frequently asked questions"
      >
        <div className="container-prose">
          <nav
            aria-label="FAQ topics"
            className="sticky top-[calc(var(--site-header-offset)+0.5rem)] z-20 mb-10 md:mb-12 flex justify-center animate-rise stagger-2"
          >
            <div className="flex flex-wrap justify-center gap-1.5 rounded-brand border border-surface-border/70 bg-white/85 px-2 py-1.5 shadow-glass backdrop-blur-md">
              {FAQ_GROUPS.map((group) => (
                <a key={group.id} href={`#${group.id}`} className={FAQ_NAV_LINK_CLASS}>
                  {group.title}
                </a>
              ))}
            </div>
          </nav>
          <div className="space-y-14 md:space-y-16">
            {FAQ_GROUPS.map((group) => (
              <Reveal key={group.id}>
                <div
                  id={group.id}
                  className="scroll-mt-[calc(var(--site-header-offset)+4.5rem)]"
                >
                  <h2 className="font-display text-3xl md:text-4xl tracking-tight text-ink mb-6">
                    {group.title}
                  </h2>
                  <FaqList items={group.items} openFirst={group.id === 'general'} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <MarketingCtaBand
        title="Ready to build?"
        description="Create a free account, grab an API key, and make your first search in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/contact"
        secondaryLabel="Contact us"
      />
      <FaqSeoIntro />
      <JsonLdScript id="faq-page-jsonld" data={buildFaqPageJsonLd(ALL_FAQ_ITEMS)} />
    </div>
  )
}
