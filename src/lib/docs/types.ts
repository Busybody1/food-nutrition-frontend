import type { FaqItem } from '@/lib/faq-data'

export type DocsParamRow = { name: string; description: string }

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

  slug: string

  title: string

  metaTitle: string
  description: string
  keywords: string[]

  summary: string

  dateModified: string
  group: DocsGroup
}
