import type { ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return nodeText((node.props as { children?: ReactNode }).children)
  }
  return ''
}

function headingId(children: ReactNode): string | undefined {
  const slug = nodeText(children)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return slug || undefined
}

function splitLead(content: string): { lead: string | null; rest: string } {
  if (/^(#|```|\||>|- )/.test(content)) return { lead: null, rest: content }
  const gap = content.search(/\n\s*\n/)
  if (gap === -1) return { lead: content, rest: '' }
  return { lead: content.slice(0, gap), rest: content.slice(gap).replace(/^\n+/, '') }
}

function markdownComponents(markAnswer: boolean): Components {
  return {
    p: ({ children }) => (markAnswer ? <p className="aeo-answer">{children}</p> : <p>{children}</p>),
    h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
    h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
    pre: ({ children }) => (
      <pre className="!border-white/10 !bg-[#0f172a] shadow-glass [&_code]:!text-slate-200">
        {children}
      </pre>
    ),
    img: ({ node, ...props }) => {
      void node
      return <img {...props} loading="lazy" decoding="async" />
    },
    table: ({ children }) => (
      <div className="blog-table-wrap">
        <table>{children}</table>
      </div>
    ),
  }
}

export function MarkdownContent({ content }: { content: string }) {
  const { lead, rest } = splitLead(content)
  return (
    <div className="blog-prose">
      {lead ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(true)}>
          {lead}
        </ReactMarkdown>
      ) : null}
      {rest ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(false)}>
          {rest}
        </ReactMarkdown>
      ) : null}
    </div>
  )
}
