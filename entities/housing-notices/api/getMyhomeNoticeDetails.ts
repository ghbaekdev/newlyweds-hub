import notices from '@/data/myhome-notices.json';
import 'server-only';

import type { MyhomeNoticeDetail } from '../model/myhomeNoticeDetails';
import { MyhomeKind } from '../model/types';

export function getMyhomeNoticeDetails(): MyhomeNoticeDetail[] {
  return notices.map((notice) => {
    const { kind } = notice;

    if (kind !== MyhomeKind.RENT && kind !== MyhomeKind.SALE) {
      throw new Error(`Unknown Myhome notice kind: ${kind}`);
    }

    return { ...notice, kind };
  });
}
