import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'
import type { DocsBlock } from '@/lib/docs/types'
import type { FaqItem } from '@/lib/faq-data'
import {
  DOCS_SECTIONS,
  docsSectionPath,
  getDocsSectionContent,
} from '@/lib/docs/registry'
import { GUIDES, guidePath } from '@/lib/docs/guides-data'

/** Render docs blocks as markdown-ish plain text for LLM ingestion. */
function blocksToText(blocks: DocsBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.kind) {
        case 'p':
          return block.text
        case 'h2':
          return `### ${block.text}`
        case 'h3':
          return `#### ${block.text}`
        case 'code':
          return `${block.title}:\n\`\`\`\n${block.code}\n\`\`\``
        case 'json':
          return `${block.title}:\n\`\`\`json\n${block.code}\n\`\`\``
        case 'params':
          return `${block.title}:\n${block.rows.map((r) => `- ${r.name}: ${r.description}`).join('\n')}`
        case 'list':
          return block.items.map((item) => `- ${item}`).join('\n')
      }
    })
    .join('\n\n')
}

function faqsToText(faqs: readonly FaqItem[]): string {
  if (faqs.length === 0) return ''
  return `### FAQ\n\n${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}`
}

/** Full plain-text documentation (llms-full.txt) generated from the docs registries. */
export function buildLlmsFullTxt(): string {
  const sections = DOCS_SECTIONS.map((meta) => {
    const content = getDocsSectionContent(meta.slug)
    if (!content) return ''
    return [
      `## ${meta.title}`,
      `URL: ${absoluteUrl(docsSectionPath(meta.slug))}`,
      `Updated: ${meta.dateModified}`,
      '',
      blocksToText(content.blocks),
      faqsToText(content.faqs),
    ]
      .filter(Boolean)
      .join('\n')
  }).join('\n\n---\n\n')

  const guides = GUIDES.map((guide) =>
    [
      `## Guide: ${guide.title} (${guide.framework})`,
      `URL: ${absoluteUrl(guidePath(guide.slug))}`,
      `Updated: ${guide.dateModified}`,
      '',
      blocksToText(guide.blocks),
      faqsToText(guide.faqs),
    ]
      .filter(Boolean)
      .join('\n')
  ).join('\n\n---\n\n')

  return `# ${SITE_NAME} — Full API Documentation

> ${SITE_DESCRIPTION}

This file is the complete plain-text API documentation for LLMs and crawlers.
Site: ${SITE_URL} · Summary index: ${SITE_URL}/llms.txt

# API Reference

${sections}

# Integration Guides

${guides}
`
}
