import type { MetadataRoute } from 'next';

import { publicPaths, siteOrigin } from './_lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return siteOrigin ? publicPaths.map((path) => ({ url: new URL(path, siteOrigin).href })) : [];
}
