'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Copy,
  Check,
  Menu,
  X,
  Search,
  AlertCircle,
  ArrowRight,
  Key,
  Zap,
  Database,
} from 'lucide-react'

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
                    className="block text-sm text-ink-muted hover:text-brand py-1.5 leading-snug"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )

  return (
    <div className="marketing-page min-h-screen">
      <div className="w-full flex">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 btn-brand shadow-glow-lg"
          aria-label="Toggle docs menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {sidebarOpen && (
          <button
            type="button"
            className="lg:hidden fixed inset-0 z-40 bg-ink/20"
            aria-label="Close docs menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-16 z-50 lg:z-30 w-64 shrink-0 h-[calc(100vh-4rem)] overflow-y-auto border-r border-surface-border/80 bg-white shadow-sidebar transition-transform lg:transition-none`}
        >
          <div className="p-5">
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

        <main className="flex-1 min-w-0 px-6 sm:px-8 lg:px-10 xl:px-12 py-8 lg:py-10">
          <section id="introduction" className="mb-12 scroll-mt-24">
            <p className="marketing-section-label mb-3">Documentation</p>
            <h1 className="font-display text-4xl text-ink mb-4">{SITE_NAME} reference</h1>
            <p className="text-lg text-ink-muted mb-4 max-w-3xl leading-relaxed">
              Access comprehensive food nutrition data with our REST API. Search, retrieve, and
              analyze nutritional information using JSON over HTTPS.
            </p>
            <p className="text-sm text-ink-muted mb-6">
              Base URL:{' '}
              <code className="px-2 py-1 rounded-brand bg-surface-elevated border border-surface-border text-ink font-mono text-xs">
                {API_BASE}/api/v1
              </code>
            </p>

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
            <h2 className="text-3xl font-bold text-ink mb-6">Getting Started</h2>
            
            <div className="space-y-8">
              {/* Step 1: Create Account */}
              <div className="flex items-start space-x-4">
                <div className="marketing-step-number">
                  1
                </div>
                <div className="flex-1">
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
              <div id="choose-plan" className="flex items-start space-x-4 scroll-mt-24">
                <div className="marketing-step-number">
                  2
                </div>
                <div className="flex-1">
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
              <div id="get-api-key" className="flex items-start space-x-4 scroll-mt-24">
                <div className="marketing-step-number">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-ink mb-2">Get Your API Key</h3>
                  <p className="text-ink-muted mb-4">
                    After subscribing to a plan, generate your API key from the dashboard. This key authenticates your requests.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Your API Key</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard('sk_live_1234567890abcdef', 'api-key')}
                        className="text-gray-300 hover:text-white"
                      >
                        {copiedCode === 'api-key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <code className="text-green-400 font-mono text-sm">sk_live_1234567890abcdef</code>
                  </div>
                  <Button asChild>
                    <Link href="/dashboard">
                      <Key className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Step 4: First Request */}
              <div id="first-request" className="flex items-start space-x-4 scroll-mt-24">
                <div className="marketing-step-number">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-ink mb-2">Make Your First Request</h3>
                  <p className="text-ink-muted mb-4">
                    Test your API key with a simple search request. Replace the API key with your actual key.
                  </p>
                  
                  {/* Language Selector */}
                  <div className="flex space-x-2 mb-4">
                    {Object.keys(codeExamples).map((lang) => (
                      <Button
                        key={lang}
                        variant={selectedLanguage === lang ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLanguage(lang)}
                        className="capitalize"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>

                  {/* Code Example */}
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                      <span className="text-sm text-gray-300">Search for &quot;apple&quot;</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples], 'first-request')}
                        className="text-gray-300 hover:text-white"
                      >
                        {copiedCode === 'first-request' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="p-4">
                      <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                        {codeExamples[selectedLanguage as keyof typeof codeExamples]}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Food API Endpoints */}
          <section id="search" className="mb-12 scroll-mt-24">
            <h2 className="text-3xl font-bold text-ink mb-6">Food API Endpoints</h2>
            <p className="text-ink-muted mb-8">
              Our API provides comprehensive access to food nutrition data through simple REST endpoints.
            </p>

            {/* Search Endpoint */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-ink mb-4">Search Foods</h3>
              <p className="text-ink-muted mb-4">
                Search for foods by name, brand, or category. Returns a list of matching foods with basic nutrition information.
              </p>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">GET /api/v1/search/foods</span>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-green-400 font-mono">
{`curl https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/search/foods?q=apple \\
  -H "X-API-Key: your_api_key_here"`}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-ink mb-2">Query Parameters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <code className="text-blue-600">q</code>
                      <span className="text-ink-muted">Search query (required)</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-600">limit</code>
                      <span className="text-ink-muted">Results per page (default: 20)</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-600">skip</code>
                      <span className="text-ink-muted">Skip results (default: 0)</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-600">brand</code>
                      <span className="text-ink-muted">Filter by brand</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-ink mb-2">Response Example</h4>
                  <div className="bg-gray-100 rounded p-3 text-sm">
                    <pre className="text-gray-800">
{`{
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
}`}
                    </pre>
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
              
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">GET /api/v1/foods/&#123;id&#125;</span>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-green-400 font-mono">
{`curl https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/foods/12345 \\
  -H "X-API-Key: your_api_key_here"`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Nutrients Endpoint */}
            <div id="nutrients" className="mb-8 scroll-mt-24">
              <h3 className="text-xl font-semibold text-ink mb-4">Nutrients</h3>
              <p className="text-ink-muted mb-4">
                Access detailed nutrient information including vitamins, minerals, and macronutrients.
              </p>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">GET /api/v1/foods/nutrients/</span>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-green-400 font-mono">
{`curl https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/foods/nutrients/ \\
  -H "X-API-Key: your_api_key_here" \\
  -G -d "limit=50" -d "skip=0"`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Brands Endpoint */}
            <div id="brands" className="mb-8 scroll-mt-24">
              <h3 className="text-xl font-semibold text-ink mb-4">Brands</h3>
              <p className="text-ink-muted mb-4">
                Retrieve brand information including company details, country of origin, and website links.
              </p>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">GET /api/v1/foods/brands/</span>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-green-400 font-mono">
{`curl https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/foods/brands/ \\
  -H "X-API-Key: your_api_key_here" \\
  -G -d "limit=100" -d "skip=0"`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Categories Endpoint */}
            <div id="categories" className="mb-8 scroll-mt-24">
              <h3 className="text-xl font-semibold text-ink mb-4">Categories</h3>
              <p className="text-ink-muted mb-4">
                Access food categories and subcategories for better organization and filtering of food items.
              </p>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">GET /api/v1/foods/categories/</span>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-green-400 font-mono">
{`curl https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/foods/categories/ \\
  -H "X-API-Key: your_api_key_here" \\
  -G -d "limit=50" -d "skip=0"`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="api-keys" className="mb-12 scroll-mt-24">
            <h2 className="text-3xl font-bold text-ink mb-6">Authentication</h2>
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
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Free</span>
                    <Badge variant="outline">10 req/min</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Basic</span>
                    <Badge variant="outline">200 req/min</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Core</span>
                    <Badge variant="outline">500 req/min</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Plus</span>
                    <Badge variant="outline">5,000 req/min · caching</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Enterprise</span>
                    <Badge variant="outline">Custom (negotiated)</Badge>
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
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code className="text-red-600">400</code>
                    <span className="text-ink-muted">Bad Request</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">401</code>
                    <span className="text-ink-muted">Unauthorized</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">429</code>
                    <span className="text-ink-muted">Rate Limited</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">500</code>
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
              <div className="flex justify-center space-x-6">
                <Link href="/contact" className="text-blue-600 hover:text-blue-800">Support</Link>
                <Link href="/faq" className="text-blue-600 hover:text-blue-800">FAQ</Link>
                <Link href="/status" className="text-blue-600 hover:text-blue-800">Status</Link>
              </div>
            </div>
          </footer>
        </main>

        <aside className="hidden xl:block w-52 shrink-0 sticky top-16 z-20 h-[calc(100vh-4rem)] overflow-y-auto border-l border-surface-border/80 bg-white">
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