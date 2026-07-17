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

/**
 * Blog-to-blog crosslinks. Kept separate from TOPIC_CLUSTERS (which points at
 * hub/product/docs pages) so every matching post surfaces a couple of sibling
 * articles in its Related grid — this is how existing posts gain inbound links
 * to newer ones without editing their stored body content.
 */
const BLOG_CROSSLINKS: TopicCluster[] = [
  {
    id: 'blog-competitors',
    triggers: [
      'nutritionix', 'spoonacular', 'edamam', 'calorieninjas', 'calorie ninja',
      'usda', 'fooddata', 'fatsecret', 'alternative', 'pricing', 'compare', ' vs ',
    ],
    links: [
      { label: 'Nutritionix API pricing explained', href: '/blog/nutritionix-api-pricing' },
      { label: 'Spoonacular API pricing explained', href: '/blog/spoonacular-api-pricing' },
      { label: 'CalorieNinjas API alternative', href: '/blog/calorieninjas-api-alternative' },
      { label: 'USDA FoodData Central API guide', href: '/blog/usda-fooddata-central-api-guide' },
    ],
  },
  {
    id: 'blog-tracking',
    triggers: ['track', 'logging', 'meal log', 'diary', 'calorie count', 'counter', 'fitness', 'workout'],
    links: [
      { label: 'Calorie tracking API guide', href: '/blog/calorie-tracking-api' },
      { label: 'Build a calorie tracker app with a food API', href: '/blog/build-calorie-tracker-app-food-api' },
    ],
  },
  {
    id: 'blog-recipe',
    triggers: [
      'recipe', 'ingredient', 'protein', 'estimat', 'calculator', 'calculate',
      'label', 'nutrition facts', 'food label', 'food.com',
    ],
    links: [
      { label: 'Recipe nutrition from ingredients (Food.com alternative)', href: '/blog/food-com-recipe-nutrition-api' },
      { label: 'Calorie estimation API', href: '/blog/calorie-estimation-api' },
      { label: 'Nutrition facts & food label API', href: '/blog/nutrition-facts-label-api' },
    ],
  },
  {
    id: 'blog-image',
    triggers: ['image', 'photo', 'scan', 'cal ai', 'caloriemama', 'calorie mama', 'detection', 'snap', 'recognition'],
    links: [
      { label: 'Food photo calorie APIs (Cal AI, CalorieMama)', href: '/blog/food-image-recognition-calorie-api' },
      { label: 'Grocery app barcode nutrition lookup', href: '/blog/grocery-list-app-barcode-nutrition-lookup-api' },
    ],
  },
]

const DEFAULT_LINKS: RelatedLink[] = [
  { label: 'API documentation', href: '/docs' },
  { label: 'Food database API overview', href: '/food-database-api' },
  { label: 'Integration guides', href: '/docs/guides' },
  { label: 'Compare nutrition APIs', href: '/compare' },
]

type RelatedLinkOptions = {
  /** Max hub/product/docs links (from TOPIC_CLUSTERS). */
  maxHub?: number
  /** Max sibling blog links (from BLOG_CROSSLINKS). */
  maxBlog?: number
  /** Href of the current page, excluded so a post never links to itself. */
  excludeHref?: string
}

/**
 * Match text (post keywords + title) to a blend of hub links and sibling blog
 * links; falls back to core pages. Hub links come first (conversion-focused),
 * followed by up to `maxBlog` related articles.
 */
export function getRelatedLinksForText(
  text: string,
  options: RelatedLinkOptions = {},
): RelatedLink[] {
  const { maxHub = 4, maxBlog = 2, excludeHref } = options
  const haystack = text.toLowerCase()
  const seen = new Set<string>()
  if (excludeHref) seen.add(excludeHref)

  const collect = (clusters: TopicCluster[], cap: number): RelatedLink[] => {
    const out: RelatedLink[] = []
    for (const cluster of clusters) {
      if (!cluster.triggers.some((t) => haystack.includes(t))) continue
      for (const link of cluster.links) {
        if (seen.has(link.href)) continue
        seen.add(link.href)
        out.push(link)
        if (out.length >= cap) return out
      }
    }
    return out
  }

  const matched = [...collect(TOPIC_CLUSTERS, maxHub), ...collect(BLOG_CROSSLINKS, maxBlog)]

  for (const link of DEFAULT_LINKS) {
    if (matched.length >= maxHub + maxBlog) break
    if (seen.has(link.href)) continue
    seen.add(link.href)
    matched.push(link)
  }
  return matched
}
