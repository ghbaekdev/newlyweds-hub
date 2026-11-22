import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import 'server-only';

import { gov24Get } from '@/shared/lib/api/gov24Client';

import type { Gov24Service, ServiceSnapshot } from '../model/types';

const PER_PAGE = 1000;
const CONCURRENCY = 4;
const CACHE_FILE = path.join(process.cwd(), '.cache', 'gov24-services.json');

let memo: ServiceSnapshot | null = null;

/** 전체 서비스 목록(약 1만 건)을 받아 .cache에 저장한다. refresh=false면 캐시를 쓴다. */
export async function loadAllServices(refresh = false): Promise<ServiceSnapshot> {
  if (!refresh) {
    if (memo) return memo;
    try {
      memo = JSON.parse(await readFile(CACHE_FILE, 'utf8')) as ServiceSnapshot;
      return memo;
    } catch {
      // 캐시 없음 → 새로 받는다
    }
  }

  const first = await gov24Get<Gov24Service>('serviceList', { page: 1, perPage: PER_PAGE });
  const pages = Math.ceil(first.totalCount / PER_PAGE);
  const services = [...first.data];

  const rest = Array.from({ length: Math.max(0, pages - 1) }, (_, i) => i + 2);
  for (let i = 0; i < rest.length; i += CONCURRENCY) {
    const batch = await Promise.all(
      rest
        .slice(i, i + CONCURRENCY)
        .map((page) => gov24Get<Gov24Service>('serviceList', { page, perPage: PER_PAGE })),
    );
    for (const p of batch) services.push(...p.data);
  }

  memo = { fetchedAt: new Date().toISOString(), totalCount: first.totalCount, services };
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(memo));
  return memo;
}
