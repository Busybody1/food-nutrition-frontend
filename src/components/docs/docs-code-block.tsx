'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DocsCodeBlockProps = {
  title?: string
  code: string
  copyId?: string
  copiedId?: string | null
  onCopy?: (code: string, id: string) => void
  /** Show a self-managed copy button (no external state needed). */
  copyable?: boolean
  className?: string
}

export function DocsCodeBlock({
  title,
  code,
  copyId,
  copiedId,
  onCopy,
  copyable = false,
  className = '',
}: DocsCodeBlockProps) {
  const [selfCopied, setSelfCopied] = useState(false)
  const externalCopy = Boolean(copyId && onCopy)
  const showCopy = externalCopy || copyable

  const copied = externalCopy ? copiedId === copyId : selfCopied

  const handleCopy = () => {
    if (externalCopy && copyId && onCopy) {
      onCopy(code, copyId)
      return
    }
    navigator.clipboard.writeText(code)
    setSelfCopied(true)
    setTimeout(() => setSelfCopied(false), 2000)
  }

  return (
    <div className={`docs-code-panel ${className}`.trim()}>
      {(title || showCopy) && (
        <div className="docs-code-panel__header">
          {title ? <span className="docs-code-panel__title">{title}</span> : <span />}
          {showCopy && (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={handleCopy}
              className="shrink-0 text-slate-300 hover:text-white h-8 w-8 p-0"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4" aria-hidden />
              ) : (
                <Copy className="w-4 h-4" aria-hidden />
              )}
            </Button>
          )}
        </div>
      )}
      {/* Focusable so keyboard users can horizontally scroll wide code. */}
      <pre
        className="docs-code-pre focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/60"
        tabIndex={0}
        role="region"
        aria-label={title || 'Code sample'}
      >
        {code}
      </pre>
    </div>
  )
}
