# 1단계 회원·가구 관리 구현 계획

**목표** 신혼부부와 예비부부가 카카오로 가입하고, 하나의 가구 프로필과 회원 정보를 마이페이지에서 관리한다.

**구성** Next.js 16.4의 App Router와 Supabase Auth PKCE를 사용한다. 개인 세션은 Auth 전용 서버 클라이언트가 관리한다. 공개 목록과 상세 화면은 기존 공개 데이터 클라이언트 및 캐시를 사용한다.

**설계서** [1단계 회원·가구 관리와 마이페이지](../specs/2026-11-22-account-and-household-management-design.md)

## 1. 카카오 가입·로그인

- [x] `/login`에서 카카오 로그인 요청을 시작한다. `POST /auth/kakao`가 PKCE 검증 값과 복귀 경로를 쿠키에 기록한다. 실제 공급자 설정은 아래 절차를 따른다.
- [x] `GET /auth/callback`에서 인증 코드를 세션으로 교환한다. 첫 로그인은 Supabase가 `auth.users`와 카카오 identity를 생성하고, 재로그인은 같은 카카오 identity로 같은 사용자 ID를 재사용한다.
- [x] 공개 내비게이션의 로그인 진입점에 현재 경로와 쿼리를 전달한다. 복귀 허용 범위는 메인, 혜택 목록 및 원본, 주택 목록 및 공고 상세, 마이페이지다. 유효한 복귀 경로가 없으면 `/my-page`로 간다.
- [x] 취소와 실패 시 `/login`에서 다시 시도하거나 공개 화면으로 돌아갈 수 있다. 콜백에는 동일 브라우저에서 시작한 흐름의 PKCE 검증 값이 필요하며, 공급자 오류 상세와 인증 코드는 로그인 화면으로 전달하지 않는다.
- [x] `proxy.ts`가 마이페이지에 들어갈 때 만료된 토큰을 갱신한다. `/my-page`는 서버에서 사용자를 확인하고 로그인 계정의 공급자와 로그아웃 버튼을 표시한다. `POST /auth/sign-out`는 현재 서비스 세션을 종료하고 메인으로 돌려보낸다. 브라우저 세션을 지운 뒤에도 서버의 세션 종료를 확인할 수 없는 경우 로그인 화면에서 안내한다.
- [x] 복귀 경로 자동 테스트, 로컬 인증 대역에서 콜백 취소·교환 실패·재시도, 미인증 마이페이지 차단, 로그아웃 후 재진입을 확인한다. 공개 탐색은 브라우저에서 확인한다.
- [x] 운영 Supabase 프로젝트의 카카오 공급자와 신규 가입을 활성화하고, 로컬 앱에서 실제 카카오 로그인 화면으로 연결되는지 확인한다.
- [x] 실제 카카오 계정으로 인증 코드를 교환하고 로그인된 마이페이지에 진입하는지 확인한다.
- [ ] 실제 카카오 계정의 첫 가입 시 사용자 행 생성과 재로그인 시 같은 `auth.users.id` 재사용을 확인한다. 새로고침과 만료 후 세션 갱신, 두 브라우저 중 하나만 로그아웃하는 경우를 확인한다.

### 설정 및 실제 계정 검증

1. 카카오 Developers 앱에서 카카오 로그인 사용을 켜고 REST API 키에 Supabase 대시보드의 카카오 Callback URL인 `https://<project-ref>.supabase.co/auth/v1/callback`을 등록한다. 서비스에서 사용하지 않는 `profile_nickname`, `profile_image`, `account_email`은 사용 안 함으로 설정한다. 앱은 Supabase가 발급한 요청에서 `scope`를 제거해 카카오 앱의 동의 설정을 적용한다. 이전 테스트에서 이메일 동의를 받은 앱을 재사용한다면 새 테스트 계정으로 이메일이 내려오지 않는지 먼저 확인한다.
2. Supabase Authentication의 Sign In / Providers에서 신규 가입과 Kakao를 활성화한다. Kakao에 REST API 키와 활성화된 Client Secret을 입력하고, **Allow users without an email**을 켠다. 키와 시크릿은 대시보드에 입력한다. 이 서비스 전용 프로젝트로 다른 가입 공급자가 활성화되어 있지 않은지 확인한다.
3. Supabase Authentication의 URL Configuration에서 서비스의 Site URL과 허용할 전체 콜백 URL을 지정한다. 개발 환경은 `http://localhost:3000/auth/callback`, 운영 환경은 실제 HTTPS 도메인의 `/auth/callback`이다. Next.js에는 기존 Supabase URL과 publishable 키, 배포의 정확한 origin인 `AUTH_SITE_URL`을 설정한다.
4. 실제 카카오 동의 화면과 Supabase 테스트 계정으로 이메일 없이 가입할 수 있는지 확인한다. 실패 시 카카오 동의 항목과 Supabase 공급자 설정을 대조한다. 공급자 추가 전에는 Supabase의 이메일 기반 자동 연결을 우회할 수 있는 계정 격리 방식을 검증한다. 동일 이메일의 카카오·네이버 테스트 계정이 서로 다른 사용자 ID와 소유 데이터를 유지하는 경우에만 네이버를 활성화한다.

