import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HousingNoticeCatalogView from '@/views/housing-notices/ui/HousingNoticeCatalogView';
import HousingNoticeDetailView from '@/views/housing-notices/ui/HousingNoticeDetailView';

import { getMyhomeNotice } from '@/entities/housing-notices/api/getMyhomeNotice';
import { getMyhomeNoticeDetails } from '@/entities/housing-notices/api/getMyhomeNoticeDetails';

import { housingNoticePath, pageMetadata } from '../../_lib/seo';

export function generateStaticParams() {
  return getMyhomeNoticeDetails().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/housing/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMyhomeNotice(slug);
  if (!result) notFound();

  const { notice } = result;
  const description =
    result.source === 'sample'
      ? result.notice.eligibility.summary
      : [
          result.notice.regions.join(', '),
          result.notice.supplier,
          result.notice.supplyType,
          result.notice.noticeStatus,
          '공고 내용과 공식 원문을 확인하세요.',
        ]
          .filter(Boolean)
          .join(' · ');

  return pageMetadata(housingNoticePath(notice.slug), notice.title, description);
}

export default async function Page({ params }: PageProps<'/housing/[slug]'>) {
  const { slug } = await params;
  const result = await getMyhomeNotice(slug);
  if (!result) notFound();

  return result.source === 'sample' ? (
    <HousingNoticeDetailView notice={result.notice} />
  ) : (
    <HousingNoticeCatalogView notice={result.notice} />
  );
}
