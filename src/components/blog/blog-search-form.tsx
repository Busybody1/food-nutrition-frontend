'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function BlogSearchForm({ defaultQuery = '' }: { defaultQuery?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(defaultQuery)

  function navigate(nextQuery: string) {
    const params = new URLSearchParams()
    const trimmed = nextQuery.trim()
    if (trimmed) params.set('q', trimmed)
    const qs = params.toString()
    router.push(qs ? `/blog?${qs}` : '/blog')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    navigate(value)
  }

  function clearSearch() {
    setValue('')
    router.push('/blog')
  }

  return (
    <form className="blog-search" onSubmit={onSubmit} role="search">
      <label htmlFor="blog-search-input" className="sr-only">
        Search articles
      </label>
      <div className="blog-search__field">
        <Search className="blog-search__icon h-4 w-4" aria-hidden />
        <input
          id="blog-search-input"
          name="q"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by title, topic, or keyword…"
          className="blog-search__input"
          autoComplete="off"
          maxLength={100}
        />
        {value && (
          <button
            type="button"
            onClick={clearSearch}
            className="blog-search__clear"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      <button type="submit" className="blog-search__submit">
        Search
      </button>
    </form>
  )
}
