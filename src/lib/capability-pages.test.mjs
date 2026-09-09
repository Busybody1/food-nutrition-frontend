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
