import Image from 'next/image'
import { MarketingSectionHeader } from '@/components/marketing/marketing-shell'
import { MarketingFloatCard, MarketingFloatStack } from '@/components/marketing/marketing-cards'
import { MarketingSheet } from '@/components/marketing/marketing-sheet'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { getPublicTestimonials, type PublicTestimonial } from '@/lib/api/testimonials'

export const TESTIMONIALS_TITLE = 'What teams ship with the API'

function testimonialKey(testimonial: PublicTestimonial) {
  return `${testimonial.author_name}-${testimonial.quote.slice(0, 24)}`
}

function TestimonialAvatar({ testimonial }: { testimonial: PublicTestimonial }) {
  if (testimonial.avatar_url) {
    return (
      <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-mk-hair">
        <Image
          src={testimonial.avatar_url}
          alt={`${testimonial.author_name} portrait`}
          fill
          sizes="36px"
          className="object-cover"
        />
      </span>
    )
  }
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mk-stage text-sm font-semibold text-mk-ink ring-1 ring-mk-hair"
      aria-hidden
    >
      {testimonial.author_name.charAt(0).toUpperCase()}
    </span>
  )
}

function TestimonialByline({ testimonial }: { testimonial: PublicTestimonial }) {
  return (
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold text-mk-ink">{testimonial.author_name}</span>
      {(testimonial.author_role || testimonial.company) && (
        <span className="block truncate text-xs text-mk-muted">
          {testimonial.author_role}
          {testimonial.author_role && testimonial.company ? ', ' : ''}
          {testimonial.company}
        </span>
      )}
    </span>
  )
}

export function TestimonialStack({ testimonials }: { testimonials: PublicTestimonial[] }) {
  return (
    <MarketingFloatStack>
      {testimonials.slice(0, 3).map((testimonial) => (
        <MarketingFloatCard key={testimonialKey(testimonial)}>
          <figure>
            <figcaption className="flex items-center gap-3">
              <TestimonialAvatar testimonial={testimonial} />
              <TestimonialByline testimonial={testimonial} />
            </figcaption>
            <blockquote className="mt-2 line-clamp-2 pl-12 text-sm leading-relaxed text-mk-muted">
              “{testimonial.quote}”
            </blockquote>
          </figure>
        </MarketingFloatCard>
      ))}
    </MarketingFloatStack>
  )
}

function gridClassFor(count: number): string {
  if (count === 1) return 'grid grid-cols-1 max-w-xl mx-auto gap-4 md:gap-5'
  if (count === 2 || count === 4) return 'grid sm:grid-cols-2 max-w-4xl mx-auto gap-4 md:gap-5'
  return 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'
}

export async function Testimonials() {
  const testimonials = await getPublicTestimonials()
  if (testimonials.length === 0) return null

  return (
    <MarketingSheet aria-label="Customer testimonials">
      <div className="container-narrow">
        <Reveal>
          <MarketingSectionHeader title={TESTIMONIALS_TITLE} />
        </Reveal>
        <RevealGroup className={gridClassFor(testimonials.length)} itemClassName="h-full min-w-0">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonialKey(testimonial)}
              className="flex h-full flex-col rounded-[20px] border border-mk-hair bg-white p-6 shadow-card"
            >
              <blockquote className="mb-5 flex-1 text-base leading-relaxed text-mk-body">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <TestimonialAvatar testimonial={testimonial} />
                <TestimonialByline testimonial={testimonial} />
              </figcaption>
            </figure>
          ))}
        </RevealGroup>
      </div>
    </MarketingSheet>
  )
}
