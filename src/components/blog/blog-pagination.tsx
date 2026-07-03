import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_VISIBLE_PAGES = 5

const FOCUS_RING =
  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

function buildBlogPageUrl(page: number, query?: string): string {
  const params = new URLSearchParams()
  if (query?.trim()) params.set('q', query.trim())
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/blog?${qs}` : '/blog'
}

function pageRange(current: number, totalPages: number): number[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const half = Math.floor(MAX_VISIBLE_PAGES / 2)
  let start = Math.max(1, current - half)
  let end = start + MAX_VISIBLE_PAGES - 1
  if (end > totalPages) {
    end = totalPages
    start = end - MAX_VISIBLE_PAGES + 1
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function Ellipsis() {
  return (
    <span className="inline-flex h-9 min-w-6 items-center justify-center px-1 text-sm text-ink-muted" aria-hidden>
      …
    </span>
  )
}

export function BlogPagination({
  page,
  totalPages,
  total,
  pageSize,
  query,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  query?: string
}) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const pages = pageRange(page, totalPages)
  const firstVisible = pages[0]
  const lastVisible = pages[pages.length - 1]

  return (
    <nav className="blog-pagination" aria-label="Blog pagination">
      <p className="blog-pagination__summary">
        Showing {start}-{end} of {total} articles
      </p>
      <ul className="blog-pagination__list">
        <li>
          {page > 1 ? (
            <Link
              href={buildBlogPageUrl(page - 1, query)}
              className={`blog-pagination__control ${FOCUS_RING}`}
              prefetch={false}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Prev
            </Link>
          ) : (
            <span
              className="blog-pagination__control blog-pagination__control--disabled"
              aria-disabled="true"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Prev
            </span>
          )}
        </li>
        {firstVisible > 1 && (
          <li>
            <Link
              href={buildBlogPageUrl(1, query)}
              className={`blog-pagination__page ${FOCUS_RING}`}
              prefetch={false}
            >
              1
            </Link>
          </li>
        )}
        {firstVisible > 2 && (
          <li>
            <Ellipsis />
          </li>
        )}
        {pages.map((p) => (
          <li key={p}>
            {p === page ? (
              <span className="blog-pagination__page blog-pagination__page--active" aria-current="page">
                {p}
              </span>
            ) : (
              <Link
                href={buildBlogPageUrl(p, query)}
                className={`blog-pagination__page ${FOCUS_RING}`}
                prefetch={false}
              >
                {p}
              </Link>
            )}
          </li>
        ))}
        {lastVisible < totalPages - 1 && (
          <li>
            <Ellipsis />
          </li>
        )}
        {lastVisible < totalPages && (
          <li>
            <Link
              href={buildBlogPageUrl(totalPages, query)}
              className={`blog-pagination__page ${FOCUS_RING}`}
              prefetch={false}
            >
              {totalPages}
            </Link>
          </li>
        )}
        <li>
          {page < totalPages ? (
            <Link
              href={buildBlogPageUrl(page + 1, query)}
              className={`blog-pagination__control ${FOCUS_RING}`}
              prefetch={false}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span
              className="blog-pagination__control blog-pagination__control--disabled"
              aria-disabled="true"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}

export { buildBlogPageUrl }
