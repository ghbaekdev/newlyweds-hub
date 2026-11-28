import assert from 'node:assert/strict';
import { test } from 'node:test';

import { signWithdrawalToken, verifyWithdrawalToken } from './withdrawalToken.ts';

const key = new Uint8Array(32).fill(1);
const account = { id: 'current-user', sessionId: 'current-session' };
const proof = { kind: 'proof', receipt: 'a'.repeat(43) };

test('accepts a fresh proof for the current account and session only', async () => {
  const token = await signWithdrawalToken(proof, account, key, 1000);
  assert.deepEqual(await verifyWithdrawalToken(token, account, key, 1299), proof);
  assert.equal(
    await verifyWithdrawalToken(token, { ...account, sessionId: 'other' }, key, 1001),
    null,
  );
  assert.equal(await verifyWithdrawalToken(token, { ...account, id: 'other' }, key, 1001), null);
  assert.equal(await verifyWithdrawalToken(token, account, key, 1300), null);
  assert.equal(await verifyWithdrawalToken(token + 'x', account, key, 1001), null);
});

test('retains the challenge nonce and authentication start only with a valid signature', async () => {
  const challenge = {
    kind: 'challenge',
    nonce: 'a'.repeat(43),
    state: 'b'.repeat(43),
    startedAt: 1000,
  };
  const token = await signWithdrawalToken(challenge, account, key, 1000);
  assert.deepEqual(await verifyWithdrawalToken(token, account, key, 1001), challenge);
  assert.equal(await verifyWithdrawalToken(token, account, new Uint8Array(32).fill(2), 1001), null);
});
