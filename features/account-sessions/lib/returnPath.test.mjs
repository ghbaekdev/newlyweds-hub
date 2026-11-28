import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getReturnPath } from './returnPath.ts';

test('preserves public and account destinations, including catalog filters', () => {
  for (const path of [
    '/',
    '/my-page',
    '/benefits/raw?q=a%2Fb',
    '/housing?type=rent',
    '/housing/rent-123',
  ]) {
    assert.equal(getReturnPath(path), path);
  }
});

test('encodes Unicode before writing a redirect header', () => {
  assert.equal(getReturnPath('/benefits?region=서울'), '/benefits?region=%EC%84%9C%EC%9A%B8');
});

test('falls back for external, ambiguous, and unlisted destinations', () => {
  for (const path of [
    null,
    'https://example.org',
    '//example.org',
    '/\\example.org',
    '/housing/%2Fexample.org',
    '/housing/../benefits',
    '/housing/item\n',
    '/auth/sign-out',
    '/login',
    '/housing?search=' + 'a'.repeat(2048),
  ]) {
    assert.equal(getReturnPath(path), '/my-page');
  }
});
