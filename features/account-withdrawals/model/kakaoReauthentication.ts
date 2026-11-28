import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'node:crypto';
import 'server-only';

import { getAuthSiteUrl } from '@/features/account-sessions/model/authSiteUrl';

import { withdrawalPath } from '../lib/withdrawalPaths';

const issuer = 'https://kauth.kakao.com';
const jwks = createRemoteJWKSet(new URL('/.well-known/jwks.json', issuer));

export function getKakaoReauthenticationConfig() {
  const site = getAuthSiteUrl();
  const clientId = process.env.KAKAO_REAUTH_CLIENT_ID;
  const clientSecret = process.env.KAKAO_REAUTH_CLIENT_SECRET;
  if (!site || !clientId || !clientSecret) return null;

  return {
    site,
    clientId,
    clientSecret,
    callback: new URL(`${withdrawalPath}/verify/callback`, site).href,
    signingKey: createHash('sha256')
      .update('newlyweds-hub:withdrawal:')
      .update(clientSecret)
      .digest(),
  };
}

type KakaoConfig = NonNullable<ReturnType<typeof getKakaoReauthenticationConfig>>;

export function createKakaoReauthentication(config: KakaoConfig) {
  const state = randomBytes(32).toString('base64url');
  const nonce = randomBytes(32).toString('base64url');
  const url = new URL('/oauth/authorize', issuer);
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callback,
    response_type: 'code',
    prompt: 'login',
    state,
    nonce,
    scope: 'openid',
  }).toString();
  return { url, state, nonce, startedAt: Math.floor(Date.now() / 1000) };
}

export async function verifyKakaoReauthentication(
  config: KakaoConfig,
  code: string,
  challenge: { nonce: string; startedAt: number },
) {
  const response = await fetch(new URL('/oauth/token', issuer), {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callback,
      code,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return null;

  const { id_token: idToken } = (await response.json()) as { id_token?: unknown };
  if (typeof idToken !== 'string') return null;

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer,
    audience: config.clientId,
    algorithms: ['RS256'],
    requiredClaims: ['sub', 'iat', 'exp', 'auth_time', 'nonce'],
  });
  const now = Math.floor(Date.now() / 1000);
  if (
    payload.nonce !== challenge.nonce ||
    typeof payload.auth_time !== 'number' ||
    payload.auth_time < challenge.startedAt - 10 ||
    payload.auth_time > now + 10
  ) {
    return null;
  }

  return payload.sub ?? null;
}
