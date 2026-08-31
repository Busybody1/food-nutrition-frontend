import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isPublicProductPath,
  loadPublicOpenApiDocument,
  resolveOpenApiSourceUrl,
  toPublicOpenApiDocument,
} from './public-openapi.ts';

const SITE = {
  siteName: 'Calorie API',
  siteDescription: 'Food calorie API for developers.',
  siteUrl: 'https://calorieapi.com',
  supportEmail: 'support@calorieapi.com',
  apiBaseUrl: 'https://calorieapiadmin.com',
  docsUrl: 'https://calorieapi.com/docs',
  termsUrl: 'https://calorieapi.com/terms',
  licenseUrl: 'https://calorieapi.com/commercial-license',
};

test('resolveOpenApiSourceUrl only allows the configured API origin', () => {
  assert.equal(
    resolveOpenApiSourceUrl('https://calorieapiadmin.com/api/v1'),
    'https://calorieapiadmin.com/openapi.json'
  );
  assert.equal(resolveOpenApiSourceUrl('http://localhost:8000'), 'http://localhost:8000/openapi.json');
  assert.equal(resolveOpenApiSourceUrl('http://evil.example'), null);
  assert.equal(resolveOpenApiSourceUrl('https://user:pass@calorieapiadmin.com'), null);
  assert.equal(resolveOpenApiSourceUrl('file:///etc/passwd'), null);
  assert.equal(resolveOpenApiSourceUrl('javascript:alert(1)'), null);
});

test('isPublicProductPath allowlists food API routes only', () => {
  assert.equal(isPublicProductPath('/api/v1/search/foods'), true);
  assert.equal(isPublicProductPath('/api/v1/foods/{food_id}'), true);
  assert.equal(isPublicProductPath('/api/v1/catalog/brands'), true);
  assert.equal(isPublicProductPath('/api/v1/calc/macros'), true);
  assert.equal(isPublicProductPath('/api/v1/auth/register'), true);
  assert.equal(isPublicProductPath('/health'), true);
  assert.equal(isPublicProductPath('/api/v1/admin/users'), false);
  assert.equal(isPublicProductPath('/api/v1/webhooks/stripe'), false);
  assert.equal(isPublicProductPath('/config'), false);
  assert.equal(isPublicProductPath('/api/v1/public/search/foods'), false);
  assert.equal(isPublicProductPath('/api/v1/support/messages'), false);
  assert.equal(isPublicProductPath('/api/v1/users/profile'), false);
});

test('toPublicOpenApiDocument drops admin paths and unused schemas', () => {
  const raw = {
    openapi: '3.1.0',
    info: { title: 'Internal', version: '2.0.0', description: 'do not publish' },
    paths: {
      '/api/v1/search/foods': {
        get: {
          tags: ['search'],
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/FoodList' },
                },
              },
            },
          },
        },
      },
      '/api/v1/admin/users': {
        get: {
          tags: ['admin'],
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AdminUser' },
                },
              },
            },
          },
        },
      },
      '/config': { get: { responses: { 200: { description: 'secrets' } } } },
    },
    components: {
      schemas: {
        FoodList: { type: 'object', properties: { items: { type: 'array' } } },
        AdminUser: {
          type: 'object',
          properties: { email: { type: 'string' }, role: { type: 'string' } },
        },
      },
    },
    tags: [{ name: 'search' }, { name: 'admin' }],
  };

  const published = toPublicOpenApiDocument(raw, SITE);
  const paths = published.paths;
  const components = published.components;
  const info = published.info;

  assert.ok(paths && typeof paths === 'object');
  assert.ok('/api/v1/search/foods' in paths);
  assert.equal('/api/v1/admin/users' in paths, false);
  assert.equal('/config' in paths, false);

  assert.deepEqual(published.servers, [
    { url: 'https://calorieapiadmin.com', description: 'Production' },
  ]);
  assert.equal(info.title, 'Calorie API');
  assert.equal(info.contact.url, 'https://calorieapi.com');
  assert.equal(info.termsOfService, 'https://calorieapi.com/terms');

  assert.ok(components.schemas.FoodList);
  assert.equal(components.schemas.AdminUser, undefined);
  assert.deepEqual(published.tags, [{ name: 'search' }]);
});

test('loadPublicOpenApiDocument fetches only the resolved origin path', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), redirect: init.redirect });
    return {
      ok: true,
      headers: { get: () => null },
      text: async () =>
        JSON.stringify({
          openapi: '3.1.0',
          info: { version: '2.0.0' },
          paths: {
            '/api/v1/search/foods': { get: { responses: { 200: { description: 'ok' } } } },
            '/api/v1/admin/users': { get: { responses: { 200: { description: 'no' } } } },
          },
        }),
    };
  };

  const document = await loadPublicOpenApiDocument(SITE, fetchImpl);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://calorieapiadmin.com/openapi.json');
  assert.equal(calls[0].redirect, 'error');
  assert.ok(document.paths['/api/v1/search/foods']);
  assert.equal(document.paths['/api/v1/admin/users'], undefined);
});
