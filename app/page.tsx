import SupportHubView from '@/views/support-hubs/ui/SupportHubView';

import { getBenefits } from '@/entities/benefits/api/getBenefits';
import { BenefitRelevance } from '@/entities/benefits/model/types';
import { getMyhomeCatalog } from '@/entities/housing-notices/api/getMyhomeCatalog';
import { getMyhomeNoticeDetails } from '@/entities/housing-notices/api/getMyhomeNoticeDetails';
import { isNewlywedNotice } from '@/entities/housing-notices/lib/isNewlywedNotice';
import { toMyhomeNoticeSummary } from '@/entities/housing-notices/lib/toMyhomeNoticeSummary';

export default async function Home() {
  const [housing, benefits] = await Promise.allSettled([getMyhomeCatalog(), getBenefits()]);
  const notices =
    housing.status === 'fulfilled'
      ? housing.value
        ? housing.value.notices
            .filter(({ title }) => isNewlywedNotice(title))
            .slice(0, 2)
            .map(toMyhomeNoticeSummary)
        : getMyhomeNoticeDetails().slice(0, 2)
      : null;
  const previews =
    benefits.status === 'fulfilled'
      ? benefits.value
          .filter((item) => item.relevance === BenefitRelevance.CORE && !item.stale_suspect)
          .slice(0, 2)
      : null;

  return <SupportHubView notices={notices} benefits={previews} />;
}
