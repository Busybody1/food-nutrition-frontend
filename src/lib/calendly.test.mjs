import assert from 'node:assert/strict'
import test from 'node:test'
import { calendlyEmbedSrc, resolveCalendlyUrl } from './calendly.ts'

const DEFAULT_URL = 'https://calendly.com/busybodycomp/30min'

test('resolveCalendlyUrl uses the BusyBody 30-minute event by default', () => {
  assert.equal(resolveCalendlyUrl(undefined), DEFAULT_URL)
  assert.equal(resolveCalendlyUrl(''), DEFAULT_URL)
})

test('resolveCalendlyUrl accepts https Calendly URLs', () => {
  assert.equal(
    resolveCalendlyUrl('https://calendly.com/busybodycomp/30min/'),
    DEFAULT_URL
  )
  assert.equal(
    resolveCalendlyUrl('https://www.calendly.com/busybodycomp/45min'),
    'https://www.calendly.com/busybodycomp/45min'
  )
})

test('resolveCalendlyUrl rejects non-Calendly or non-https URLs', () => {
  assert.equal(resolveCalendlyUrl('http://calendly.com/busybodycomp/30min'), DEFAULT_URL)
  assert.equal(resolveCalendlyUrl('https://evil.example/phish'), DEFAULT_URL)
  assert.equal(resolveCalendlyUrl('javascript:alert(1)'), DEFAULT_URL)
  assert.equal(resolveCalendlyUrl('not a url'), DEFAULT_URL)
})

test('calendlyEmbedSrc hides the GDPR banner for inline embeds', () => {
  const src = calendlyEmbedSrc()
  assert.ok(src.startsWith(DEFAULT_URL))
  assert.ok(src.includes('hide_gdpr_banner=1'))
})
