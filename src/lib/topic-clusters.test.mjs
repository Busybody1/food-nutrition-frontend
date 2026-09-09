import assert from 'node:assert/strict';
import test from 'node:test';
import { getRelatedLinksForText } from './topic-clusters.ts';

test('barcode posts keep barcode docs instead of a four-link nutrition hub', () => {
  const hrefs = getRelatedLinksForText(
    'Barcode nutrition API UPC EAN scan grocery',
  ).map((link) => link.href);
  assert.ok(hrefs.includes('/docs/barcode-lookup'));
  assert.ok(hrefs.includes('/barcode-nutrition-api'));
  assert.equal(
    ['/nutrition-api', '/food-database-api', '/barcode-nutrition-api', '/meal-tracking-api'].every(
      (href) => hrefs.includes(href),
    ),
    false,
  );
});

test('food api in keywords does not fill every hub slot with capability pages', () => {
  const hrefs = getRelatedLinksForText(
    'usda fooddata central api, usda food api, usda nutrition api, search foods',
  ).map((link) => link.href);
  const hubQuartet = [
    '/nutrition-api',
    '/food-database-api',
    '/barcode-nutrition-api',
    '/meal-tracking-api',
  ];
  const tookAllFour = hubQuartet.every((href) => hrefs.includes(href));
  assert.equal(tookAllFour, false);
  assert.ok(hrefs.includes('/docs/food-search') || hrefs.includes('/compare/usda-fooddata-central-alternative'));
});

test('nutrition api still surfaces the hub via defaults or analysis', () => {
  const hrefs = getRelatedLinksForText('what is a nutrition api').map((link) => link.href);
  assert.ok(hrefs.includes('/nutrition-api'));
});
