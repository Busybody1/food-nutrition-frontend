import assert from 'node:assert/strict';
import test from 'node:test';

process.env.NEXT_PUBLIC_SITE_URL = 'https://calorieapi.com';

const { buildBlogPostingJsonLd, buildBlogItemListJsonLd } = await import('./seo-jsonld.ts');

test('buildBlogPostingJsonLd uses BlogPosting with keywords from DB', () => {
  const data = buildBlogPostingJsonLd({
    title: 'What Is a Food API?',
    description: 'Developer guide.',
    path: '/blog/what-is-a-food-api',
    datePublished: '2026-06-01T12:00:00Z',
    dateModified: '2026-06-10T12:00:00Z',
    image: 'https://calorieapi.com/images/hero-bowl.jpg',
    keywords: ['food api', 'nutrition api'],
    wordCount: 1200,
  });

  assert.equal(data['@type'], 'BlogPosting');
  assert.equal(data.keywords, 'food api, nutrition api');
  assert.equal(data.inLanguage, 'en-US');
  assert.equal(data.isAccessibleForFree, true);
  assert.equal(data.wordCount, 1200);
});

test('buildBlogItemListJsonLd lists blog posts', () => {
  const data = buildBlogItemListJsonLd([
    { slug: 'what-is-a-food-api', title: 'What Is a Food API?' },
    { slug: 'free-food-apis-2025', title: 'Free Food APIs' },
  ]);
  assert.equal(data['@type'], 'ItemList');
  assert.equal(data.numberOfItems, 2);
  assert.match(data.itemListElement[0].url, /what-is-a-food-api/);
});
