# Coding Conventions

## 네이밍

### 파일명

| 대상     | 규칙                         | 예시                   |
| -------- | ---------------------------- | ---------------------- |
| 컴포넌트 | `PascalCase.tsx`             | `BenefitCard.tsx`      |
| 페이지   | `page.tsx`                   | Next.js 규칙           |
| hooks    | `use[Name].ts`               | `useBenefitFilters.ts` |
| API 함수 | 함수명 그대로 `camelCase.ts` | `getBenefits.ts`       |
| 타입     | `types.ts`                   |                        |
| 유틸리티 | `camelCase.ts`               | `filterBenefits.ts`    |

### 폴더명

- `features`, `entities`, `views`, `widgets`의 도메인 폴더는 복수형 명사, kebab-case (`benefits`, `housing-notices`).
- 역할명(`viewer`, `explorer`, `browser`)은 폴더명이 아니라 파일명으로 내린다.

### 함수/변수명

| 대상            | 규칙                | 예시                              |
| --------------- | ------------------- | --------------------------------- |
| 컴포넌트/타입명 | `PascalCase`        | `BenefitCard`, `BenefitCardProps` |
| 일반 함수       | `camelCase`         | `formatWon`                       |
| 상수            | `UPPER_SNAKE_CASE`  | `CACHE_FILE`                      |
| 이벤트 핸들러   | `handle` 접두사     | `handleSidoChange`                |
| Boolean         | `is/has/can/should` | `isLoading`                       |

## Import 순서

Prettier가 `.prettierrc`의 `importOrder`로 자동 정렬한다. 직접 쓸 때도 같은 순서를 따른다.

```typescript
// 1. 외부 (react, next 포함)
import { useState } from 'react';

// 2. 내부 — 레이어 위에서 아래로
import BenefitCard from '@/widgets/benefits/ui/BenefitCard';

import { filterBenefits } from '@/features/benefits/lib/filterBenefits';

import { BenefitCategoryLabel } from '@/entities/benefits/model/types';
// 타입은 `import type`으로
import type { Benefit } from '@/entities/benefits/model/types';

import { formatWon } from '@/shared/lib/format';

// 3. 상대 경로
import './globals.css';
```

## 컴포넌트 구조

```typescript
type ComponentProps = {
  title: string;
  children: React.ReactNode;
  optional?: string;
};

export default function Component({ title, children, optional }: ComponentProps) {
  // 1. Hooks (상태, 효과)
  // 2. 계산된 값
  // 3. 이벤트 핸들러
  // 4. 조건부 렌더링 (early returns)
  // 5. 메인 JSX
}
```

- Props는 `type`으로 정의한다 (`interface` 대신)
- 컴포넌트는 `export default function`. 훅과 순수 함수는 named export
- 한 파일에 컴포넌트 하나. 그 파일 안에서만 쓰는 작은 보조 컴포넌트는 같은 파일에 둬도 된다

## 타입 및 const 객체

### const 객체 패턴 (Enum 대신)

```typescript
// entities/{domain}/model/types.ts

// 1. 상태값 상수
export const BenefitRelevance = {
  CORE: 'core',
  INCLUDES: 'includes',
  INCIDENTAL: 'incidental',
} as const;

// 2. 타입 추출
export type BenefitRelevance = (typeof BenefitRelevance)[keyof typeof BenefitRelevance];

// 3. 라벨 매핑 (UI 표시용)
export const BenefitCategoryLabel: Record<BenefitCategory, string> = { ... };

// 4. Select 옵션 (필요시)
export const MaritalStatusOptions = Object.entries(MaritalStatusLabel).map(([value, label]) => ({ value, label }));
```

- 값 비교는 반드시 상수로: `b.relevance === BenefitRelevance.CORE` (문자열 직접 비교 금지)
- DB·API 원본 값(snake_case, 한글 값)은 그대로 두고 상수 객체의 값으로만 쓴다

### 타입 위치

| 유형                     | 위치                               |
| ------------------------ | ---------------------------------- |
| 도메인 데이터            | `entities/{domain}/model/types.ts` |
| 기능 전용 (필터 상태 등) | `features/{domain}/model/types.ts` |
| 여러 도메인 공통         | `shared/types/`                    |

## 조기 추상화 방지

- 사용 사례가 다를 수 있다면 중복을 허용한다 (예: `loadAllServices`와 `loadHousing`의 파일 캐시 코드는 따로 둔다)
- 두 도메인 이상에서 같은 UI를 쓰게 되면 그때 `shared/ui`로 옮긴다

## Props Drilling 방지

1순위: **Component Composition** (`children`으로 컴포넌트 주입)
2순위: **자체 완결 컴포넌트** (내부 훅으로 상태/액션 관리, 예: `ServiceDetail`)

## 코드 품질

- Prettier: 2칸 들여쓰기, **세미콜론 있음**, 작은따옴표, printWidth 100, Tailwind 클래스 정렬, import 정렬
- TypeScript strict, `@/` 경로 별칭

### shadcn/ui

- 도메인 독립 컴포넌트는 `shared/ui`, 클래스 조합 함수는 `shared/lib/cn.ts`에 둔다.
- 화면별 UI 조합과 상태는 해당 FSD 슬라이스에 둔다. Shared는 상위 레이어를 참조하지 않는다.
- shadcn 시맨틱 색상은 `app/globals.css`에서 기존 `hub-*` 토큰을 참조한다. 새 컴포넌트는 기존 화면의 크기, 색상, 간격과 HTML 의미를 기준으로 조정한다.
