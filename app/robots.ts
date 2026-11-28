import type { MetadataRoute } from 'next';

import { withdrawalStatusPath } from '@/features/account-withdrawals/lib/withdrawalPaths';

import { siteOrigin } from './_lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', `${withdrawalStatusPath}$`, `${withdrawalStatusPath}?`],
      disallow: ['/api/', '/auth/', '/my-page'],
    },
    sitemap: siteOrigin ? new URL('/sitemap.xml', siteOrigin).href : undefined,
  };
}
