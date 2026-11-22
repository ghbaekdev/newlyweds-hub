# FSD Architecture (Feature-Sliced Design)

## 디렉토리 구조

```
app/                    # Next.js App Router (page, layout, API route) — 라우팅과 데이터 조회만
├── api/[name]/route.ts # 클라이언트가 다시 받아야 하는 데이터 (새로고침 등)
└── [route]/page.tsx    # Server Component: entity API 호출 → view에 props 전달

views/                  # 페이지 뷰 조합 (특정 라우트 전용)
└── [view]/ui/

widgets/                # 화면 블록 (읽기 전용, props로만 그림)
└── [widget]/ui/

features/               # 사용자 기능 (필터, 새로고침, 상세 펼치기)
└── [feature]/
    ├── model/          # 상태 훅, 클라이언트 fetch 훅, 기능 전용 타입·상수
    ├── lib/            # 순수 함수 (필터, 정렬, 집계)
    └── ui/             # 기능 UI 컴포넌트

entities/               # 비즈니스 엔티티
└── [entity]/
    ├── api/            # server-only 순수 API 함수 (파일당 1개)
    ├── lib/            # 순수 변환 (응답 → 화면용 데이터)
    └── model/          # 타입, const 객체, 라벨

shared/                 # 도메인 무관 공용
├── lib/
│   ├── api/            # 공공데이터포털 인증키·에러, 보조금24 클라이언트, route 에러 응답
│   ├── supabase/       # 서버용 Supabase 클라이언트
│   └── format.ts
└── ui/                 # 두 도메인 이상에서 쓰는 UI
```

## 레이어 의존성 규칙 (단방향)

```
app → views → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어만 참조한다
- 같은 레이어 간 참조는 책임이 분명할 때만 허용한다
- shared는 어디서든 참조한다
- 역방향 참조는 금지한다

| 레이어 | 역할 | 예시 |
|--------|------|------|
| **app** | 라우팅, 레이아웃, 서버 데이터 조회 | `app/benefits/page.tsx` |
| **views** | 라우트 하나의 화면 조합 | `BenefitsView` |
| **widgets** | 재사용 가능한 읽기 전용 블록 | `BenefitCard`, `ApplyhomeTable` |
| **features** | 필터·새로고침 등 사용자 기능 | `useBenefitFilters`, `ServiceDetail` |
| **entities** | 순수 API, 타입, 변환 | `getBenefits`, `Benefit` |
| **shared** | 공통 유틸, UI | `formatWon`, `StatCard` |

## 클라이언트/서버 경계

- `entities/*/api/*`는 첫 줄에 `import 'server-only';`를 둔다. 클라이언트 컴포넌트는 여기서 **타입만** `import type`으로 가져온다.
- `entities/*/model/*`, `entities/*/lib/*`는 서버 전용 import(`node:fs`, Supabase 등)를 두지 않는다. 그래야 클라이언트에서도 상수·라벨을 쓸 수 있다.
- `'use client'`는 views와, 상태를 쓰는 features/widgets 컴포넌트에만 둔다.

## 현재 도메인 구조

| 도메인 | entities | features | widgets | views | 라우트 |
|---|---|---|---|---|---|
| `benefits` (Supabase 정규화 혜택) | ✓ | ✓ | ✓ | ✓ | `/benefits` |
| `gov24-services` (보조금24 원본) | ✓ | ✓ | ✓ | ✓ | `/benefits/raw`, `/api/gov24/*` |
| `housing-notices` (청약홈·마이홈) | ✓ | ✓ | ✓ | ✓ | `/housing`, `/api/housing` |

## Important Paths

| 용도 | 경로 |
|------|------|
| 환경변수 | `.env.local` (예시: `.env.example`) |
| Supabase 서버 클라이언트 | `shared/lib/supabase/serverClient.ts` |
| 공공데이터포털 인증키·에러 | `shared/lib/api/dataGoKr.ts` |
| 보조금24 클라이언트 | `shared/lib/api/gov24Client.ts` |
| Entity API | `entities/[entity]/api/` |
| Entity 타입·라벨 | `entities/[entity]/model/types.ts` |
| 정적 데이터 | `data/regions.json`, `data/benefits.*.json` |
| DB 스키마 | `supabase/migrations/` |
| 적재 스크립트 | `scripts/load-benefits.mjs` |
