import type { DocsNavGroup } from '@/components/docs/docs-sidebar'
import { DOCS_SECTIONS, docsSectionPath } from '@/lib/docs/registry'
import { GUIDES, guidePath } from '@/lib/docs/guides-data'

/** Sidebar navigation for all docs pages, derived from the section/guide registries. */
export function buildDocsNavGroups(): DocsNavGroup[] {
  return [
    {
      title: 'Getting Started',
      items: [
        { name: 'Overview & Quickstart', href: '/docs' },
        { name: 'API Playground', href: '/playground' },
      ],
    },
    {
      title: 'Endpoints',
      items: DOCS_SECTIONS.filter((s) => s.group === 'Endpoints').map((s) => ({
        name: s.title,
        href: docsSectionPath(s.slug),
      })),
    },
    {
      title: 'Guides',
      items: [
        { name: 'All guides', href: '/docs/guides' },
        ...GUIDES.map((g) => ({ name: g.framework, href: guidePath(g.slug) })),
      ],
    },
    {
      title: 'Advanced',
      items: DOCS_SECTIONS.filter((s) => s.group === 'Advanced').map((s) => ({
        name: s.title,
        href: docsSectionPath(s.slug),
      })),
    },
  ]
}
