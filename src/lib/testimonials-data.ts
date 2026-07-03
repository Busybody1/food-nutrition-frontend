export type Testimonial = {
  quote: string
  author: string
  role: string
  company?: string
}

/**
 * Real customer quotes only — the Testimonials section renders nothing while
 * this list is empty. Do not add placeholder or invented quotes; fake social
 * proof damages entity trust with users, Google, and AI crawlers alike.
 */
export const TESTIMONIALS: Testimonial[] = []
