# State Management

## 서버 데이터

| 경우 | 방법 |
|---|---|
| 페이지 진입 시 한 번 받으면 되는 데이터 | `page.tsx`(Server Component)에서 entity API 호출 → view에 props |
| 자주 안 바뀌는 데이터 | entity API에 `'use cache'` + `cacheLife` + `cacheTag` (`next.config.ts`의 `cacheComponents: true`) |
| 사용자가 새로 받기를 누르는 데이터 | `app/api/*/route.ts` + `features/{domain}/model/use*.ts`의 `fetch` |

클라이언트 fetch 훅은 `{ data, error, isLoading, reload }`를 돌려준다. 언마운트·재요청 시 이전 응답을 버리도록 `cancelled` 플래그를 둔다.

## 클라이언트 상태

- 필터·탭 같은 화면 상태는 `useState`로 `features/{domain}/model/use*Filters.ts`에 모은다.
- 파생 값(필터 결과, 집계)은 상태로 두지 않고 렌더 중에 `features/{domain}/lib`의 순수 함수로 계산한다. `useMemo`는 쓰지 않는다 (React Compiler).

## 나중에 도입할 때

agent-builder-web과 같은 방식으로 들인다.

- 클라이언트 서버 상태가 여러 화면에서 공유되면 → React Query + `@lukemorales/query-key-factory` (`features/{domain}/config/queries.ts`, `features/{domain}/api/use*.ts`)
- 필터를 URL로 공유해야 하면 → nuqs `useQueryStates`
- 도메인 간 전역 상태가 필요하면 → Zustand (`shared/store/` 또는 `features/{domain}/model/`)
