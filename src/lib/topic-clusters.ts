import type { RelatedLink } from '@/components/seo/related-resources'

type TopicCluster = {
  id: string
  /** Substrings matched (case-insensitive) against page keywords/titles */
  triggers: string[]
  links: RelatedLink[]
}

/**
 * Central topic-cluster map: which hub/spoke pages belong together.
 * Consumed by blog posts (keyword matching) so cluster links are data, not ad-hoc JSX.
 */
export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: 'barcode',
    triggers: ['barcode', 'upc', 'ean', 'scan', 'grocery', 'retail', 'label'],
    links: [
      { label: 'Barcode nutrition API overview', href: '/barcode-nutrition-api' },
      { label: 'Barcode Lookup API reference', href: '/docs/barcode-lookup' },
      { label: 'Flutter barcode scanning guide', href: '/docs/guides/flutter-barcode-scanning' },
      { label: 'Solutions for grocery & retail', href: '/solutions/grocery-retail' },
    ],
  },
  {
    id: 'tracking',
    triggers: ['track', 'logging', 'meal log', 'diary', 'calorie count', 'fitness', 'workout'],
    links: [
      { label: 'Meal tracking API overview', href: '/meal-tracking-api' },
      { label: 'React Native food tracking guide', href: '/docs/guides/react-native-food-tracking' },
      { label: 'Solutions for fitness apps', href: '/solutions/fitness-apps' },
      { label: 'Food Details API reference', href: '/docs/food-details' },
    ],
  },
  {
    id: 'search',
    triggers: ['search', 'database', 'autocomplete', 'suggest', 'food data', 'json'],
    links: [
      { label: 'Food database API overview', href: '/food-database-api' },
      { label: 'Food Search API reference', href: '/docs/food-search' },
      { label: 'Node.js food search guide', href: '/docs/guides/nodejs-food-search' },
      { label: 'Next.js nutrition app guide', href: '/docs/guides/nextjs-nutrition-app' },
    ],
  },
  {
    id: 'analysis',
    triggers: ['macro', 'nutrient', 'analysis', 'protein', 'meal plan', 'diet', 'nutrition data'],
    links: [
      { label: 'Nutrition analysis API overview', href: '/nutrition-analysis-api' },
      { label: 'Python nutrition data guide', href: '/docs/guides/python-nutrition-data' },
      { label: 'Solutions for meal planning apps', href: '/solutions/meal-planning-apps' },
      { label: 'Nutrients, Brands & Categories reference', href: '/docs/reference-data' },
    ],
  },
  {
    id: 'comparison',
    triggers: ['nutritionix', 'edamam', 'usda', 'fooddata', 'spoonacular', 'fatsecret', 'open food facts', 'openfoodfacts', 'alternative', 'compare', 'vs', 'best nutrition api', 'best food api'],
    links: [
      { label: 'Compare nutrition APIs', href: '/compare' },
      { label: 'Nutritionix alternative', href: '/compare/nutritionix-alternative' },
      { label: 'Edamam alternative', href: '/compare/edamam-alternative' },
      { label: 'USDA FoodData Central alternative', href: '/compare/usda-fooddata-central-alternative' },
      { label: 'Spoonacular alternative', href: '/compare/spoonacular-alternative' },
      { label: 'FatSecret alternative', href: '/compare/fatsecret-alternative' },
      { label: 'Open Food Facts alternative', href: '/compare/open-food-facts-alternative' },
    ],
  },
]

const DEFAULT_LINKS: RelatedLink[] = [
  { label: 'API documentation', href: '/docs' },
  { label: 'Food database API overview', href: '/food-database-api' },
  { label: 'Integration guides', href: '/docs/guides' },
  { label: 'Compare nutrition APIs', href: '/compare' },
]

/** Match text (post keywords + title) to cluster links; falls back to core pages. */
export function getRelatedLinksForText(text: string, max = 4): RelatedLink[] {
  const haystack = text.toLowerCase()
  const matched: RelatedLink[] = []
  const seen = new Set<string>()

  for (const cluster of TOPIC_CLUSTERS) {
    if (!cluster.triggers.some((t) => haystack.includes(t))) continue
    for (const link of cluster.links) {
      if (seen.has(link.href)) continue
      seen.add(link.href)
      matched.push(link)
      if (matched.length >= max) return matched
    }
  }

  for (const link of DEFAULT_LINKS) {
    if (matched.length >= max) break
    if (seen.has(link.href)) continue
    seen.add(link.href)
    matched.push(link)
  }
  return matched
}
