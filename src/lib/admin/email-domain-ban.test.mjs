import assert from 'node:assert/strict'
import test from 'node:test'
import { emailDomainBanNeedsConfirm, emailDomainBanSavesOnSubmit } from './email-domain-ban.ts'

const safe = { locks_out_actor: false, requires_large_confirm: false }
const selfLock = { locks_out_actor: true, requires_large_confirm: false }
const large = { locks_out_actor: false, requires_large_confirm: true }

test('a normal domain is saved on the first submit', () => {
  assert.equal(emailDomainBanSavesOnSubmit(safe, false, false), true)
  assert.equal(emailDomainBanNeedsConfirm(safe, false, false), false)
})

test('self-lockout and large bans wait until the warning is confirmed', () => {
  assert.equal(emailDomainBanSavesOnSubmit(selfLock, false, false), false)
  assert.equal(emailDomainBanSavesOnSubmit(selfLock, true, false), true)
  assert.equal(emailDomainBanSavesOnSubmit(large, false, false), false)
  assert.equal(emailDomainBanSavesOnSubmit(large, false, true), true)
})
