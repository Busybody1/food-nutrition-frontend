import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCanonicalRedirectUrl,
  parseCanonicalSite,
} from './canonical-redirect.ts';

const SITE_URL = 'https://calorieapi.com';

test('parseCanonicalSite returns null for localhost', () => {
  assert.equal(parseCanonicalSite('http://localhost:3000'), null);
});

test('parseCanonicalSite strips www from env URL', () => {
  assert.deepEqual(parseCanonicalSite('https://www.calorieapi.com'), {
    host: 'calorieapi.com',
  });
});

test('getCanonicalRedirectUrl redirects www to apex', () => {
  assert.equal(
    getCanonicalRedirectUrl({
      pathname: '/pricing',
      search: '',
      protocol: 'https:',
      host: 'www.calorieapi.com',
      forwardedProto: 'https',
      siteUrl: SITE_URL,
    }),
    'https://calorieapi.com/pricing'
  );
});

test('getCanonicalRedirectUrl redirects http to https', () => {
  assert.equal(
    getCanonicalRedirectUrl({
      pathname: '/',
      search: '',
      protocol: 'http:',
      host: 'calorieapi.com',
      forwardedProto: 'http',
      siteUrl: SITE_URL,
    }),
    'https://calorieapi.com/'
  );
});

test('getCanonicalRedirectUrl redirects http www to https apex', () => {
  assert.equal(
    getCanonicalRedirectUrl({
      pathname: '/faq',
      search: '?ref=seo',
      protocol: 'http:',
      host: 'www.calorieapi.com',
      forwardedProto: 'http',
      siteUrl: SITE_URL,
    }),
    'https://calorieapi.com/faq?ref=seo'
  );
});

test('getCanonicalRedirectUrl allows canonical https apex', () => {
  assert.equal(
    getCanonicalRedirectUrl({
      pathname: '/',
      search: '',
      protocol: 'https:',
      host: 'calorieapi.com',
      forwardedProto: 'https',
      siteUrl: SITE_URL,
    }),
    null
  );
});

test('getCanonicalRedirectUrl skips redirect in local dev', () => {
  assert.equal(
    getCanonicalRedirectUrl({
      pathname: '/',
      search: '',
      protocol: 'http:',
      host: 'localhost:3000',
      forwardedProto: 'http',
      siteUrl: 'http://localhost:3000',
    }),
    null
  );
});
