import HousingNoticesView from '@/views/housing-notices/ui/HousingNoticesView';

import { getMyhomeCatalog } from '@/entities/housing-notices/api/getMyhomeCatalog';
import { getMyhomeNoticeDetails } from '@/entities/housing-notices/api/getMyhomeNoticeDetails';
import { toMyhomeNoticeSummary } from '@/entities/housing-notices/lib/toMyhomeNoticeSummary';

import { pageMetadata } from '../_lib/seo';

export const metadata = pageMetadata(
  '/housing',
  '신혼부부 주택 공고',
  '신혼부부가 신청할 수 있는 공공임대·공공분양 공고와 모집 일정을 확인하세요.',
);

export default async function Page() {
  const catalog = await getMyhomeCatalog();
  const notices = catalog?.notices.map(toMyhomeNoticeSummary) ?? getMyhomeNoticeDetails();

  return <HousingNoticesView notices={notices} fetchedAt={catalog?.fetchedAt} />;
}
