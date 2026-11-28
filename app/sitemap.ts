import type { MetadataRoute } from 'next';

import { getMyhomeCatalog } from '@/entities/housing-notices/api/getMyhomeCatalog';
import { getMyhomeNoticeDetails } from '@/entities/housing-notices/api/getMyhomeNoticeDetails';

import { housingNoticePath, publicPaths, siteOrigin } from './_lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteOrigin) return [];

  const catalog = await getMyhomeCatalog();
  const notices = catalog?.notices ?? getMyhomeNoticeDetails();
  const paths = new Set([...publicPaths, ...notices.map(({ slug }) => housingNoticePath(slug))]);

  return Array.from(paths, (path) => ({ url: new URL(path, siteOrigin).href }));
}
