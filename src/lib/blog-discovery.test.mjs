import assert from 'node:assert/strict';
import test from 'node:test';

process.env.NEXT_PUBLIC_SITE_URL = 'https://calorieapi.com';

const { buildBlogRssXml, buildLlmsTxt } = await import('./blog-discovery.ts');

const SAMPLE_POSTS = [
  {
    slug: 'what-is-a-food-api',
    title: 'What Is a Food API?',
    excerpt: 'Guide for developers.',
    meta_description: 'Learn what a food API is.',
    keywords: 'food api, nutrition api',
    cover_image_url: null,
    published_at: '2026-06-01T12:00:00Z',
    updated_at: '2026-06-10T12:00:00Z',
  },
  {
    slug: 'free-food-apis-2025',
    title: 'Free Food APIs',
    excerpt: 'Compare free tiers.',
    meta_description: 'Free food API comparison.',
    keywords: 'free food api',
    cover_image_url: null,
    published_at: '2026-05-01T12:00:00Z',
    updated_at: '2026-05-15T12:00:00Z',
  },
];

test('buildLlmsTxt includes dynamic blog catalog and JSON API docs', () => {
  const body = buildLlmsTxt(SAMPLE_POSTS);
  assert.match(body, /what-is-a-food-api/);
  assert.match(body, /keywords: food api, nutrition api/);
  assert.match(body, /Blog JSON API/);
  assert.match(body, /\/blog\/feed\.xml/);
});

test('buildBlogRssXml emits RSS items with categories', () => {
  const xml = buildBlogRssXml(SAMPLE_POSTS);
  assert.match(xml, /<\?xml version="1.0"/);
  assert.match(xml, /What Is a Food API\?/);
  assert.match(xml, /<category>food api<\/category>/);
  assert.match(xml, /\/blog\/feed\.xml"/);
});
