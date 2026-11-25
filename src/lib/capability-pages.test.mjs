import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const capabilitySrc = readFileSync(join(dir, 'capability-pages-data.ts'), 'utf8');
const configSrc = readFileSync(join(dir, '../../next.config.mjs'), 'utf8');

test('nutrition-api hub exists and targets head terms', () => {
  assert.match(capabilitySrc, /slug: 'nutrition-api'/);
  assert.match(capabilitySrc, /'nutrition api'/);
  assert.match(capabilitySrc, /'food nutrition api'/);
  assert.match(capabilitySrc, /'calorie tracking api'/);
  assert.match(capabilitySrc, /'barcode food api'/);
  assert.match(configSrc, /'\/nutrition-api'/);
});

test('capability page copy has no em or en dashes', () => {
  assert.equal((capabilitySrc.match(/[—–]/g) || []).length, 0);
});

test('food database page is the query owner and the homepage heading is not', () => {
  const homeSrc = readFileSync(join(dir, '../app/page.tsx'), 'utf8');
  const rateSrc = readFileSync(join(dir, 'docs/content/rate-limits.ts'), 'utf8');
  const draft = readFileSync(
    join(dir, '../../docs/blog-drafts/food-database-api-for-developers.md'),
    'utf8'
  );
  assert.match(capabilitySrc, /slug: 'food-database-api'/);
  assert.match(capabilitySrc, /You do not download it/);
  assert.match(capabilitySrc, /Food database API for application developers/);
  assert.doesNotMatch(homeSrc, /Food database API for modern health products/);
  assert.match(homeSrc, /href="\/food-database-api">food database API/);
  assert.match(rateSrc, /30 requests\/min/);
  assert.match(rateSrc, /200 requests a minute/);
  assert.doesNotMatch(rateSrc, /5,000 requests/);
  assert.match(draft, /6\.8M\+/);
  assert.match(draft, /calorieapiadmin\.com/);
  assert.doesNotMatch(draft, /this one owns/i);
  assert.doesNotMatch(draft, /api\.calorieapi\.com/);
  assert.doesNotMatch(draft, /4M\+/);
});
