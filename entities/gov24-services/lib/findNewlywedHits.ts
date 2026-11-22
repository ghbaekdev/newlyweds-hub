import { NEWLYWED_KEYWORDS } from '../model/constants';
import { SEARCH_FIELDS } from '../model/types';
import type { Gov24Service, KeywordHit } from '../model/types';

export function findNewlywedHits(s: Gov24Service): KeywordHit[] {
  const hits: KeywordHit[] = [];
  for (const field of SEARCH_FIELDS) {
    const text = s[field];
    if (!text) continue;
    for (const { label, pattern } of NEWLYWED_KEYWORDS) {
      pattern.lastIndex = 0;
      const m = pattern.exec(text);
      if (!m) continue;
      const start = Math.max(0, m.index - 40);
      const end = Math.min(text.length, m.index + m[0].length + 60);
      hits.push({
        field,
        keyword: label,
        snippet: `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ')}${end < text.length ? '…' : ''}`,
      });
    }
  }
  return hits;
}
