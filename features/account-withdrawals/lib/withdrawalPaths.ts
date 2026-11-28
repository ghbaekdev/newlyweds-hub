export const withdrawalPath = '/my-page/withdrawal';
export const withdrawalStatusPath = `${withdrawalPath}/status`;

export const WithdrawalIssue = {
  CANCELLED: 'cancelled',
  VERIFICATION_FAILED: 'verification-failed',
  ACCOUNT_MISMATCH: 'account-mismatch',
  EXPIRED: 'expired',
  REQUEST_FAILED: 'request-failed',
} as const;

type WithdrawalIssue = (typeof WithdrawalIssue)[keyof typeof WithdrawalIssue];

export function withdrawalIssuePath(issue: WithdrawalIssue) {
  return `${withdrawalPath}?error=${issue}`;
}
