import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import 'server-only';

import type { HousingSnapshot } from '../model/types';
import { loadApplyhome } from './loadApplyhome';
import { loadMyhome } from './loadMyhome';

const CACHE_FILE = path.join(process.cwd(), '.cache', 'housing.json');
const APPLYHOME_DAYS = 90;

const ymd = (d: Date) => d.toISOString().slice(0, 10);

let memo: HousingSnapshot | null = null;

/** 청약홈(최근 90일) + 마이홈(최근 6개월) 공고를 받아 .cache에 저장한다. refresh=false면 캐시를 쓴다. */
export async function loadHousing(refresh = false): Promise<HousingSnapshot> {
  if (!refresh) {
    if (memo) return memo;
    try {
      memo = JSON.parse(await readFile(CACHE_FILE, 'utf8')) as HousingSnapshot;
      return memo;
    } catch {
      // 캐시 없음 → 새로 받는다
    }
  }
  const since = ymd(new Date(Date.now() - APPLYHOME_DAYS * 86400_000));
  const [applyhome, myhome] = await Promise.all([loadApplyhome(since), loadMyhome()]);
  applyhome.sort((a, b) => b.announceDate.localeCompare(a.announceDate));
  memo = { fetchedAt: new Date().toISOString(), applyhome, myhome };
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(memo));
  return memo;
}
