import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseDisplayName } from './parseDisplayName.ts';

test('trims the entered display name and treats an empty field as a clear request', () => {
  assert.deepEqual(parseDisplayName('  김 신혼  '), { ok: true, value: '김 신혼' });
  assert.deepEqual(parseDisplayName('   '), { ok: true, value: null });
  assert.deepEqual(parseDisplayName(''), { ok: true, value: null });
});

test('validates the maximum by Unicode character count', () => {
  const fortyCharacters = '💐'.repeat(40);
  assert.deepEqual(parseDisplayName(fortyCharacters), { ok: true, value: fortyCharacters });
  assert.deepEqual(parseDisplayName(`${fortyCharacters}가`), { ok: false });
});

test('rejects a missing, file, or multiline field without clearing the stored name', () => {
  assert.deepEqual(parseDisplayName(null), { ok: false });
  assert.deepEqual(parseDisplayName(new File([], 'name.txt')), { ok: false });
  assert.deepEqual(parseDisplayName('새로운\n이름'), { ok: false });
  assert.deepEqual(parseDisplayName('\n'), { ok: false });
});
