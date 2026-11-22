import 'server-only';

import { DataGoKrError, serviceKey } from './dataGoKr';

/**
 * 행정안전부 대한민국 공공서비스(혜택) 정보 (보조금24)
 * https://www.data.go.kr/data/15113968/openapi.do
 */
const BASE_URL = 'https://api.odcloud.kr/api/gov24/v3';

export type Gov24Endpoint = 'serviceList' | 'serviceDetail' | 'supportConditions';

export type Gov24Page<T> = {
  page: number;
  perPage: number;
  totalCount: number;
  currentCount: number;
  matchCount: number;
  data: T[];
};

export async function gov24Get<T>(
  endpoint: Gov24Endpoint,
  params: Record<string, string | number>,
): Promise<Gov24Page<T>> {
  const qs = new URLSearchParams({ serviceKey: serviceKey(), returnType: 'JSON' });
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));

  const res = await fetch(`${BASE_URL}/${endpoint}?${qs}`, { cache: 'no-store' });
  const body = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    throw new DataGoKrError(
      `gov24 ${endpoint}: JSON이 아닌 응답 (${res.status}) ${body.slice(0, 200)}`,
      502,
    );
  }
  const err = json as { code?: number; msg?: string };
  if (!res.ok || (typeof err.code === 'number' && err.code < 0)) {
    throw new DataGoKrError(
      `gov24 ${endpoint}: ${err.msg ?? res.statusText} (code ${err.code ?? res.status})`,
      502,
    );
  }
  return json as Gov24Page<T>;
}
