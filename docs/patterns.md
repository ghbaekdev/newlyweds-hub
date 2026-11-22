# Implementation Patterns

## Entity API 패턴

```
entities/{domain}/api/     — server-only 순수 API 함수 (파일당 1함수)
entities/{domain}/lib/     — 응답 → 화면용 데이터 순수 변환
entities/{domain}/model/   — 타입, const 객체, 라벨
```

```typescript
// entities/benefits/api/getBenefits.ts
import { cacheLife, cacheTag } from 'next/cache';
import 'server-only';

import { createServerSupabase } from '@/shared/lib/supabase/serverClient';

export async function getBenefits(): Promise<Benefit[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('benefits');
  const { data, error } = await createServerSupabase().from('benefits').select(COLUMNS);
  if (error) throw new Error(`Supabase benefits: ${error.message}`);
  return data as unknown as Benefit[];
}
```

`entities`에는 React hook을 두지 않는다.

Canonical example: `entities/benefits/`

## 페이지 패턴

### 서버에서 데이터를 받는 페이지

```
entities/{domain}/api/get{Domain}.ts      — 데이터 조회
features/{domain}/model/use{Domain}Filters.ts — 필터 상태
features/{domain}/lib/filter{Domain}.ts   — 순수 필터 함수
widgets/{domain}/ui/{Domain}Card.tsx      — 읽기 전용 카드
views/{domain}/ui/{Domain}View.tsx        — 'use client' 조합
app/{route}/page.tsx                      — 조회 + <View data={...} />
```

Canonical example: `/benefits`

### 클라이언트에서 다시 받는 페이지 (새로고침 버튼)

```
entities/{domain}/api/load{Domain}.ts     — 외부 API + 파일 캐시
app/api/{name}/route.ts                   — entity 호출, toErrorResponse로 에러 처리
features/{domain}/model/use{Domain}.ts    — fetch + reload + loading/error
views/{domain}/ui/{Domain}View.tsx        — 조합
app/{route}/page.tsx                      — <View />만 렌더
```

Canonical example: `/housing`

## Feature model / lib 분리

- `features/{domain}/model/`: 상태 훅, fetch 훅, 기능 전용 타입·상수
- `features/{domain}/lib/`: 순수 필터·정렬·집계 함수. `use*` hook을 두지 않는다

## 필터 상태 초기화

데이터가 바뀔 때 필터를 기본값으로 되돌려야 하면 `useEffect`로 setState하지 말고, 상태에 기준 키(`fetchedAt` 등)를 같이 저장해 렌더 중에 비교한다. 예: `features/gov24-services/model/useServiceFilters.ts`

## API Route 패턴

`app/api/[name]/route.ts`에서 `GET` 등을 export한다. 본문은 entity 함수 호출과 `Response.json()`만 두고, 에러는 `shared/lib/api/errorResponse.ts`의 `toErrorResponse(e)`로 돌려준다.
