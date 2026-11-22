import HousingNoticesView from '@/views/housing-notices/ui/HousingNoticesView';

import { getMyhomeCatalog } from '@/entities/housing-notices/api/getMyhomeCatalog';
import { getMyhomeNoticeDetails } from '@/entities/housing-notices/api/getMyhomeNoticeDetails';
import { toMyhomeNoticeSummary } from '@/entities/housing-notices/lib/toMyhomeNoticeSummary';

export const metadata = { title: '마이홈 주택 공고' };

export default async function Page() {
  const catalog = await getMyhomeCatalog();
  const notices = catalog?.notices.map(toMyhomeNoticeSummary) ?? getMyhomeNoticeDetails();

  return <HousingNoticesView notices={notices} fetchedAt={catalog?.fetchedAt} />;
}
