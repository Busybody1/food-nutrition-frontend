import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseApiErrorDetail,
  getUserFacingApiMessage,
  isDuplicateEmailMessage,
} from './errors.ts';

test('parseApiErrorDetail returns string detail', () => {
  assert.equal(
    parseApiErrorDetail('User with this email already exists'),
    'User with this email already exists'
  );
});

test('parseApiErrorDetail joins validation array', () => {
  assert.equal(
    parseApiErrorDetail([{ msg: 'field required' }, { msg: 'invalid email' }]),
    'field required invalid email'
  );
});

test('getUserFacingApiMessage prefers server detail on 400', () => {
  assert.equal(
    getUserFacingApiMessage(400, { detail: 'User with this email already exists' }),
    'User with this email already exists'
  );
});

test('getUserFacingApiMessage uses fallback when detail missing', () => {
  assert.match(getUserFacingApiMessage(400, {}), /Invalid request/);
});

test('isDuplicateEmailMessage detects duplicate email', () => {
  assert.equal(isDuplicateEmailMessage('User with this email already exists'), true);
  assert.equal(isDuplicateEmailMessage('Invalid request'), false);
});
