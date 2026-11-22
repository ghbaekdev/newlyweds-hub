import { myhomePdfLabels } from '../model/myhomeCatalog';
import type { MyhomeCatalogItem } from '../model/myhomeCatalog';
import type { MyhomeNoticeSummary } from '../model/myhomeNoticeDetails';

export function toMyhomeNoticeSummary(item: MyhomeCatalogItem): MyhomeNoticeSummary {
  return {
    slug: item.slug,
    title: item.title,
    kind: item.kind,
    location: item.regions.join(', ') || '지역 미제공',
    catalogPeriod: { startsOn: item.startsOn, endsOn: item.endsOn },
    statusLabel: myhomePdfLabels[item.pdfStatus],
  };
}
