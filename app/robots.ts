import type { MetadataRoute } from 'next';

import { siteOrigin } from './_lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/auth/', '/my-page'] },
    sitemap: siteOrigin ? new URL('/sitemap.xml', siteOrigin).href : undefined,
  };
}
