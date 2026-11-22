<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Project Intent

- Next.js 16 기반 신혼부부 혜택·주택 공고 탐색 서비스.
- FSD 구조를 지키고, 로직은 가능한 가장 낮은 레이어에 둔다.
- 규칙 전문과 문서 목록은 `CLAUDE.md`와 `docs/`에 있다.

## Critical Rules

- 레이어 방향 `app -> views -> widgets -> features -> entities -> shared`. 역방향 import 금지, 같은 레이어 import는 책임이 분명할 때 허용.
- Props는 `type`, 컴포넌트는 `export default function`.
- `useMemo`/`useCallback`을 새로 쓰지 않는다 (React Compiler 사용).
- enum 대신 `const` 객체 + `as const`, 비교는 상수로.
- `entities`는 `server-only` 순수 API 함수·타입·순수 변환만. hook·UI 상태 금지.
- `features/model`은 상태·오케스트레이션, `features/lib`는 순수 함수·스키마.
- `features`, `entities`, `views`, `widgets` 도메인 폴더명은 복수형 명사(kebab-case).

## Common Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm format:check
```

## Verification

- 바꾼 슬라이스에 맞는 가장 작은 검사부터 돌린다.
- 끝나기 전에 `pnpm lint`, `pnpm format:check`, `pnpm build`를 돌린다.
- 화면 동작이 바뀌면 `/benefits`, `/benefits/raw`, `/housing`을 직접 열어 확인하고, 확인하지 못한 부분은 보고한다.
