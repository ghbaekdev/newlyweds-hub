export const SaveAccountProfileState = {
  IDLE: 'idle',
  SAVED: 'saved',
  INVALID: 'invalid',
  SIGN_IN_REQUIRED: 'sign-in-required',
  FAILED: 'failed',
} as const;

export type AccountProfileSaveState =
  (typeof SaveAccountProfileState)[keyof typeof SaveAccountProfileState];
