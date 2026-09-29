import assert from 'node:assert/strict'
import test from 'node:test'
import { MCP_CONNECT_STEPS, MCP_FEATURE_TITLES, MCP_PAGE_FAQS } from './catalog.ts'
import { buildMcpLandingJsonLd, buildMcpPricingJsonLd } from './landing-jsonld.ts'

const LANDING = buildMcpLandingJsonLd({
  pageUrl: 'https://calorieapi.com/mcp',
  pageName: 'Nutrition MCP server for Claude and Cursor',
  siteName: 'Calorie API',
  siteUrl: 'https://calorieapi.com',
  organizationId: 'https://calorieapi.com/#organization',
  description: 'Nutrition MCP server for Claude Code and Cursor.',
  monthlyPrice: 29,
  annualPrice: 228,
  priceValidUntil: '2027-12-31',
  faqs: MCP_PAGE_FAQS,
  steps: MCP_CONNECT_STEPS,
  features: MCP_FEATURE_TITLES,
})

test('landing schema names the nutrition MCP server and links the graph', () => {
  const types = LANDING['@graph'].map((node) => node['@type'])
  assert.deepEqual(types, ['WebPage', 'SoftwareApplication', 'HowTo', 'FAQPage'])
  const app = LANDING['@graph'][1]
  assert.equal(LANDING['@graph'][0].name, 'Nutrition MCP server for Claude and Cursor')
  assert.equal(app.name, 'Nutrition MCP server')
  assert.equal(app['@id'], 'https://calorieapi.com/mcp#nutrition-mcp-server')
  assert.equal(LANDING['@graph'][0].mainEntity['@id'], app['@id'])
  assert.equal(app.provider['@id'], 'https://calorieapi.com/#organization')
  assert.equal(app.offers[0].price, '29')
  assert.equal(app.offers[1].price, '228')
  assert.equal(app.offers[0].priceCurrency, 'USD')
  assert.equal(app.aggregateRating, undefined)
  assert.deepEqual(app.featureList, [...MCP_FEATURE_TITLES])
  assert.equal(LANDING['@graph'][2].step.length, MCP_CONNECT_STEPS.length)
  assert.equal(LANDING['@graph'][2].step[0].name, MCP_CONNECT_STEPS[0].name)
  assert.equal(LANDING['@graph'][2].step[0].text, MCP_CONNECT_STEPS[0].text)
  const questions = LANDING['@graph'][3].mainEntity.map((item) => item.name)
  assert.deepEqual(questions, MCP_PAGE_FAQS.map((item) => item.q))
  assert.equal(JSON.stringify(LANDING).includes('fn_'), false)
})

test('pricing schema uses the nutrition MCP product, not the REST API name', () => {
  const data = buildMcpPricingJsonLd({
    pageUrl: 'https://calorieapi.com/mcp/pricing',
    pageName: 'Nutrition MCP server pricing',
    siteName: 'Calorie API',
    siteUrl: 'https://calorieapi.com',
    organizationId: 'https://calorieapi.com/#organization',
    description: 'Nutrition MCP server pricing.',
    imageUrl: 'https://calorieapi.com/mcp/pricing/opengraph-image',
    monthlyPrice: 29,
    annualPrice: 228,
    priceValidUntil: '2027-12-31',
    faqs: [{ q: 'How much does a nutrition MCP server cost?', a: '$29 a month.' }],
  })
  const app = data['@graph'].find((node) => node['@type'] === 'SoftwareApplication')
  const page = data['@graph'].find((node) => node['@type'] === 'WebPage')
  assert.equal(page.name, 'Nutrition MCP server pricing')
  assert.deepEqual(page.speakable.cssSelector, ['h1', '#mcp-pricing-answer'])
  assert.equal(app.name, 'Nutrition MCP server')
  assert.equal(app.description, 'Nutrition MCP server pricing.')
  assert.equal(app.offers[1].price, '228')
  assert.equal(app.offers[1].eligibleDuration.unitCode, 'ANN')
  assert.equal(JSON.stringify(data).includes('Food Database API'), false)
})
