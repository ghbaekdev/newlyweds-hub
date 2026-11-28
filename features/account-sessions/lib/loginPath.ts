import { accountPath } from './returnPath';

export const AuthIssue = {
  CANCELLED: 'cancelled',
  LOGIN_FAILED: 'login-failed',
  SIGN_OUT_FAILED: 'sign-out-failed',
} as const;

export function loginPath(next = accountPath, issue?: (typeof AuthIssue)[keyof typeof AuthIssue]) {
  const params = new URLSearchParams();
  if (next !== accountPath) params.set('next', next);
  if (issue) params.set('error', issue);
  return params.size ? `/login?${params}` : '/login';
}
