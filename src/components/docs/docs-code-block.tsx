'use client'

import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DocsCodeBlockProps = {
  title?: string
  code: string
  copyId?: string
  copiedId?: string | null
  onCopy?: (code: string, id: string) => void
  className?: string
}

export function DocsCodeBlock({
  title,
  code,
  copyId,
  copiedId,
  onCopy,
  className = '',
}: DocsCodeBlockProps) {
  const showCopy = Boolean(copyId && onCopy)

  return (
    <div className={`docs-code-panel ${className}`.trim()}>
      {(title || showCopy) && (
        <div className="docs-code-panel__header">
          {title ? <span className="docs-code-panel__title">{title}</span> : <span />}
          {showCopy && copyId && onCopy && (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => onCopy(code, copyId)}
              className="shrink-0 text-slate-300 hover:text-white h-8 w-8 p-0"
              aria-label="Copy code"
            >
              {copiedId === copyId ? (
                <Check className="w-4 h-4" aria-hidden />
              ) : (
                <Copy className="w-4 h-4" aria-hidden />
              )}
            </Button>
          )}
        </div>
      )}
      <pre className="docs-code-pre">{code}</pre>
    </div>
  )
}
