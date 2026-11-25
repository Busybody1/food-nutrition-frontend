'use client'

import { useState } from 'react'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'
import { cn } from '@/lib/utils/cn'

export function DocsLanguageTabs({
  title,
  examples,
}: {
  title: string
  examples: Record<string, string>
}) {
  const languages = Object.keys(examples)
  const [selected, setSelected] = useState(languages[0])

  return (
    <div>
      <div className="docs-lang-tabs">
        {languages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setSelected(lang)}
            aria-pressed={selected === lang}
            className={cn(
              'inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-[13px] font-medium capitalize transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
              selected === lang
                ? 'bg-brand text-mk-ink'
                : 'border border-mk-line bg-white text-mk-ink hover:bg-mk-stage'
            )}
          >
            {lang}
          </button>
        ))}
      </div>
      <DocsCodeBlock title={title} code={examples[selected]} copyable />
    </div>
  )
}
