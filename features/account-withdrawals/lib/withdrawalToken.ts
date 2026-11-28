import { jwtVerify, SignJWT } from 'jose';

export const withdrawalTokenLifetime = 300;
export const WithdrawalTokenKind = { CHALLENGE: 'challenge', PROOF: 'proof' } as const;
export const withdrawalSecretPattern = /^[A-Za-z0-9_-]{43}$/;

type AccountSession = { id: string; sessionId: string };

type WithdrawalToken =
  | { kind: typeof WithdrawalTokenKind.CHALLENGE; nonce: string; state: string; startedAt: number }
  | { kind: typeof WithdrawalTokenKind.PROOF; receipt: string };

export function signWithdrawalToken(
  token: WithdrawalToken,
  account: AccountSession,
  key: Uint8Array,
  now = Math.floor(Date.now() / 1000),
) {
  return new SignJWT({ ...token, sid: account.sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('account-withdrawal')
    .setSubject(account.id)
    .setIssuedAt(now)
    .setExpirationTime(now + withdrawalTokenLifetime)
    .sign(key);
}

export async function verifyWithdrawalToken(
  token: string | undefined,
  account: AccountSession,
  key: Uint8Array,
  now = Math.floor(Date.now() / 1000),
): Promise<WithdrawalToken | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
      audience: 'account-withdrawal',
      subject: account.id,
      maxTokenAge: withdrawalTokenLifetime,
      requiredClaims: ['exp'],
      currentDate: new Date(now * 1000),
    });
    if (payload.sid !== account.sessionId) return null;

    if (
      payload.kind === WithdrawalTokenKind.CHALLENGE &&
      typeof payload.nonce === 'string' &&
      typeof payload.state === 'string' &&
      typeof payload.startedAt === 'number'
    ) {
      return {
        kind: WithdrawalTokenKind.CHALLENGE,
        nonce: payload.nonce,
        state: payload.state,
        startedAt: payload.startedAt,
      };
    }

    if (
      payload.kind === WithdrawalTokenKind.PROOF &&
      typeof payload.receipt === 'string' &&
      withdrawalSecretPattern.test(payload.receipt)
    ) {
      return { kind: WithdrawalTokenKind.PROOF, receipt: payload.receipt };
    }
  } catch {
    return null;
  }
  return null;
}
