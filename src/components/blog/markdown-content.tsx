import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return nodeText((node.props as { children?: ReactNode }).children)
  }
  return ''
}

/** GitHub-style anchor id derived from the rendered heading text (text untouched). */
function headingId(children: ReactNode): string | undefined {
  const slug = nodeText(children)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return slug || undefined
}

/**
 * Renders trusted Markdown as HTML. Raw HTML is intentionally NOT enabled
 * (no rehype-raw), so post content cannot inject scripts or arbitrary markup.
 */
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
          pre: ({ children }) => (
            <pre className="!border-white/10 !bg-[#0f172a] shadow-glass [&_code]:!text-slate-200">
              {children}
            </pre>
          ),
          img: ({ node, ...props }) => {
            void node
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            return <img {...props} loading="lazy" decoding="async" />
          },
          table: ({ children }) => (
            <div className="blog-table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
