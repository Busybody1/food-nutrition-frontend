'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Copy, Check, Menu, X, ChevronDown, ChevronUp,
  AlertCircle, ArrowRight, Key, Zap, Database
} from 'lucide-react'

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('curl')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const codeExamples = {
    curl: `curl https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/search/foods?q=apple \\
  -H "X-API-Key: your_api_key_here"`,

    javascript: `const response = await fetch('https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/search/foods?q=apple', {
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,

    python: `import requests

url = "https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/search/foods"
headers = {
    "X-API-Key": "your_api_key_here",
    "Content-Type": "application/json"
}
params = {"q": "apple"}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(data)`,

    php: `<?php
$url = 'https://food-nutrition-database-cd7099c2be07.herokuapp.com/api/v1/search/foods?q=apple';
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

  const sidebarItems = [
    {
      title: 'Getting Started',
      items: [
        { name: 'Introduction', href: '#introduction' },
        { name: 'Create Account', href: '#create-account' },
        { name: 'Choose Plan', href: '#choose-plan' },
        { name: 'Get API Key', href: '#get-api-key' },
        { name: 'First Request', href: '#first-request' }
      ]
    },
    {
      title: 'Food API Endpoints',
      items: [
        { name: 'Search Foods', href: '#search' },
        { name: 'Food Details', href: '#food-details' },
        { name: 'Nutrients', href: '#nutrients' },
        { name: 'Brands', href: '#brands' },
        { name: 'Categories', href: '#categories' }
      ]
    },
    {
      title: 'Authentication',
      items: [
        { name: 'API Keys', href: '#api-keys' },
        { name: 'Rate Limits', href: '#rate-limits' },
        { name: 'Error Handling', href: '#error-handling' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Food API</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/docs" className="text-gray-900 font-medium">Docs</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Support</Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-gray-50 border-r border-gray-200 min-h-screen sticky top-16 z-40`}>
          <div className="p-6">
            <div className="space-y-6">
              {sidebarItems.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-900 mb-2 hover:text-blue-600"
                  >
                    {section.title}
                    {expandedSection === section.title ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSection === section.title && (
                    <div className="space-y-1 ml-4">
                      {section.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          href={item.href}
                          className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Introduction */}
          <section id="introduction" className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Food API Documentation</h1>
            <p className="text-xl text-gray-600 mb-6">
              Access comprehensive food nutrition data with our powerful REST API. 
              Search, retrieve, and analyze nutritional information for thousands of foods.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Start</h3>
                  <p className="text-blue-800 mb-4">
                    Get started in minutes with our comprehensive food database API. 
                    Create an account, choose a plan, get your API key, and start making requests.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      <Database className="w-3 h-3 mr-1" />
                      50,000+ Foods
                    </Badge>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      <Zap className="w-3 h-3 mr-1" />
                      Real-time Data
                    </Badge>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      <Key className="w-3 h-3 mr-1" />
                      Easy Integration
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Steps */}
          <section id="create-account" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started</h2>
            
            <div className="space-y-8">
              {/* Step 1: Create Account */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Account</h3>
                  <p className="text-gray-600 mb-4">
                    Sign up for a free account to access the Food API. No credit card required for the free tier.
                  </p>
                  <Button asChild>
                    <Link href="/signup">
                      Create Account <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Step 2: Choose Plan */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Plan</h3>
                  <p className="text-gray-600 mb-4">
                    Select a plan that fits your needs. Start with our free plan or upgrade for more requests and features.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Free</CardTitle>
                        <p className="text-2xl font-bold text-green-600">$0<span className="text-sm font-normal text-gray-500">/month</span></p>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 20 requests/day</li>
                          <li>• 3 requests/minute</li>
                          <li>• Basic endpoints</li>
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
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 1,000 requests/day</li>
                          <li>• 10 requests/minute</li>
                          <li>• All endpoints</li>
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
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 5,000 requests/day</li>
                          <li>• 30 requests/minute</li>
                          <li>• All features</li>
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
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Your API Key</h3>
                  <p className="text-gray-600 mb-4">
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
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Make Your First Request</h3>
                  <p className="text-gray-600 mb-4">
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
          <section id="search" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Food API Endpoints</h2>
            <p className="text-gray-600 mb-8">
              Our API provides comprehensive access to food nutrition data through simple REST endpoints.
            </p>

            {/* Search Endpoint */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Search Foods</h3>
              <p className="text-gray-600 mb-4">
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
                  <h4 className="font-semibold text-gray-900 mb-2">Query Parameters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <code className="text-blue-600">q</code>
                      <span className="text-gray-600">Search query (required)</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-600">limit</code>
                      <span className="text-gray-600">Results per page (default: 20)</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-600">skip</code>
                      <span className="text-gray-600">Skip results (default: 0)</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-600">brand</code>
                      <span className="text-gray-600">Filter by brand</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Response Example</h4>
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
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Food Details</h3>
              <p className="text-gray-600 mb-4">
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
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Nutrients</h3>
              <p className="text-gray-600 mb-4">
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
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Brands</h3>
              <p className="text-gray-600 mb-4">
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
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Categories</h3>
              <p className="text-gray-600 mb-4">
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
          <section id="api-keys" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Authentication</h2>
            <p className="text-gray-600 mb-6">
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
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rate Limits</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Free Plan</span>
                    <Badge variant="outline">3 req/min, 20/day</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Basic Plan</span>
                    <Badge variant="outline">10 req/min, 1,000/day</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Core Plan</span>
                    <Badge variant="outline">30 req/min, 5,000/day</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Error Handling</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code className="text-red-600">400</code>
                    <span className="text-gray-600">Bad Request</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">401</code>
                    <span className="text-gray-600">Unauthorized</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">429</code>
                    <span className="text-gray-600">Rate Limited</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">500</code>
                    <span className="text-gray-600">Server Error</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Footer */}
          <footer className="border-t border-gray-200 pt-8 mt-12">
            <div className="text-center text-gray-600">
              <p className="mb-2">Need help? Contact our support team or check our FAQ.</p>
              <div className="flex justify-center space-x-6">
                <Link href="/contact" className="text-blue-600 hover:text-blue-800">Support</Link>
                <Link href="/faq" className="text-blue-600 hover:text-blue-800">FAQ</Link>
                <Link href="/status" className="text-blue-600 hover:text-blue-800">Status</Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}