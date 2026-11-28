# 전체 화면 shadcn/ui 도입 계획

> 실행 시 Superpowers의 `executing-plans` 또는 `subagent-driven-development`를 사용한다. 체크박스로 진행 상황을 기록한다.

**목표** — `/benefits`와 `/housing`를 포함한 기존 화면 전체에 프로젝트 Tailwind 테마를 사용하는 shadcn/ui 공통 컴포넌트를 적용한다.

**설계 결정** — 기존 화면 전체를 한 릴리스에서 전환하고, 구현과 검증은 화면군별로 진행한다. 기존 `hub-*` 토큰을 색상 기준으로 삼고 shadcn/ui 시맨틱 토큰에서 참조한다. FSD의 Shared 레이어에서 기본 UI를 제공하고 Feature·Widget·View에서 각 화면의 동작과 조합을 맡는다.

**기술** — Next.js 16, React 19, Tailwind CSS 4, shadcn/ui.

## 1. 기존 동작 기록 및 공통 UI 구성

- [ ] 구현 전에 `AGENTS.md`, `docs/conventions.md`, 설치된 Next.js의 `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`를 읽는다.
- [ ] 아래 전체 경로의 모바일·데스크톱 기준 화면을 기록한다. 로그인 전후 및 로딩·빈 결과·오류처럼 표시가 달라지는 상태도 해당 화면에서 비교한다. 두 필터의 기본값, 선택 후 결과 건수, 초기화 결과를 기록한다. 모바일과 데스크톱에서 입력 높이, 간격, 포커스 표시를 비교할 수 있도록 현재 모습을 확인한다.
- [ ] 루트 `components.json`에 TSX, RSC, CSS 변수 사용을 설정한다. Tailwind CSS 파일은 `app/globals.css`, UI 별칭은 `@/shared/ui`, 유틸리티 별칭은 `@/shared/lib/cn`으로 지정한다. CLI의 생성 내용을 검토해 이번 컴포넌트에 필요한 파일과 의존성만 반영한다.
- [ ] `app/globals.css`의 `@theme inline`에서 필요한 shadcn 토큰을 연결한다. `primary`와 `ring`은 `hub-accent`, `muted-foreground`는 `hub-muted`, `border`와 `input`은 `hub-line`을 사용한다. 기본 필드 표면은 현재의 흰색, 텍스트는 `hub-ink`, 비활성 필드 배경은 `hub-bg`를 사용한다. 필드 높이 `min-h-11`, `rounded-md`, 패딩, 플레이스홀더 색상은 현재 `hub-field`와 맞춘다. 허브 화면의 라이트 색상은 OS 다크 모드에서도 같은 대비를 갖게 한다.
- [ ] `shared/lib/cn.ts`에 `cn(...inputs: ClassValue[]): string`을 두고 클래스 조합과 충돌 해소에 사용한다.
- [ ] `shared/ui/Input.tsx`, `shared/ui/NativeSelect.tsx`, `shared/ui/Button.tsx`를 추가한다. 각 컴포넌트는 `type` Props와 `export default function` 규칙을 따르고 대응하는 네이티브 요소의 props를 전달한다. `NativeSelect`는 `option` 자식을 받으며 `value`, `disabled`, `aria-label`, `onChange`를 실제 select에 전달한다. `Button`에는 두 초기화 버튼의 왼쪽 정렬, 색상, 최소 높이, 호버 밑줄을 재사용할 `reset` variant를 둔다. Shared의 의존성은 Shared 내부와 외부 라이브러리로 제한한다.
- [ ] 공통 파일에 ESLint와 Prettier 검사를 먼저 실행한다. 생성된 import 경로와 클라이언트 경계를 검토한다.

## 2. 혜택·주택 필터 동시 전환

- [ ] `features/benefit-filters/ui/BenefitsBrowser.tsx`에서 혜택명 검색, 혼인 경과 년수, 나이를 `Input`으로 전환한다. 시도, 시군구, 혼인 상태는 `NativeSelect`, 조건 초기화는 `Button`의 `reset` variant를 사용한다. 검색·숫자 입력의 `type`, `min`, `step`, 라벨과 플레이스홀더를 보존한다. 체크박스와 지원 분야 접기는 아래 공통 UI 이관 단계에서 다룬다.
- [ ] `features/housing-filters/ui/HousingNoticeList.tsx`에서 공고명·지역 검색은 `Input`, 공급 유형은 `NativeSelect`, 조건 초기화는 같은 `Button` variant로 전환한다.
- [ ] 두 화면에서 기존 이벤트 핸들러, 옵션 값, 필터 조건과 초기화 동작을 그대로 연결한다. `FilterPanel`과 결과 목록은 기존 구성을 사용한다. `hub-field`는 계정·가구 폼 등 기존 사용처에서 계속 제공한다.
- [ ] `CLAUDE.md`의 shadcn/ui 미도입 설명을 갱신하고 `docs/conventions.md`에 공통 UI의 배치와 토큰 사용 규칙을 기록한다.

