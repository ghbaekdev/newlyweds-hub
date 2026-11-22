# newlyweds-test - Development Guide

Next.js 16 기반 신혼부부 혜택·주택 공고 탐색 서비스 (FSD 아키텍처, 서버 우선)

규칙의 원본은 `livekit-agent-builder/agent-builder-web`이다. 이 프로젝트는 서버 컴포넌트 + `"use cache"` + `server-only` Supabase로 데이터를 가져오므로 axios·React Query 관련 규칙은 서버 우선 방식으로 바꿔 적용한다.

## Critical Rules

1. FSD 레이어 의존성: `app → views → widgets → features → entities → shared` (역방향 금지)
2. Props는 `type`으로 정의 (`interface` 대신)
3. 컴포넌트는 `export default function` 사용
4. `useMemo`, `useCallback` 수동 사용 금지 (`reactCompiler: true`로 React Compiler가 자동 최적화)
5. Enum 대신 `const` 객체 + `as const` 패턴
6. 값 비교 시 상수 사용 (`=== BenefitRelevance.CORE`, 문자열 직접 비교 금지)
7. Entity API = `server-only` 순수 함수 (Supabase/외부 API `fetch`, 필요하면 `"use cache"` + `cacheTag`). 파일당 함수 1개
8. 서버 데이터는 `app/**/page.tsx`(Server Component)가 entity API로 가져와 view에 props로 넘긴다. 클라이언트에서 다시 받아야 하는 데이터(새로고침 등)는 `app/api/*/route.ts` + feature `model` 훅의 `fetch`로 받는다
9. Props drilling 금지 → Component Composition 또는 자체 완결 컴포넌트
10. 조기 추상화 방지 → 도메인이 다르면 중복 허용
11. Import 순서: React/Next → 외부 → 내부(레이어 순) → 상대 경로. Prettier(`@trivago/prettier-plugin-sort-imports`)가 정렬한다
12. `entities`에는 React hook·UI 상태를 두지 않는다. `features/model` = 상태·오케스트레이션, `features/lib` = 순수 함수

## 지금 쓰지 않는 것

React Query, axios `privateInstance`, `useLoading`, nuqs, Zustand, shadcn/ui는 아직 들이지 않았다. 클라이언트 쪽 서버 상태나 URL 필터 동기화가 실제로 필요해질 때 agent-builder-web 방식 그대로 도입하고 `docs/state-management.md`를 갱신한다.

## Docs

| 문서 | 내용 |
|------|------|
| [Architecture](docs/architecture.md) | FSD 디렉토리 구조, 레이어 규칙, 현재 도메인, Important Paths |
| [Conventions](docs/conventions.md) | 네이밍, Import, 컴포넌트 구조, 타입/const 패턴, Props Drilling |
| [State Management](docs/state-management.md) | 서버 데이터 흐름, 클라이언트 상태 |
| [Patterns](docs/patterns.md) | Entity API, 페이지 구성, API Route |
| [Commands](docs/commands.md) | dev/build/lint/format, 데이터 적재 |
