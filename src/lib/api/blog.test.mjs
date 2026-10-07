import assert from 'node:assert/strict'
import test from 'node:test'
import { getBlogPost, getBlogSlugs } from './blog.ts'

const postBody = {
  slug: 'portion-size-nutrition-scaler-api-food-id-grams',
  title: 'Portion Size',
  content: 'body',
  faq: [],
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function withFetch(handler, run) {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return handler(calls.length, url, init)
  }
  try {
    return { result: await run(), calls }
  } finally {
    globalThis.fetch = original
  }
}

test('getBlogPost retries a dropped connection, then returns the post', async () => {
  const { result, calls } = await withFetch((attempt) => {
    if (attempt < 3) {
      const err = new TypeError('fetch failed')
      err.cause = Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' })
      throw err
    }
    return jsonResponse(200, postBody)
  }, () => getBlogPost(postBody.slug))

  assert.equal(result.slug, postBody.slug)
  assert.equal(calls.length, 3)
  assert.equal(calls[0].init.signal, undefined)
  assert.ok(calls[1].init.signal)
  assert.match(calls[0].url, /\/api\/v1\/public\/blog\/portion-size-nutrition-scaler-api-food-id-grams$/)
})

test('getBlogPost still throws after the retries are exhausted', async () => {
  let calls = 0
  await assert.rejects(
    () =>
      withFetch(() => {
        calls += 1
        const err = new TypeError('fetch failed')
        err.cause = Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' })
        throw err
      }, () => getBlogPost('gone')),
    /getBlogPost\("gone"\) network error: fetch failed \(ECONNRESET\)/
  )
  assert.equal(calls, 3)
})

test('getBlogPost returns null on 404 without retrying', async () => {
  const { result, calls } = await withFetch(() => jsonResponse(404, { detail: 'missing' }), () =>
    getBlogPost('missing')
  )
  assert.equal(result, null)
  assert.equal(calls.length, 1)
})

test('getBlogPost retries a 500, then throws the upstream status', async () => {
  let calls = 0
  await assert.rejects(
    () =>
      withFetch(() => {
        calls += 1
        return jsonResponse(500, { detail: 'nope' })
      }, () => getBlogPost('broken')),
    /getBlogPost\("broken"\) upstream error: HTTP 500/
  )
  assert.equal(calls, 3)
})

test('getBlogSlugs survives one failed slug-list fetch', async () => {
  const { result, calls } = await withFetch((attempt) => {
    if (attempt === 1) throw new TypeError('fetch failed')
    return jsonResponse(200, [{ slug: 'log-meal-api', updated_at: null }])
  }, () => getBlogSlugs())

  assert.deepEqual(result, [{ slug: 'log-meal-api', updated_at: null }])
  assert.equal(calls.length, 2)
})
