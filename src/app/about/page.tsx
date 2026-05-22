import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { marketingCardClass, MarketingStatStrip, MarketingCtaBand } from '@/components/marketing/marketing-shell'
import type { Metadata } from 'next'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'
import { buildPageMetadata } from '@/lib/metadata'
import { Target, Award, Globe, Heart, Brain, Zap, Shield, Clock } from 'lucide-react'

export const metadata: Metadata = buildPageMetadata({
  title: `About ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  path: '/about',
})

export default function AboutPage() {
  return (
    <div className="marketing-page">
      <MarketingHero
        badge={
          <>
            <Heart className="w-4 h-4 mr-2 inline" />
            Our story
          </>
        }
        title={
          <>
            Building the future of{' '}
            <span className="text-gradient-brand">nutrition technology</span>
          </>
        }
        subtitle="We democratize access to comprehensive nutrition data so developers can ship health and fitness products faster."
      />

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl text-ink mb-6">Our mission</h2>
            <p className="text-ink-muted leading-relaxed mb-6">
              Provide developers with accurate, searchable nutrition data — from macros to
              barcode lookup — with transparent pricing and reliable uptime.
            </p>
            <p className="text-ink-muted leading-relaxed mb-8">
              Quality nutrition data should be simple to integrate, affordable at every scale,
              and secure by default.
            </p>
            <Button asChild>
              <Link href="/docs">
                <Target className="mr-2 h-4 w-4" />
                Read the docs
              </Link>
            </Button>
          </div>
          <Card className={marketingCardClass}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Heart className="h-10 w-10 text-surface" />
              </div>
              <h3 className="text-2xl font-display text-ink mb-4">Health first</h3>
              <p className="text-ink-muted">
                Every product decision is guided by helping people make better food choices
                through trustworthy data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-ink mb-4">Core values</h2>
            <p className="text-ink-muted max-w-2xl mx-auto">
              Principles that shape our API, documentation, and support.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Innovation', description: 'Search, suggest, and barcode endpoints built for modern apps.' },
              { icon: Shield, title: 'Reliability', description: 'Rate limits, usage tracking, and health checks you can monitor.' },
              { icon: Heart, title: 'Community', description: 'Developer-first docs, examples, and responsive support.' },
              { icon: Globe, title: 'Accessibility', description: 'Free tier and public demo so you can evaluate before you commit.' },
              { icon: Brain, title: 'Intelligence', description: 'Verified foods, match modes, and rich nutrient payloads.' },
              { icon: Award, title: 'Excellence', description: 'Clear changelogs, versioning, and honest SLAs per plan.' },
            ].map(({ icon: Icon, title, description }) => (
              <Card key={title} className={`${marketingCardClass} hover:border-brand/40 transition-colors`}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-card bg-brand/20 flex items-center justify-center mb-4 text-brand">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-ink">{title}</CardTitle>
                  <CardDescription className="text-ink-dim">{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad hero-glow">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-ink mb-4">Impact</h2>
            <p className="text-ink-muted">Built for teams shipping calorie tracking, meal planning, and wellness products.</p>
          </div>
          <MarketingStatStrip
            stats={[
              { value: '2M+', label: 'Food records', icon: Zap },
              { value: '99.9%', label: 'Target uptime', icon: Clock },
              { value: '<100ms', label: 'Search p95 goal', icon: Shield },
              { value: 'Global', label: 'Developer access', icon: Globe },
            ]}
          />
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
    </div>
  )
}
