import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isPaginatedEnvelope,
  unwrapSuccessPayload,
  normalizePaginatedResponse,
  normalizeListPayload,
} from './paginated.ts'

const envelope = {
  data: [{ id: 1, name: 'Chicken, raw' }],
  total: 8421,
  skip: 0,
  limit: 20,
}

test('isPaginatedEnvelope accepts FastAPI search envelopes', () => {
  assert.equal(isPaginatedEnvelope(envelope), true)
  assert.equal(isPaginatedEnvelope([{ id: 1 }]), false)
})

test('unwrapSuccessPayload keeps paginated envelopes intact', () => {
  assert.deepEqual(unwrapSuccessPayload(envelope), envelope)
})

test('unwrapSuccessPayload still unwraps non-paginated { data } bodies', () => {
  assert.deepEqual(unwrapSuccessPayload({ data: { id: 9 } }), { id: 9 })
})

test('unwrapSuccessPayload leaves raw arrays unchanged', () => {
  const hits = [{ id: 1 }]
  assert.equal(unwrapSuccessPayload(hits), hits)
})

test('normalizePaginatedResponse reads data + total from the API envelope', () => {
  const result = normalizePaginatedResponse(envelope)
  assert.equal(result.total, 8421)
  assert.equal(result.data[0].name, 'Chicken, raw')
})

test('normalizePaginatedResponse recovers a bare array after client unwrap', () => {
  const result = normalizePaginatedResponse(envelope.data)
  assert.equal(result.data.length, 1)
  assert.equal(result.total, 1)
})

test('normalizePaginatedResponse unwraps a nested envelope', () => {
  const result = normalizePaginatedResponse({ data: envelope, success: true })
  assert.equal(result.total, 8421)
})

test('normalizeListPayload accepts suggest arrays and wrapped lists', () => {
  assert.equal(normalizeListPayload([{ id: 2, name: 'Chicken' }]).length, 1)
  assert.equal(normalizeListPayload({ data: [{ id: 3 }] }).length, 1)
})
