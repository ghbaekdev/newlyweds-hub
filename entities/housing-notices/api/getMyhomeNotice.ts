import 'server-only';

import { MyhomePdfStatus } from '../model/myhomeCatalog';
import { getMyhomeCatalog } from './getMyhomeCatalog';
import { getMyhomeNoticeDetails } from './getMyhomeNoticeDetails';

const sampleHashes: Record<string, string> = {
  'rent-21590': 'c23d9817403b8f8fcbf08345274f813c33578512989857b72df0599be837ebdc',
  'sale-1505': 'a8f9f4511ae2db83267f03ea5a1201789f33153e1aa8984db534fd410baa0553',
};

export async function getMyhomeNotice(slug: string) {
  const catalog = await getMyhomeCatalog();
  const item = catalog?.notices.find((notice) => notice.slug === slug);
  const sample = getMyhomeNoticeDetails().find((notice) => notice.slug === slug);

  if (
    sample &&
    (!catalog ||
      (item?.pdfStatus === MyhomePdfStatus.PARSED && item.pdfHash === sampleHashes[slug]))
  ) {
    return { source: 'sample', notice: sample } as const;
  }

  return item ? ({ source: 'catalog', notice: item } as const) : null;
}
