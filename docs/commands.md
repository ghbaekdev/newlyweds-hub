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

## 마이홈 주택 공고 동기화

`/housing`은 마이홈 공공임대·공공분양 목록을 보여준다. 수집은 화면 요청과 독립적으로 실행한다.

```bash
python3 -m venv .cache/myhome-venv
.cache/myhome-venv/bin/pip install -r scripts/myhome/requirements.txt
MYHOME_PYTHON=.cache/myhome-venv/bin/python node --env-file=.env.local scripts/myhome/sync.mjs
```

- 최근 6개월 조회의 모든 페이지를 수집하고, 이전에 저장한 공고를 유지한다.
- 기본 실행은 신규·재확인 대상 PDF를 최대 10건 처리한다. `MYHOME_PARSE_LIMIT=0`은 목록만 갱신한다. `--notice=rent-21590`처럼 ID를 지정하면 해당 공고를 즉시 재확인한다.
- LH 공고문 PDF를 자동으로 찾는다. 다른 공급기관, PDF 미제공, 추출할 텍스트가 없는 경우에도 목록과 공식 공고 링크를 표시한다.
- 같은 SHA-256의 원본 PDF와 추출 결과는 한 번만 저장하고 이후 재사용한다. 정정공고 링크를 따라가고 실패한 원문 확인은 재시도 대상에 남긴다.
- 배포 작업자는 영속 디스크를 `MYHOME_DATA_DIR`로 설정하고 동일 경로를 사용하는 작업 하나를 크론 등에서 반복 실행한다. 예를 들어 매시간 실행하면 기본 한도 내에서 대기열을 이어 처리한다.
- 운영 DB에 `20261122000100_myhome_catalog.sql`을 적용한 뒤 동기화 명령에 `--publish`를 추가한다. Supabase에는 화면 표시용 목록과 추출 표 일부만 게시된다. PDF 원본과 전체 텍스트는 작업자 디스크에 남는다.
- 강제 종료로 `sync.lock`이 남으면 실행 중인 동기화 작업이 없는 것을 확인한 다음 해당 빈 디렉터리를 제거한다.
