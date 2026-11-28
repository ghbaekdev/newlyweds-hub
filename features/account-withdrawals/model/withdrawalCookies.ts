import { withdrawalPath } from '../lib/withdrawalPaths';

export const withdrawalFlowCookie = 'hub-withdrawal-flow';
export const withdrawalReceiptCookie = 'hub-withdrawal-receipt';
export const withdrawalReceiptLifetime = 86400;

export function withdrawalCookieOptions(secure: boolean, maxAge: number) {
  return { path: withdrawalPath, maxAge, secure, sameSite: 'lax', httpOnly: true } as const;
}
