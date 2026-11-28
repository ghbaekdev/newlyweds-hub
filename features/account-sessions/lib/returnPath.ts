export const accountPath = '/my-page';

const allowedPage = /^\/(?:benefits(?:\/raw)?|housing(?:\/[a-z0-9-]+)?|my-page)?$/;
const invalidCharacter = /[\\\p{Cc}]/u;
const internalOrigin = 'https://internal.invalid';

export function getReturnPath(value: unknown) {
  if (typeof value !== 'string' || value.length > 2048 || invalidCharacter.test(value)) {
    return accountPath;
  }

  const [path] = value.split(/[?#]/, 1);
  if (!allowedPage.test(path)) return accountPath;

  return new URL(value, internalOrigin).href.slice(internalOrigin.length);
}
