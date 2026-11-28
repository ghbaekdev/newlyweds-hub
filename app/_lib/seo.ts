import type { Metadata } from 'next';

export const siteTitle = '신혼부부 혜택·주거 공고';
export const siteDescription =
  '신혼부부를 위한 정부 지원 혜택과 공공임대·공공분양 공고를 찾아보세요.';
export const siteOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : undefined;
export const publicPaths = ['/', '/benefits', '/housing'] as const;

export function pageMetadata(
  path: (typeof publicPaths)[number],
  title: string,
  description: string,
): Metadata {
  const url = siteOrigin ? new URL(path, siteOrigin).href : undefined;

  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: { title, description, url, siteName: siteTitle, locale: 'ko_KR', type: 'website' },
  };
}
