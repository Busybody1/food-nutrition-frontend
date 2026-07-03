'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function BlogSearchForm({
  defaultQuery = '',
  className,
}: {
  defaultQuery?: string
  className?: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(defaultQuery)
  const [isPending, startTransition] = useTransition()

  function navigate(nextQuery: string) {
    const params = new URLSearchParams()
    const trimmed = nextQuery.trim()
    if (trimmed) params.set('q', trimmed)
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `/blog?${qs}` : '/blog')
    })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    navigate(value)
  }

  function clearSearch() {
    setValue('')
    startTransition(() => {
      router.push('/blog')
    })
  }

  return (
    <form
      className={cn('blog-search', className)}
      onSubmit={onSubmit}
      role="search"
      aria-busy={isPending}
    >
      <label htmlFor="blog-search-input" className="sr-only">
        Search articles
      </label>
      <div className="blog-search__field">
        {isPending ? (
          <Loader2 className="blog-search__icon h-4 w-4 animate-spin text-brand-strong" aria-hidden />
        ) : (
          <Search className="blog-search__icon h-4 w-4" aria-hidden />
        )}
        <input
          id="blog-search-input"
          name="q"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by title, topic, or keyword…"
          className="blog-search__input h-11 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
          autoComplete="off"
          maxLength={100}
        />
        {value && (
          <button
            type="button"
            onClick={clearSearch}
            className="blog-search__clear cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="blog-search__submit h-11 cursor-pointer border-brand/30 px-6 font-semibold text-brand-strong transition-all duration-200 hover:border-brand/50 hover:bg-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
      >
        Search
      </button>
    </form>
  )
}
