import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBlogItemListJsonLdFromInput,
  buildBlogPostingJsonLdFromInput,
} from './blog-jsonld-format.ts';

const SITE = {
  siteName: 'Calorie API',
  siteUrl: 'https://calorieapi.com',
  logoUrl: 'https://calorieapi.com/logos/busybody-logo.png',
  absoluteUrl: (path) => `https://calorieapi.com${path.startsWith('/') ? path : `/${path}`}`,
};

test('buildBlogPostingJsonLdFromInput uses BlogPosting with keywords', () => {
  const data = buildBlogPostingJsonLdFromInput(SITE, {
    title: 'What Is a Food API?',
    description: 'Developer guide.',
    path: '/blog/what-is-a-food-api',
    datePublished: '2026-06-01T12:00:00Z',
    keywords: ['food api', 'nutrition api'],
    wordCount: 1200,
  });

  assert.equal(data['@type'], 'BlogPosting');
  assert.equal(data.keywords, 'food api, nutrition api');
});

test('buildBlogItemListJsonLdFromInput lists blog posts', () => {
  const data = buildBlogItemListJsonLdFromInput(SITE, [
    { slug: 'what-is-a-food-api', title: 'What Is a Food API?' },
  ]);
  assert.equal(data.numberOfItems, 1);
});
