export const FAQ_ITEMS = [
  {
    q: 'What is Calorie API?',
    a: 'Calorie API is a REST API for nutrition and food data: search, autocomplete, barcode lookup, and macro nutrients per 100g. It is designed for health, fitness, and meal-tracking applications.',
  },
  {
    q: 'How do I authenticate requests?',
    a: 'Send your API key in the X-API-Key header, or use a JWT from the developer dashboard after signing in. Public demo search on the homepage is IP-rate-limited and does not require a key.',
  },
  {
    q: 'What are the pricing tiers?',
    a: 'A free tier includes monthly request quotas for development. Paid plans increase rate limits and monthly quotas. See the pricing page for current limits.',
  },
  {
    q: 'How does search ranking work?',
    a: 'Search supports multi-word queries, match_mode (any/all), verified-only filters, and relevance ranking aligned with verified foods and complete macro data.',
  },
  {
    q: 'Can I use this for commercial apps?',
    a: 'Commercial production use requires a Plus or Enterprise plan. Send the header X-API-Usage-Type: commercial when your app is a commercial product. Free, Basic, and Core are for non-commercial development and personal use.',
  },
] as const

export const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}
