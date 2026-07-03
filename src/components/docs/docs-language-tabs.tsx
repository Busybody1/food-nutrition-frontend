'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'

/** Self-contained language switcher for multi-language code samples. */
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
          <Button
            key={lang}
            variant={selected === lang ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelected(lang)}
            className="capitalize"
          >
            {lang}
          </Button>
        ))}
      </div>
      <DocsCodeBlock title={title} code={examples[selected]} copyable />
    </div>
  )
}
