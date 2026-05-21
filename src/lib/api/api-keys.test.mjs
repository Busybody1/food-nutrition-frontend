import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeApiKeyList, isApiKeyPlaintext, formatMaskedApiKey } from './api-keys.ts';

test('normalizeApiKeyList accepts raw array', () => {
  const keys = normalizeApiKeyList([
    { id: 1, name: 'test', is_active: true, created_at: null, last_used_at: null },
  ]);
  assert.equal(keys.length, 1);
  assert.equal(keys[0].name, 'test');
});

test('normalizeApiKeyList accepts wrapped data array', () => {
  const keys = normalizeApiKeyList({
    data: [{ id: 2, name: 'prod', is_active: true }],
  });
  assert.equal(keys[0].id, 2);
});

test('normalizeApiKeyList drops invalid rows', () => {
  assert.equal(normalizeApiKeyList([{ id: 0, name: 'x' }]).length, 0);
  assert.equal(normalizeApiKeyList([{ name: 'no-id' }]).length, 0);
});

test('normalizeApiKeyList keeps fn_ plaintext from create response', () => {
  const keys = normalizeApiKeyList([
    {
      id: 3,
      name: 'k',
      key: 'fn_abcdefghijklmnopqrstuvwxyz123456',
      is_active: true,
    },
  ]);
  assert.ok(isApiKeyPlaintext(keys[0].key));
});

test('formatMaskedApiKey never returns copyable placeholder bullets', () => {
  const masked = formatMaskedApiKey(null);
  assert.ok(!masked.includes('••••'));
  assert.match(masked, /creation/i);
});
