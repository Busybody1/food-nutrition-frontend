import type { FaqItem } from '@/lib/faq-data'

export type DocsParamRow = { name: string; description: string }

/**
 * Block-based docs content model. Pages render blocks with the shared
 * DocsSectionPage template; llms-full.txt renders the same blocks as text.
 */
export type DocsBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string; id?: string }
  | { kind: 'h3'; text: string; id?: string }
  | { kind: 'code'; title: string; code: string }
  | { kind: 'json'; title: string; code: string }
  | { kind: 'params'; title: string; rows: DocsParamRow[] }
  | { kind: 'list'; items: string[] }

export type DocsSectionContent = {
  blocks: DocsBlock[]
  faqs: readonly FaqItem[]
}

export type DocsGroup = 'Endpoints' | 'Advanced'

export type DocsSectionMeta = {
  /** URL segment under /docs/ */
  slug: string
  /** h1 and sidebar label */
  title: string
  /** <title> prefix (suffixed with site name by buildPageMetadata) */
  metaTitle: string
  description: string
  keywords: string[]
  /** One-line summary for hub cards and llms.txt */
  summary: string
  /** ISO date, update when the section content materially changes */
  dateModified: string
  group: DocsGroup
}
