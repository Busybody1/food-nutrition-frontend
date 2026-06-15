'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Menu,
  X,
  ChevronRight,
  Search,
  AlertCircle,
  ArrowRight,
  Key,
  Zap,
  Database,
} from 'lucide-react'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'
const SEARCH_URL = `${API_BASE}/api/v1/search/foods`

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('curl')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const codeExamples = {
    curl: `curl "${SEARCH_URL}?q=apple" \\
  -H "X-API-Key: your_api_key_here"`,

    javascript: `const response = await fetch('${SEARCH_URL}?q=apple', {
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,

    python: `import requests

url = "${SEARCH_URL}"
headers = {
    "X-API-Key": "your_api_key_here",
    "Content-Type": "application/json"
}
params = {"q": "apple"}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(data)`,

    php: `<?php
$url = '${SEARCH_URL}?q=apple';
$headers = [
    'X-API-Key: your_api_key_here',
    'Content-Type: application/json'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`
  }

  const navGroups = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      items: [
        { name: 'Introduction', href: '#introduction' },
        { name: 'Create Account', href: '#create-account' },
        { name: 'Choose Plan', href: '#choose-plan' },
        { name: 'Get API Key', href: '#get-api-key' },
        { name: 'First Request', href: '#first-request' },
      ],
    },
    {
      title: 'Core Resources',
      icon: Database,
      items: [
        { name: 'Search Foods', href: '#search' },
        { name: 'Food Details', href: '#food-details' },
        { name: 'Nutrients', href: '#nutrients' },
        { name: 'Brands', href: '#brands' },
        { name: 'Categories', href: '#categories' },
      ],
    },
    {
      title: 'Advanced',
      icon: Zap,
      items: [
        { name: 'API Keys', href: '#api-keys' },
        { name: 'Rate Limits', href: '#rate-limits' },
        { name: 'Error Handling', href: '#error-handling' },
      ],
    },
  ]

  const query = searchQuery.trim().toLowerCase()
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.name.toLowerCase().includes(query)),
    }))
    .filter((group) => group.items.length > 0)

  const onThisPageItems = navGroups.flatMap((group) => group.items)

  useEffect(() => {
    if (!sidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [sidebarOpen])

  const renderNav = (onNavigate?: () => void) => (
    <nav className="space-y-6" aria-label="Documentation">
      {filteredNavGroups.map((group) => {
        const Icon = group.icon
        return (
          <div key={group.title}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-ink-dim shrink-0" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
                {group.title}
              </p>
            </div>
            <ul className="space-y-0.5 border-l border-surface-border pl-3 ml-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="docs-nav-link"
                  >
                    <span className="min-w-0">{item.name}</span>
                    <ChevronRight className="docs-nav-chevron lg:hidden" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )

  const searchFoodsCurl = `curl "${API_BASE}/api/v1/search/foods?q=apple" \\
  -H "X-API-Key: your_api_key_here"`

  const foodDetailsCurl = `curl "${API_BASE}/api/v1/foods/12345" \\
  -H "X-API-Key: your_api_key_here"`

  const nutrientsCurl = `curl "${API_BASE}/api/v1/foods/nutrients/" \\
  -H "X-API-Key: your_api_key_here" \\
  -G -d "limit=50" -d "skip=0"`

  const brandsCurl = `curl "${API_BASE}/api/v1/foods/brands/" \\
  -H "X-API-Key: your_api_key_here" \\
  -G -d "limit=100" -d "skip=0"`

  const categoriesCurl = `curl "${API_BASE}/api/v1/foods/categories/" \\
  -H "X-API-Key: your_api_key_here" \\
  -G -d "limit=50" -d "skip=0"`

  const responseExample = `{
  "foods": [
    {
      "id": 12345,
      "name": "Apple, raw",
      "brand": "Generic",
      "calories": 52,
      "protein": 0.3,
      "carbs": 13.8,
      "fat": 0.2
    }
  ],
  "total": 1,
  "page": 1
}`

  return (
    <div className="marketing-page docs-page min-h-screen">
      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-4 inline-flex">Documentation</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">
          {SITE_NAME} reference
        </h1>
        <p className="text-lg text-ink-muted max-w-2xl mx-auto">
          Search, retrieve, and analyze nutritional information with our REST API over HTTPS.
        </p>
        <p className="mt-4 text-sm text-ink-muted">
          Base URL: <code className="docs-inline-code">{API_BASE}/api/v1</code>
        </p>
      </MarketingImageHero>

      <div className="docs-layout bg-white -mt-1">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="docs-sidebar-fab"
            aria-label="Open docs menu"
          >
            <Menu className="w-5 h-5" aria-hidden />
          </button>
        )}

        {sidebarOpen && (
          <button
            type="button"
            className="docs-sidebar-backdrop"
            aria-label="Close docs menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`docs-sidebar shrink-0 ${sidebarOpen ? 'docs-sidebar--open' : ''}`}
          aria-label="Documentation navigation"
        >
          <div className="docs-sidebar__header">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong">
                {SITE_NAME}
              </p>
              <p className="text-sm font-semibold text-ink truncate">Documentation</p>
            </div>
            <button
              type="button"
              className="docs-sidebar__close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close docs menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="docs-sidebar__scroll">
            <label className="relative block mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-dim" />
              <input
                type="search"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm rounded-brand border border-surface-border bg-white text-ink placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            {renderNav(() => setSidebarOpen(false))}
          </div>
        </aside>

        <main className="docs-main">
          <section id="introduction" className="mb-12 scroll-mt-[calc(var(--site-header-offset)+1rem)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-3xl">
              <div className="flex items-center gap-2 rounded-brand border border-surface-border px-4 py-3 text-sm text-ink-muted">
                <Key className="h-4 w-4 text-brand shrink-0" />
                API key auth
              </div>
              <div className="flex items-center gap-2 rounded-brand border border-surface-border px-4 py-3 text-sm text-ink-muted">
                <Zap className="h-4 w-4 text-brand shrink-0" />
                REST + JSON
              </div>
              <div className="flex items-center gap-2 rounded-brand border border-surface-border px-4 py-3 text-sm text-ink-muted">
                <Database className="h-4 w-4 text-brand shrink-0" />
                Food database
              </div>
            </div>

            <div className="marketing-callout mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-brand-strong mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-ink mb-2">Quick start</h3>
                  <p className="text-ink-muted mb-4 leading-relaxed">
                    Get started in minutes with our comprehensive food database API.
                    Create an account, choose a plan, get your API key, and start making requests.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Database className="w-3 h-3" />
                      50,000+ foods
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="w-3 h-3" />
                      Real-time data
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Key className="w-3 h-3" />
                      Easy integration
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Steps */}
          <section id="create-account" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-6">Getting Started</h2>
            
            <div className="space-y-8">
              {/* Step 1: Create Account */}
              <div className="docs-step">
                <div className="marketing-step-number shrink-0">
                  1
                </div>
                <div className="docs-step__body">
                  <h3 className="text-xl font-semibold text-ink mb-2">Create Your Account</h3>
                  <p className="text-ink-muted mb-4">
                    Sign up for a free account to access the Food API. No credit card required for the free tier.
                  </p>
                  <Button asChild>
                    <Link href="/auth/register">
                      Create Account <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Step 2: Choose Plan */}
              <div id="choose-plan" className="docs-step">
                <div className="marketing-step-number shrink-0">
                  2
                </div>
                <div className="docs-step__body">
                  <h3 className="text-xl font-semibold text-ink mb-2">Choose Your Plan</h3>
                  <p className="text-ink-muted mb-4">
                    Select a plan that fits your needs. Start with our free plan or upgrade for more requests and features.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Free</CardTitle>
                        <p className="text-2xl font-bold text-green-600">$0<span className="text-sm font-normal text-gray-500">/month</span></p>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-ink-muted space-y-1">
                          <li>• 1,000 requests/month</li>
                          <li>• 10 requests/minute (per account)</li>
                          <li>• Non-commercial use</li>
                          <li>• Community support</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Basic</CardTitle>
                        <p className="text-2xl font-bold text-blue-600">$29<span className="text-sm font-normal text-gray-500">/month</span></p>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-ink-muted space-y-1">
                          <li>• 100,000 requests/month</li>
                          <li>• 200 requests/minute</li>
                          <li>• Non-commercial use</li>
                          <li>• Email support</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Core</CardTitle>
                        <p className="text-2xl font-bold text-purple-600">$99<span className="text-sm font-normal text-gray-500">/month</span></p>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-ink-muted space-y-1">
                          <li>• 750,000 requests/month</li>
                          <li>• 500 requests/minute</li>
                          <li>• Non-commercial use</li>
                          <li>• Priority support</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <Button variant="outline" asChild className="mt-4">
                    <Link href="/pricing">View All Plans</Link>
                  </Button>
                </div>
              </div>

              {/* Step 3: Get API Key */}
              <div id="get-api-key" className="docs-step">
                <div className="marketing-step-number shrink-0">
                  3
                </div>
                <div className="docs-step__body">
                  <h3 className="text-xl font-semibold text-ink mb-2">Get Your API Key</h3>
                  <p className="text-ink-muted mb-4">
                    After subscribing to a plan, generate your API key from the dashboard. This key authenticates your requests.
                  </p>
                  <DocsCodeBlock
                    title="Your API Key"
                    code="sk_live_1234567890abcdef"
                    copyId="api-key"
                    copiedId={copiedCode}
                    onCopy={copyToClipboard}
                  />
                  <Button asChild>
                    <Link href="/dashboard">
                      <Key className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Step 4: First Request */}
              <div id="first-request" className="docs-step">
                <div className="marketing-step-number shrink-0">
                  4
                </div>
                <div className="docs-step__body">
                  <h3 className="text-xl font-semibold text-ink mb-2">Make Your First Request</h3>
                  <p className="text-ink-muted mb-4">
                    Test your API key with a simple search request. Replace the API key with your actual key.
                  </p>

                  <div className="docs-lang-tabs">
                    {Object.keys(codeExamples).map((lang) => (
                      <Button
                        key={lang}
                        variant={selectedLanguage === lang ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLanguage(lang)}
                        className="capitalize"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>

                  <DocsCodeBlock
                    title='Search for "apple"'
                    code={codeExamples[selectedLanguage as keyof typeof codeExamples]}
                    copyId="first-request"
                    copiedId={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Food API Endpoints */}
          <section id="search" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-6">Food API Endpoints</h2>
            <p className="text-ink-muted mb-8">
              Our API provides comprehensive access to nutrition and food data through simple REST endpoints.
            </p>

            {/* Search Endpoint */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-ink mb-4">Search Foods</h3>
              <p className="text-ink-muted mb-4">
                Search for foods by name, brand, or category. Returns a list of matching foods with basic nutrition information.
              </p>
              
              <DocsCodeBlock title="GET /api/v1/search/foods" code={searchFoodsCurl} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                <div className="min-w-0">
                  <h4 className="font-semibold text-ink mb-2">Query Parameters</h4>
                  <div className="space-y-0 text-sm">
                    <div className="docs-param-row">
                      <code className="text-blue-600 shrink-0">q</code>
                      <span className="text-ink-muted">Search query (required)</span>
                    </div>
                    <div className="docs-param-row">
                      <code className="text-blue-600 shrink-0">limit</code>
                      <span className="text-ink-muted">Results per page (default: 20)</span>
                    </div>
                    <div className="docs-param-row">
                      <code className="text-blue-600 shrink-0">skip</code>
                      <span className="text-ink-muted">Skip results (default: 0)</span>
                    </div>
                    <div className="docs-param-row">
                      <code className="text-blue-600 shrink-0">brand</code>
                      <span className="text-ink-muted">Filter by brand</span>
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-ink mb-2">Response Example</h4>
                  <div className="bg-gray-100 rounded-brand overflow-hidden max-w-full">
                    <pre className="docs-response-pre">{responseExample}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Food Details Endpoint */}
            <div id="food-details" className="mb-8 scroll-mt-24">
              <h3 className="text-xl font-semibold text-ink mb-4">Food Details</h3>
              <p className="text-ink-muted mb-4">
                Get detailed nutritional information for a specific food item by its ID.
              </p>
              
              <DocsCodeBlock title="GET /api/v1/foods/{id}" code={foodDetailsCurl} />
            </div>

            {/* Nutrients Endpoint */}
            <div id="nutrients" className="mb-8 scroll-mt-24">
              <h3 className="text-xl font-semibold text-ink mb-4">Nutrients</h3>
              <p className="text-ink-muted mb-4">
                Access detailed nutrient information including vitamins, minerals, and macronutrients.
              </p>
              
              <DocsCodeBlock title="GET /api/v1/foods/nutrients/" code={nutrientsCurl} />
            </div>

            {/* Brands Endpoint */}
            <div id="brands" className="mb-8 scroll-mt-24">
              <h3 className="text-xl font-semibold text-ink mb-4">Brands</h3>
              <p className="text-ink-muted mb-4">
                Retrieve brand information including company details, country of origin, and website links.
              </p>
              
              <DocsCodeBlock title="GET /api/v1/foods/brands/" code={brandsCurl} />
            </div>

            {/* Categories Endpoint */}
            <div id="categories" className="mb-8 scroll-mt-24">
              <h3 className="text-xl font-semibold text-ink mb-4">Categories</h3>
              <p className="text-ink-muted mb-4">
                Access food categories and subcategories for better organization and filtering of food items.
              </p>
              
              <DocsCodeBlock title="GET /api/v1/foods/categories/" code={categoriesCurl} />
            </div>
          </section>

          {/* Authentication */}
          <section id="api-keys" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-6">Authentication</h2>
            <p className="text-ink-muted mb-6">
              All API requests require authentication using your API key. Include it in the request headers.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Keep Your API Key Secure</h3>
                  <p className="text-yellow-800">
                    Never expose your API key in client-side code or public repositories. 
                    Use environment variables or secure configuration management.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="rate-limits" className="scroll-mt-24">
                <h3 className="text-xl font-semibold text-ink mb-4">Rate Limits &amp; abuse protection</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Limits apply <strong>per account (user id)</strong>, not per IP — safe behind NAT and multi-tenant apps.
                  See <Link href="/pricing" className="text-brand-strong hover:underline">pricing</Link> for monthly quotas.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded min-w-0">
                    <span className="font-medium">Free</span>
                    <Badge variant="outline" className="w-fit">10 req/min</Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded min-w-0">
                    <span className="font-medium">Basic</span>
                    <Badge variant="outline" className="w-fit">200 req/min</Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded min-w-0">
                    <span className="font-medium">Core</span>
                    <Badge variant="outline" className="w-fit">500 req/min</Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded min-w-0">
                    <span className="font-medium">Plus</span>
                    <Badge variant="outline" className="w-fit shrink-0">5,000 req/min · caching</Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded min-w-0">
                    <span className="font-medium">Enterprise</span>
                    <Badge variant="outline" className="w-fit">Custom (negotiated)</Badge>
                  </div>
                </div>
                <ul className="mt-4 text-sm text-ink-muted space-y-2 list-disc pl-5">
                  <li>
                    <strong>5% food coverage cap:</strong> each plan may access at most 5% of distinct foods in the database per calendar month (anti-scrape).
                  </li>
                  <li>
                    <strong>Commercial use</strong> requires Plus or Enterprise. Send{' '}
                    <code className="text-xs bg-gray-100 px-1 rounded">X-API-Usage-Type: commercial</code> only when applicable.
                  </li>
                  <li>
                    Plus and Enterprise GET search/food responses may be cached for 5 minutes per account (Redis).
                  </li>
                  <li>HTTP <code className="text-xs">429</code> rate limit · <code className="text-xs">402</code> monthly quota · <code className="text-xs">403</code> commercial or food cap</li>
                </ul>
              </div>
              <div id="error-handling" className="scroll-mt-24">
                <h3 className="text-xl font-semibold text-ink mb-4">Error Handling</h3>
                <div className="space-y-0 text-sm">
                  <div className="docs-param-row">
                    <code className="text-red-600 shrink-0">400</code>
                    <span className="text-ink-muted">Bad Request</span>
                  </div>
                  <div className="docs-param-row">
                    <code className="text-red-600 shrink-0">401</code>
                    <span className="text-ink-muted">Unauthorized</span>
                  </div>
                  <div className="docs-param-row">
                    <code className="text-red-600 shrink-0">429</code>
                    <span className="text-ink-muted">Rate Limited</span>
                  </div>
                  <div className="docs-param-row">
                    <code className="text-red-600 shrink-0">500</code>
                    <span className="text-ink-muted">Server Error</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Footer */}
          <footer className="border-t border-gray-200 pt-8 mt-12">
            <div className="text-center text-ink-muted">
              <p className="mb-2">Need help? Contact our support team or check our FAQ.</p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <Link href="/contact" className="text-brand-strong hover:underline">Support</Link>
                <Link href="/faq" className="text-brand-strong hover:underline">FAQ</Link>
                <Link href="/api-status" className="text-brand-strong hover:underline">Status</Link>
              </div>
            </div>
          </footer>
        </main>

        <aside className="hidden xl:block w-52 shrink-0 sticky top-[var(--site-header-offset)] z-20 h-[calc(100vh-var(--site-header-offset))] overflow-y-auto border-l border-surface-border/80 bg-white">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-dim mb-4">
              On this page
            </p>
            <ul className="space-y-1">
              {onThisPageItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block text-sm text-ink-muted hover:text-brand py-1 leading-snug"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}