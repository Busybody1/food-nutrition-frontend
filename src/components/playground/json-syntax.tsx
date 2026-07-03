import type { ReactNode } from 'react'

const STRING_TOKEN = /"(?:[^"\\\n]|\\.)*"(\s*:)?/g

/**
 * Lightweight JSON colorizer for the dark code windows: wraps string tokens in
 * colored spans (keys vs. string values) while keeping the rendered text
 * content byte-identical to the input. Non-JSON text passes through untouched.
 */
export function JsonSyntax({ code }: { code: string }) {
  const nodes: ReactNode[] = []
  let last = 0
  let spanKey = 0

  for (const match of code.matchAll(STRING_TOKEN)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(code.slice(last, start))

    const colonSuffix = match[1]
    if (colonSuffix) {
      const key = match[0].slice(0, match[0].length - colonSuffix.length)
      nodes.push(
        <span key={spanKey++} className="text-sky-300">
          {key}
        </span>,
        colonSuffix
      )
    } else {
      nodes.push(
        <span key={spanKey++} className="text-emerald-300">
          {match[0]}
        </span>
      )
    }
    last = start + match[0].length
  }

  if (last < code.length) nodes.push(code.slice(last))
  return <>{nodes}</>
}
