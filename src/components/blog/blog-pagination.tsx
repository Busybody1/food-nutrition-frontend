import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_VISIBLE_PAGES = 5

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

  return (
    <nav className="blog-pagination" aria-label="Blog pagination">
      <p className="blog-pagination__summary">
        Showing {start}–{end} of {total} articles
      </p>
      <ul className="blog-pagination__list">
        <li>
          {page > 1 ? (
            <Link
              href={buildBlogPageUrl(page - 1, query)}
              className="blog-pagination__control"
              prefetch={false}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Prev
            </Link>
          ) : (
            <span className="blog-pagination__control blog-pagination__control--disabled" aria-hidden>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </span>
          )}
        </li>
        {pages.map((p) => (
          <li key={p}>
            {p === page ? (
              <span className="blog-pagination__page blog-pagination__page--active" aria-current="page">
                {p}
              </span>
            ) : (
              <Link href={buildBlogPageUrl(p, query)} className="blog-pagination__page" prefetch={false}>
                {p}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link
              href={buildBlogPageUrl(page + 1, query)}
              className="blog-pagination__control"
              prefetch={false}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className="blog-pagination__control blog-pagination__control--disabled" aria-hidden>
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}

export { buildBlogPageUrl }
