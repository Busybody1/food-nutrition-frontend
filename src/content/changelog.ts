export type ChangelogEntry = {

  id: string

  date: string
  title: string
  body: string
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: 'docs-and-site-expansion',
    date: '2026-07',
    title: 'Documentation & site expansion',
    body: 'Per-endpoint API reference pages, framework integration guides (React Native, Next.js, Flutter, Node.js, Python), solution and comparison pages, and llms-full.txt for AI crawlers.',
  },
  {
    id: 'search-extensions',
    date: '2026-05',
    title: 'Search extensions',
    body: 'match_mode, verified_only, suggest, barcode, and public demo endpoint.',
  },
  {
    id: 'platform-fixes',
    date: '2026-05',
    title: 'Platform fixes',
    body: 'Rate limiting paths, admin API alignment, and register→login flow.',
  },
  {
    id: 'dashboard-refresh',
    date: '2026-05',
    title: 'Dashboard refresh',
    body: 'Updated developer dashboard and marketing site UI for clearer navigation and usage insights.',
  },
]
