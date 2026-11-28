import 'server-only';

export function getAuthSiteUrl() {
  const configured = process.env.AUTH_SITE_URL;
  const value =
    configured ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');
  if (!URL.canParse(value)) return null;

  const url = new URL(value);
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (
    (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    return null;
  }

  return url;
}
