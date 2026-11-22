import { notFound } from 'next/navigation';

import HousingNoticeCatalogView from '@/views/housing-notices/ui/HousingNoticeCatalogView';
import HousingNoticeDetailView from '@/views/housing-notices/ui/HousingNoticeDetailView';

import { getMyhomeCatalog } from '@/entities/housing-notices/api/getMyhomeCatalog';
import { getMyhomeNoticeDetails } from '@/entities/housing-notices/api/getMyhomeNoticeDetails';
import { MyhomePdfStatus } from '@/entities/housing-notices/model/myhomeCatalog';

const sampleHashes: Record<string, string> = {
  'rent-21590': 'c23d9817403b8f8fcbf08345274f813c33578512989857b72df0599be837ebdc',
  'sale-1505': 'a8f9f4511ae2db83267f03ea5a1201789f33153e1aa8984db534fd410baa0553',
};

export function generateStaticParams() {
  return getMyhomeNoticeDetails().map(({ slug }) => ({ slug }));
}

export default async function Page({ params }: PageProps<'/housing/[slug]'>) {
  const { slug } = await params;
  const catalog = await getMyhomeCatalog();
  const item = catalog?.notices.find((notice) => notice.slug === slug);
  const sample = getMyhomeNoticeDetails().find((notice) => notice.slug === slug);

  if (
    sample &&
    (!catalog ||
      (item?.pdfStatus === MyhomePdfStatus.PARSED && item.pdfHash === sampleHashes[slug]))
  ) {
    return <HousingNoticeDetailView notice={sample} />;
  }

  if (!item) notFound();

  return <HousingNoticeCatalogView notice={item} />;
}
