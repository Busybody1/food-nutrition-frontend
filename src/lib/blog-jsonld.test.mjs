import assert from 'node:assert/strict';
import test from 'node:test';
import {
  articleSectionForPost,
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
  assert.equal(data.headline, 'What Is a Food API?');
  assert.equal(data.datePublished, '2026-06-01T12:00:00Z');
  assert.equal(data.author['@id'], 'https://calorieapi.com/#organization');
  assert.equal(data.publisher.logo.url, SITE.logoUrl);
  assert.equal(data.articleSection, 'Developer guides');
  assert.equal(data.speakable['@type'], 'SpeakableSpecification');
  assert.deepEqual(
    data.about.map((item) => item.name),
    ['food api', 'nutrition api']
  );
});

test('nutrition MCP posts are a distinct article section', () => {
  assert.equal(
    articleSectionForPost('How to Track Calories with Claude AI', ['track calories with claude ai']),
    'Calorie MCP'
  );
  const data = buildBlogPostingJsonLdFromInput(SITE, {
    title: 'Nutrition MCP Server for Claude and Cursor',
    description: 'A nutrition MCP server looks foods up.',
    path: '/blog/nutrition-mcp-server',
    keywords: ['nutrition mcp server'],
  });
  assert.equal(data.articleSection, 'Calorie MCP');
  assert.equal(data.about[0].name, 'nutrition mcp server');
});

test('buildBlogItemListJsonLdFromInput lists blog posts', () => {
  const data = buildBlogItemListJsonLdFromInput(SITE, [
    { slug: 'what-is-a-food-api', title: 'What Is a Food API?' },
  ]);
  assert.equal(data.numberOfItems, 1);
});