[Supabase 카카오 설정](https://supabase.com/docs/guides/auth/social-sign-in/auth-kakao) · [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) · [Supabase 계정 연결](https://supabase.com/docs/guides/auth/auth-identity-linking)

## 2. 마이페이지 내 정보 수정

- [x] `supabase/migrations/`에 `account_profiles`를 추가한다. 사용자 ID를 `auth.users.id`에 연결하고 기본 키로 사용한다. 선택 입력인 표시 이름의 길이를 제한하고 빈 입력은 NULL로 저장한다.
- [x] `entities/account-profiles/api/`에서 로그인 사용자 클라이언트로 조회 및 저장을 하고, `features/account-profiles/`에서 서버 입력 검증과 폼 상태를 처리한다. 본인만 조회·수정할 수 있는 RLS를 적용한다. 최초 조회는 기본값을 표시하고 첫 저장 때 행을 생성한다.
- [x] `views/my-pages/`에 내 정보 폼을 추가한다. 공급자는 읽기 전용으로 표시하며 저장 오류 시 입력을 유지한다.
- [x] 로컬 브라우저에서 표시 이름 저장·비우기와 저장 실패 후 재시도를 확인한다. 로컬 PostgreSQL에서 계정 간 조회 격리를 확인한다. 배포 환경 확인은 아래 절차에 남긴다.

## 3. 공통 가구 프로필

- [x] `supabase/migrations/`에 사용자 ID가 기본 키인 `household_profiles`를 추가하고 본인 전용 RLS를 적용한다. 희망 지역, 두 사람의 월평균 소득·주택 소유 상태·현재 거주 행정구역·연속 거주 시작일, 혼인 상태·혼인신고일, 가구원 수를 선택 입력으로 저장한다. 소득 0원과 미입력, 주택 소유 상태의 모름과 미입력을 구분한다.
- [x] `entities/household-profiles/`에 타입과 서버 조회·저장을 만들고, `features/household-profiles/`에 검증과 편집을 둔다. 희망 지역은 시·도 전체와 여러 시·군·구를 함께 저장할 수 있게 한다. 예비부부는 두 번째 사람의 조건을 입력할 수 있게 한다.
- [x] 개인 프로필은 요청별로 본인 세션에서 읽는다. 공고와 혜택 기능이 같은 조회 함수를 사용하도록 계약을 정하고, 개인 조건은 공개 카탈로그·URL·로그·분석·공유 캐시에서 제외한다.
- [x] 지역 혼합 선택, 0원, 날짜·숫자 검증, 선택 입력 삭제를 자동 테스트로 확인한다. 로컬 브라우저에서 저장 후 값 복원, 로컬 PostgreSQL에서 계정 간 조회 격리를 확인한다.

## 4. 재인증을 거치는 회원 탈퇴

- [x] `/my-page/withdrawal`에서 삭제 범위와 복구 불가를 안내한다. 카카오 OIDC의 `prompt=login`, 서명, `nonce`, `auth_time`을 검증하고, 현재 세션과 연결된 카카오 회원번호가 일치할 때만 확정 화면을 연다. 재인증 과정에서는 서비스 세션을 교체하지 않는다.
- [x] `supabase/migrations/`에 삭제 작업과 처리 상태를 영속화한다. 확정 직후 서버 접근 검사와 RLS에서 개인정보 조회·쓰기를 차단하고, 처리 중 로그인한 기존 계정은 상태 화면으로 보낸다. 기존 토큰의 개인 데이터 접근도 차단하고, 계정과 기존 identity를 삭제한 뒤 새 가입을 허용한다.
- [x] Supabase Cron이 분당 한 번 대기 작업을 처리한다. Auth 계정, 프로필, 세션 삭제와 완료 기록을 한 트랜잭션에서 반영한다. 실패한 작업은 재시도하며, 완료 후 24시간 동안 사용자 ID 없는 처리 영수증을 유지한다.
- [x] 로컬 대역에서 재인증 취소, 다른 계정·오래된 인증 거절, 명시적 확정, 처리 중 기존 세션 차단과 완료 화면을 확인한다. 로컬 PostgreSQL에서 중복 접수, 작업 실패 후 재시도, 삭제 후 기존 토큰 차단, 재가입 후 미복원을 확인한다.
- [ ] 테스트 프로젝트에서 실제 카카오 재인증과 취소, 두 브라우저의 기존 세션, 창을 닫은 뒤 Cron 완료, 동일 카카오 계정으로 재가입을 확인한다.

### 적용 순서와 확인 항목

1. Supabase에서 세 마이그레이션을 순서대로 적용한다. 먼저 테스트 프로젝트에서 PostgreSQL 역할 권한과 Cron 작업 `newlyweds-account-withdrawals`의 등록 및 자동 실행을 확인한다.
2. Kakao Developers의 **카카오 로그인 → OpenID Connect**를 활성화한다. 기존 로그인과 동일한 REST API 키의 Redirect URI 목록에 `http://localhost:3000/my-page/withdrawal/verify/callback`을 추가한다. 배포 환경에서는 서비스 도메인의 같은 경로도 추가한다.
3. Next.js 서버 환경에 같은 키의 `KAKAO_REAUTH_CLIENT_ID`와 활성화된 `KAKAO_REAUTH_CLIENT_SECRET`, 탈퇴 RPC에 사용할 `SUPABASE_WITHDRAWAL_SECRET_KEY`를 설정한다. 브라우저에 공개되는 환경 변수에는 넣지 않는다.
4. 테스트 카카오 계정으로 가입 후 프로필을 저장하고, 카카오 재인증 취소와 다른 계정 재인증에서 데이터가 유지되는지 확인한다. 탈퇴를 확정한 후에는 다른 브라우저의 기존 세션 접근, 창을 닫은 뒤 Cron 완료, 동일 계정 재가입과 프로필 미복원을 검증한다.

[카카오 재인증과 ID 토큰](https://developers.kakao.com/docs/ko/kakaologin/rest-api) · [Supabase Cron](https://supabase.com/docs/guides/cron)

## 2단계 연계

관심 공고 저장·해제·최신 상태 조회를 2단계에서 마이페이지에 연결한다. 관심 공고에도 본인 접근 정책과 탈퇴 시 삭제를 적용하고, 계정 간 격리와 삭제를 다시 검증한다.
