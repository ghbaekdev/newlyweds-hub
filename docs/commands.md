# Commands

## 환경 설정

`.env.example`을 `.env.local`로 복사해 채운다.

| 변수                                                               | 용도                                           |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| `DATA_GO_KR_SERVICE_KEY`                                           | 공공데이터포털 인증키 (보조금24·청약홈·마이홈) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 혜택 조회                                      |
| `SUPABASE_SECRET_KEY`                                              | 적재 스크립트 전용                             |

## 개발 / 빌드

```bash
pnpm dev
pnpm build
pnpm start
```

## 코드 품질

```bash
pnpm lint          # ESLint
pnpm lint:fix      # 린트 자동 수정
pnpm format        # Prettier 포맷팅 + import 정렬
pnpm format:check  # 포맷팅 검사
```

## 데이터 적재

```bash
node --env-file=.env.local scripts/load-benefits.mjs
```

외부 API 응답 캐시는 `.cache/`에 쌓인다. 화면의 "API에서 새로 받기" 버튼이나 `?refresh=1`로 갱신한다.
