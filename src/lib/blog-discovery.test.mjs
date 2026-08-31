import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBlogRssXmlFromInput,
  buildLlmsTxtFromInput,
} from './blog-discovery-format.ts';

const SITE = {
  siteName: 'Calorie API',
  siteDescription: 'Nutrition & food REST API.',
  siteUrl: 'https://calorieapi.com',
  supportEmail: 'support@calorieapi.com',
  apiBaseUrl: 'https://api.example.com',
  blogUrl: 'https://calorieapi.com/blog',
  feedUrl: 'https://calorieapi.com/blog/feed.xml',
  blogPostUrl: (slug) => `https://calorieapi.com/blog/${slug}`,
};

const SAMPLE_POSTS = [
  {
    slug: 'what-is-a-food-api',
    title: 'What Is a Food API?',
    excerpt: 'Guide for developers.',
    meta_description: 'Learn what a food API is.',
    keywords: 'food api, nutrition api',
    published_at: '2026-06-01T12:00:00Z',
    updated_at: '2026-06-10T12:00:00Z',
  },
];

test('buildLlmsTxtFromInput includes dynamic blog catalog', () => {
  const body = buildLlmsTxtFromInput(SAMPLE_POSTS, SITE);
  assert.match(body, /what-is-a-food-api/);
  assert.match(body, /keywords: food api, nutrition api/);
  assert.match(body, /https:\/\/calorieapi.com\/openapi.json/);
});

test('buildLlmsTxtFromInput includes foods-per-query in pricing table', () => {
  const body = buildLlmsTxtFromInput(SAMPLE_POSTS, SITE);
  assert.match(body, /Foods per query/);
  assert.match(body, /\| Free \| \$0 \| 1,000 \| 10\/min \| 20 \|/);
});

test('buildBlogRssXmlFromInput emits RSS categories', () => {
  const xml = buildBlogRssXmlFromInput(SAMPLE_POSTS, SITE);
  assert.match(xml, /<category>food api<\/category>/);
});
