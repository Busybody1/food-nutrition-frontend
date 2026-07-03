import { API_CONFIG } from '@/lib/config/api'
import type { DocsBlock } from '@/lib/docs/types'
import type { FaqItem } from '@/lib/faq-data'

const API_BASE = API_CONFIG.baseURL.replace(/\/$/, '')

export type GuideRelatedLink = { label: string; href: string }

export type Guide = {
  slug: string
  title: string
  metaTitle: string
  description: string
  keywords: string[]
  framework: string
  /** One-line summary for index cards and llms.txt */
  summary: string
  /** ISO date, update when the guide content materially changes */
  dateModified: string
  blocks: DocsBlock[]
  faqs: readonly FaqItem[]
  related: GuideRelatedLink[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'react-native-food-tracking',
    title: 'Build a Food Tracking App with React Native',
    metaTitle: 'React Native Food Tracking API Integration',
    description:
      'Integrate the Calorie API in a React Native food tracking app: debounced autocomplete, food details, barcode scanning, and quota-friendly patterns.',
    keywords: [
      'react native food tracking',
      'react native nutrition API',
      'react native barcode scanner food',
      'calorie tracking app react native',
    ],
    framework: 'React Native',
    summary: 'Food logging in React Native: suggest, details, and barcode scanning.',
    dateModified: '2026-07-03',
    blocks: [
      {
        kind: 'p',
        text: 'This guide wires the three endpoints a food tracker needs (autocomplete suggest, food details, and barcode lookup) into a React Native app. Requests are routed through a small backend proxy so your API key never ships inside the app binary.',
      },
      { kind: 'h2', text: 'Set up a backend proxy', id: 'proxy' },
      {
        kind: 'p',
        text: 'Mobile binaries can be decompiled, so keep the X-API-Key header server-side. A minimal Express proxy forwards search traffic and adds the key:',
      },
      {
        kind: 'code',
        title: 'server.js (Express proxy)',
        code: `const express = require('express')
const app = express()

const API_BASE = '${API_BASE}/api/v1'

app.get('/api/food-search', async (req, res) => {
  const url = new URL(API_BASE + '/search/suggest')
  url.searchParams.set('q', req.query.q ?? '')
  url.searchParams.set('limit', '10')

  const upstream = await fetch(url, {
    headers: { 'X-API-Key': process.env.CALORIE_API_KEY },
  })
  res.status(upstream.status).json(await upstream.json())
})

app.listen(3001)`,
      },
      { kind: 'h2', text: 'Debounced autocomplete', id: 'autocomplete' },
      {
        kind: 'p',
        text: 'Debounce keystrokes so a fast typist costs one request instead of ten. It keeps the UI responsive and conserves your monthly quota.',
      },
      {
        kind: 'code',
        title: 'useFoodSuggest.ts',
        code: `import { useEffect, useState } from 'react'

export function useFoodSuggest(query: string) {
  const [results, setResults] = useState([])

  useEffect(() => {
    if (query.length < 2) return
    const t = setTimeout(async () => {
      const res = await fetch(
        \`https://your-backend.example.com/api/food-search?q=\${encodeURIComponent(query)}\`
      )
      if (res.ok) setResults(await res.json())
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  return results
}`,
      },
      { kind: 'h2', text: 'Fetch full nutrition on selection', id: 'details' },
      {
        kind: 'p',
        text: 'Suggest responses are intentionally lightweight (id, name, brand_name). When the user picks a suggestion, fetch GET /api/v1/foods/{id} through your proxy for per-100g macros, the nutrients array, and serving metadata, then compute logged amounts from the per-100g values.',
      },
      { kind: 'h2', text: 'Barcode scanning', id: 'barcode' },
      {
        kind: 'p',
        text: 'Pair a scanner library (for example expo-barcode-scanner) with the barcode endpoint. The API resolves UPC/EAN codes against the local catalog and falls back to Open Food Facts automatically, so one code path covers both.',
      },
      {
        kind: 'code',
        title: 'Scan handler',
        code: `const onBarCodeScanned = async ({ data: upc }) => {
  const res = await fetch(
    \`https://your-backend.example.com/api/barcode/\${upc}\`
  )
  if (res.status === 404) {
    // Unknown product, fall back to manual search
    navigation.navigate('FoodSearch')
    return
  }
  const food = await res.json()
  navigation.navigate('LogFood', { food })
}`,
      },
      { kind: 'h2', text: 'Production tips', id: 'tips' },
      {
        kind: 'list',
        items: [
          'Cache food details by ID on-device, IDs are stable, and re-logging favorites then costs zero API calls.',
          'Handle 429 with backoff using the X-RateLimit-Reset header; surface 402 (quota) as an app-level alert to yourself, not to end users.',
          'Send X-API-Usage-Type: commercial from your proxy once the app monetizes (requires the Plus plan or higher).',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I call the Calorie API directly from React Native?',
        a: 'Technically yes, but you would ship your API key inside the binary. Route requests through a backend proxy so the key stays secret and you can add per-user throttling.',
      },
      {
        q: 'Which barcode scanner library works best?',
        a: 'Any library that returns raw UPC/EAN digits works, expo-barcode-scanner and react-native-vision-camera are common choices. The API accepts the digits as-is; dashes are stripped automatically.',
      },
    ],
    related: [
      { label: 'Barcode Lookup API reference', href: '/docs/barcode-lookup' },
      { label: 'Food Search API reference', href: '/docs/food-search' },
      { label: 'Meal tracking API overview', href: '/meal-tracking-api' },
      { label: 'Solutions for fitness apps', href: '/solutions/fitness-apps' },
    ],
  },
  {
    slug: 'nextjs-nutrition-app',
    title: 'Build a Nutrition App with Next.js',
    metaTitle: 'Next.js Nutrition API Integration',
    description:
      'Use the Calorie API in a Next.js App Router project: server-side route handlers that keep your key secret, cached food search, and server components.',
    keywords: [
      'next.js nutrition API',
      'next.js food search',
      'nutrition app next.js tutorial',
      'food API route handler',
    ],
    framework: 'Next.js',
    summary: 'App Router route handlers, caching, and server components for food data.',
    dateModified: '2026-07-03',
    blocks: [
      {
        kind: 'p',
        text: 'Next.js route handlers are a natural fit for the Calorie API: the API key lives in server-only environment variables, and fetch caching gives you request deduplication and revalidation for free.',
      },
      { kind: 'h2', text: 'Server-side search route', id: 'route-handler' },
      {
        kind: 'code',
        title: 'app/api/food-search/route.ts',
        code: `import { NextRequest, NextResponse } from 'next/server'

const API_BASE = '${API_BASE}/api/v1'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''

  const upstream = await fetch(
    \`\${API_BASE}/search/foods?q=\${encodeURIComponent(q)}&limit=20\`,
    {
      headers: { 'X-API-Key': process.env.CALORIE_API_KEY! },
      // Identical searches within 5 minutes hit the cache, not your quota
      next: { revalidate: 300 },
    }
  )

  return NextResponse.json(await upstream.json(), { status: upstream.status })
}`,
      },
      { kind: 'h2', text: 'Server components for food pages', id: 'rsc' },
      {
        kind: 'p',
        text: 'For food detail pages, fetch directly inside a server component, no client JavaScript needed and the page is fully rendered for crawlers.',
      },
      {
        kind: 'code',
        title: 'app/foods/[id]/page.tsx',
        code: `export default async function FoodPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await fetch(\`${API_BASE}/api/v1/foods/\${id}\`, {
    headers: { 'X-API-Key': process.env.CALORIE_API_KEY! },
    next: { revalidate: 3600 },
  })
  if (!res.ok) notFound()
  const food = await res.json()

  return (
    <article>
      <h1>{food.name}</h1>
      <p>{food.calories} kcal per 100g</p>
    </article>
  )
}`,
      },
      { kind: 'h2', text: 'Caching strategy', id: 'caching' },
      {
        kind: 'list',
        items: [
          'Suggest calls: keep them client → route handler with short (or no) caching; they are user-specific and cheap.',
          'Food details: revalidate: 3600 or longer, nutrition data for a given ID changes rarely.',
          'Popular searches: revalidate: 300 turns repeated queries into cache hits instead of quota spend.',
        ],
      },
      { kind: 'h2', text: 'Environment setup', id: 'env' },
      {
        kind: 'code',
        title: '.env.local',
        code: `# Server-only, never expose with NEXT_PUBLIC_
CALORIE_API_KEY=your_api_key_here`,
      },
    ],
    faqs: [
      {
        q: 'Should the API key be a NEXT_PUBLIC_ variable?',
        a: 'No, NEXT_PUBLIC_ variables are embedded in client bundles. Use a plain server-side env var and only reference it in route handlers or server components.',
      },
      {
        q: 'Does fetch caching count against my API quota?',
        a: 'Cache hits are served by Next.js without contacting the API, so they cost nothing. Only cache misses and revalidations spend quota.',
      },
    ],
    related: [
      { label: 'Food Search API reference', href: '/docs/food-search' },
      { label: 'Authentication reference', href: '/docs/authentication' },
      { label: 'Food database API overview', href: '/food-database-api' },
      { label: 'Rate limits & quotas', href: '/docs/rate-limits' },
    ],
  },
  {
    slug: 'flutter-barcode-scanning',
    title: 'Barcode Nutrition Scanning in Flutter',
    metaTitle: 'Flutter Barcode Nutrition API Integration',
    description:
      'Add barcode nutrition scanning to a Flutter app with the Calorie API: mobile_scanner setup, a typed lookup client, and handling unknown products.',
    keywords: [
      'flutter barcode scanner nutrition',
      'flutter food API',
      'flutter nutrition app',
      'barcode lookup flutter',
    ],
    framework: 'Flutter',
    summary: 'Scan UPC/EAN codes in Flutter and resolve them to nutrition data.',
    dateModified: '2026-07-03',
    blocks: [
      {
        kind: 'p',
        text: 'With the mobile_scanner package and the barcode lookup endpoint, a Flutter app can go from camera frame to logged meal in one request. As with any mobile client, route API calls through your backend so the key stays server-side.',
      },
      { kind: 'h2', text: 'Scanner widget', id: 'scanner' },
      {
        kind: 'code',
        title: 'scan_screen.dart',
        code: `MobileScanner(
  onDetect: (capture) async {
    final barcode = capture.barcodes.firstOrNull?.rawValue;
    if (barcode == null) return;
    final food = await FoodApi.lookupBarcode(barcode);
    if (food == null) {
      // 404, offer manual search instead
      Navigator.pushNamed(context, '/search');
    } else {
      Navigator.pushNamed(context, '/log', arguments: food);
    }
  },
)`,
      },
      { kind: 'h2', text: 'Typed lookup client', id: 'client' },
      {
        kind: 'code',
        title: 'food_api.dart',
        code: `class FoodApi {
  static const _base = 'https://your-backend.example.com/api';

  static Future<BarcodeFood?> lookupBarcode(String upc) async {
    final res = await http.get(Uri.parse('\$_base/barcode/\$upc'));
    if (res.statusCode == 404) return null;
    if (res.statusCode != 200) {
      throw ApiException(res.statusCode, res.body);
    }
    return BarcodeFood.fromJson(jsonDecode(res.body));
  }
}

class BarcodeFood {
  final String name;
  final String? brand;
  final double? energyKcalPer100g;

  BarcodeFood({required this.name, this.brand, this.energyKcalPer100g});

  factory BarcodeFood.fromJson(Map<String, dynamic> json) => BarcodeFood(
        name: json['product']['name'],
        brand: json['product']['brand'],
        energyKcalPer100g:
            (json['nutrition_per_100g']?['energy_kcal'] as num?)?.toDouble(),
      );
}`,
      },
      { kind: 'h2', text: 'Handling nulls and misses', id: 'nulls' },
      {
        kind: 'list',
        items: [
          'Label data varies by product, nutrition fields the source lacks are null, not omitted. Model them as nullable.',
          'A 404 means neither the local catalog nor Open Food Facts knows the code, fall back to text search.',
          'nutrition_per_serving is only present when the source provides serving data; per-100g values are always your safe base.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does the API care which scanner package I use?',
        a: 'No, it only needs the raw UPC/EAN digits. mobile_scanner is a well-maintained option, but any camera/barcode library that yields the code string works.',
      },
      {
        q: 'Do I need separate handling for local-catalog vs Open Food Facts products?',
        a: 'No. The response shape is normalized regardless of source, so one model class covers both.',
      },
    ],
    related: [
      { label: 'Barcode Lookup API reference', href: '/docs/barcode-lookup' },
      { label: 'Barcode nutrition API overview', href: '/barcode-nutrition-api' },
      { label: 'Solutions for grocery & retail', href: '/solutions/grocery-retail' },
      { label: 'Error handling reference', href: '/docs/errors' },
    ],
  },
  {
    slug: 'nodejs-food-search',
    title: 'Food Search with Node.js',
    metaTitle: 'Node.js Food Search API Integration',
    description:
      'Build a food search backend in Node.js with the Calorie API: a typed client, pagination, caching, and rate-limit-aware retries.',
    keywords: [
      'node.js food API',
      'node nutrition API client',
      'food search backend',
      'API rate limit retry node',
    ],
    framework: 'Node.js',
    summary: 'A quota-friendly Node.js client with caching and 429-aware retries.',
    dateModified: '2026-07-03',
    blocks: [
      {
        kind: 'p',
        text: 'A thin Node.js client around the search endpoints gives every service in your stack one quota-friendly path to food data. This guide covers the client, pagination, an in-memory cache, and retry behavior that respects the rate-limit headers.',
      },
      { kind: 'h2', text: 'A minimal typed client', id: 'client' },
      {
        kind: 'code',
        title: 'calorieApi.js',
        code: `const API_BASE = '${API_BASE}/api/v1'

async function apiGet(path, params = {}) {
  const url = new URL(API_BASE + path)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v))
  }

  const res = await fetch(url, {
    headers: { 'X-API-Key': process.env.CALORIE_API_KEY },
  })

  if (res.status === 429) {
    const reset = res.headers.get('X-RateLimit-Reset')
    throw new RateLimitError(reset)
  }
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return res.json()
}

exports.searchFoods = (q, { limit = 30, skip = 0, verifiedOnly = false } = {}) =>
  apiGet('/search/foods', { q, limit, skip, verified_only: verifiedOnly })

exports.getFood = (id) => apiGet(\`/foods/\${id}\`)

exports.lookupBarcode = (upc) => apiGet(\`/search/barcode/\${upc}\`)`,
      },
      { kind: 'h2', text: 'Pagination', id: 'pagination' },
      {
        kind: 'p',
        text: 'Search returns a paginated envelope (data, total, skip, limit). Page with skip/limit and stop when skip + data.length reaches total, limit maxes out at 100 per request.',
      },
      { kind: 'h2', text: 'Cache before you retry', id: 'caching' },
      {
        kind: 'code',
        title: 'Cached food details',
        code: `const details = new Map()

async function getFoodCached(id) {
  if (details.has(id)) return details.get(id)
  const food = await getFood(id)
  details.set(id, food) // IDs are stable, cache aggressively
  return food
}`,
      },
      { kind: 'h2', text: 'Respecting rate limits', id: 'rate-limits' },
      {
        kind: 'list',
        items: [
          'On 429, wait until X-RateLimit-Reset before retrying; add jitter when many workers share the account.',
          'Treat 402 (monthly quota) as terminal: alert and stop retrying.',
          'Batch jobs should stay well under the 5% monthly food coverage cap; iterate over your users’ actual foods, not the whole catalog.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Should each microservice get its own API key?',
        a: 'Keys share the account’s limits either way, but separate keys per service make dashboards and revocation cleaner. Rate limits apply per account, not per key.',
      },
      {
        q: 'How do I avoid hitting the coverage cap in batch jobs?',
        a: 'Only fetch foods your users actually reference and cache by ID. The 5% monthly cap on distinct foods exists to block catalog scraping, not normal batch processing.',
      },
    ],
    related: [
      { label: 'Food Search API reference', href: '/docs/food-search' },
      { label: 'Rate limits & quotas', href: '/docs/rate-limits' },
      { label: 'Food database API overview', href: '/food-database-api' },
      { label: 'Error handling reference', href: '/docs/errors' },
    ],
  },
  {
    slug: 'python-nutrition-data',
    title: 'Working with Nutrition Data in Python',
    metaTitle: 'Python Nutrition Data API Integration',
    description:
      'Fetch and analyze Calorie API nutrition data in Python: a requests session with retries, pagination helpers, and macro analysis with pandas.',
    keywords: [
      'python nutrition API',
      'food data python',
      'nutrition data analysis pandas',
      'python requests food API',
    ],
    framework: 'Python',
    summary: 'Requests-based client with retries, plus pandas macro analysis.',
    dateModified: '2026-07-03',
    blocks: [
      {
        kind: 'p',
        text: 'Python is a common consumer of nutrition data for meal-plan generation, analytics, and ML features. This guide sets up a resilient client with requests, then loads results into pandas for macro analysis.',
      },
      { kind: 'h2', text: 'A session with retries', id: 'session' },
      {
        kind: 'code',
        title: 'client.py',
        code: `import os
import requests
from requests.adapters import HTTPAdapter, Retry

API_BASE = "${API_BASE}/api/v1"

session = requests.Session()
session.headers["X-API-Key"] = os.environ["CALORIE_API_KEY"]
# Retry transient failures; 429 respects Retry-After / reset headers
session.mount(
    "https://",
    HTTPAdapter(max_retries=Retry(total=3, backoff_factor=1, status_forcelist=[429, 500])),
)

def search_foods(q: str, limit: int = 30, skip: int = 0, verified_only: bool = False):
    res = session.get(
        f"{API_BASE}/search/foods",
        params={"q": q, "limit": limit, "skip": skip, "verified_only": verified_only},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()`,
      },
      { kind: 'h2', text: 'Paginating a full result set', id: 'pagination' },
      {
        kind: 'code',
        title: 'Iterate pages',
        code: `def iter_foods(q: str, page_size: int = 100):
    skip = 0
    while True:
        page = search_foods(q, limit=page_size, skip=skip)
        yield from page["data"]
        skip += page_size
        if skip >= page["total"]:
            break`,
      },
      { kind: 'h2', text: 'Macro analysis with pandas', id: 'pandas' },
      {
        kind: 'code',
        title: 'Analyze verified results',
        code: `import pandas as pd

rows = list(iter_foods("yogurt"))
df = pd.DataFrame(rows)[["name", "brand", "calories", "protein", "carbs", "fat"]]

# Protein density per 100 kcal, useful for ranking meal-plan candidates
df["protein_per_100kcal"] = df["protein"] / df["calories"] * 100
print(df.sort_values("protein_per_100kcal", ascending=False).head(10))`,
      },
      { kind: 'h2', text: 'Quota-aware batch work', id: 'batch' },
      {
        kind: 'list',
        items: [
          'Use verified_only=true for analysis jobs, curated macro data avoids cleaning noisy label entries.',
          'Persist food details by ID between runs; IDs are stable and re-fetching is pure quota spend.',
          'Keep batch jobs under the 5% monthly distinct-food coverage cap: analyze the foods your product uses, not the entire catalog.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is there an official Python SDK?',
        a: 'The API is plain REST + JSON, so requests (or httpx) with a session as shown covers everything. The paginated envelope and stable IDs make client code short.',
      },
      {
        q: 'Can I export the whole database for offline analysis?',
        a: 'No, bulk export is blocked by the 5% monthly coverage cap. Work against the foods your application actually references, and cache those locally.',
      },
    ],
    related: [
      { label: 'Food Search API reference', href: '/docs/food-search' },
      { label: 'Nutrition analysis API overview', href: '/nutrition-analysis-api' },
      { label: 'Rate limits & quotas', href: '/docs/rate-limits' },
      { label: 'Solutions for healthcare', href: '/solutions/healthcare' },
    ],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export function guidePath(slug: string): string {
  return `/docs/guides/${slug}`
}