## 3. 나머지 화면 및 공통 UI 전환

- [ ] `shared/ui`에 실제 사용처가 확인된 shadcn 기반 `Checkbox`, `Card`, `Alert`를 추가하고 필요에 따라 기존 `FilterPanel`, `StatCard`, `ErrorAlert` 내부에서 조합한다. 접기·펼치기는 키보드와 열린 상태를 동일하게 전달할 수 있는 경우 `Collapsible`을 사용한다. 기본 HTML의 의미와 동작이 중요한 링크, 목록, 제목, 표에는 해당 태그를 유지한다. 도입하지 않는 UI는 화면별 검토에서 이유를 기록한다.
- [ ] 공통 컴포넌트에 허브, 계정, 위험 동작처럼 실제로 반복되는 스타일만 variant로 정의한다. 기존 화면의 배경, 텍스트 대비, 글자 크기·굵기, 여백, 모서리, 컨트롤 크기, 반응형 배치를 기준 화면과 비교한다. 홈, 카카오 로그인, 로그아웃, 탈퇴처럼 목적이 다른 버튼의 스타일을 필터 버튼에 맞춰 통일할 필요는 없다.
- [ ] `/`와 전역 레이아웃의 `SupportHubView`, `SiteNavigation`, `NavigationLink`에서 카드와 액션의 공통 UI를 적용한다. 내비게이션 링크 의미, 활성 상태, 모바일 배치와 로그인 상태에 따른 메뉴를 보존한다.
- [ ] `/benefits/raw`의 `BenefitsExplorer`에 검색·선택·체크박스·결과 상태용 공통 UI를 연결한다. 변환 과정에서 필요한 도메인 상태와 데이터 처리는 Feature에 두고 라우트 진입점에서 조합한다. `/benefits`에서도 지원 분야와 선택 조건의 체크박스 동작을 검증한다.
- [ ] `/housing`의 카탈로그와 `/housing/[slug]`의 `HousingNoticeDetailView`, `HousingNoticeSelection`에 카드·액션·선택 요소를 적용한다. 공급·지역 선택, 공고 상세 링크, 외부 링크와 빈 결과를 확인한다.
- [ ] `/login`의 `LoginView`·`LoginLink`, `/my-page`의 `MyPageView`·`SaveAccountProfileForm` 및 `features/household-profiles/ui`에 공통 버튼·폼 컨트롤·피드백 UI를 적용한다. 폼의 `name`, 기본값, 제출 버튼 타입, 서버 액션, 비활성·진행 중 상태를 보존한다.
- [ ] `/my-page/withdrawal`, `/my-page/withdrawal/status`의 두 Withdrawal View와 `WithdrawalStatusRefresh`에서 공통 버튼과 상태 표시를 적용한다. 본인확인, 제출, 상태 갱신의 동작 및 위험 버튼의 시각적 구분을 보존한다. 화면 검증에는 테스트 계정이나 테스트 상태를 사용한다.
- [ ] 각 화면 이관 후 `hub-field` 사용처를 다시 확인하고 참조가 사라진 경우 전용 유틸리티와 플레이스홀더 스타일을 정리한다. 기존 스타일과 공유할 토큰은 한 곳에서 관리한다.

## 4. 완료 검증

- [ ] `/benefits`에서 검색 결과와 건수, 시도 변경 시 시군구 초기화, 시도 미선택 시 시군구 비활성화, 혼인 상태에 따른 년수 필드 표시, 전체 조건 초기화를 확인한다.
- [ ] `/housing`에서 공고명과 지역 검색, 공급 유형과 검색어의 결합, 조건 초기화 후 기본 목록 복귀를 확인한다.
- [ ] `/benefits/raw`에서 검색·필터를 조작해 공용 CSS 변경의 영향을 확인한다.
- [ ] 전체 라우트인 `/`, `/benefits`, `/benefits/raw`, `/housing`, 실제 공고의 `/housing/[slug]`, `/login`, `/my-page`, `/my-page/withdrawal`, `/my-page/withdrawal/status`를 열어 기준 화면과 비교한다. 로그인·저장·검증 오류·상태 갱신은 테스트 계정이나 테스트 상태로 확인한다.
- [ ] 모바일과 데스크톱에서 라벨 클릭, Tab 포커스 표시, 키보드 선택, 초기화 버튼 활성화, 필터 패널의 가로 넘침 여부를 확인한다. OS 다크 모드에서 허브 필드의 텍스트와 포커스 대비를 확인한다.
- [ ] 변경 파일의 검사에 이어 `pnpm lint`, `pnpm format:check`, `pnpm build`를 실행한다. 검증이 막힌 항목은 명령 또는 경로와 원인을 기록한다.

[shadcn 설정](https://ui.shadcn.com/docs/components-json) · [shadcn 테마](https://ui.shadcn.com/docs/theming)
