import type { Metadata } from 'next'
import { FaqList } from '@/components/marketing/faq-section'
import { ALL_FAQ_ITEMS, FAQ_GROUPS, buildFaqPageJsonLd } from '@/lib/faq-data'
import { JsonLdScript } from '@/components/seo/structured-data'
import { MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { FaqSeoIntro } from '@/components/seo/public-page-seo-content'

export const metadata: Metadata = buildPublicPageMetadata('/faq')

const FAQ_SEO = getPublicPageSeo('/faq')

const FAQ_NAV_LINK_CLASS =
  'inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium text-mk-muted ' +
  'cursor-pointer transition-colors duration-200 hover:bg-mk-stage hover:text-mk-ink ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

export default function FaqPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema path="/faq" pageName={FAQ_SEO.title ?? 'Nutrition API FAQ'} speakable />
      <MarketingSheetHero title={FAQ_SEO.title} lead={FAQ_SEO.description} leadClassName="aeo-answer" />
      <section className="pb-14 pt-8 md:pb-20 md:pt-10" id="faq" aria-label="Frequently asked questions">
        <div className="container-prose">
          <nav
            aria-label="FAQ topics"
            className="sticky top-[calc(var(--site-header-offset)+0.75rem)] z-20 mb-10 md:mb-12 flex justify-center animate-rise stagger-2"
          >
            <div className="flex flex-wrap justify-center gap-1 rounded-[20px] border border-mk-hair bg-white p-1 shadow-card">
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
                  <h2 className="marketing-h3 mb-6">
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
