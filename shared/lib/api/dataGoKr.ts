import 'server-only';

/** 공공데이터포털(data.go.kr) 계열 API 호출 실패. status는 route 응답 코드로 쓴다 */
export class DataGoKrError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

export function serviceKey(): string {
  const raw = process.env.DATA_GO_KR_SERVICE_KEY?.trim();
  if (!raw) {
    throw new DataGoKrError(
      'DATA_GO_KR_SERVICE_KEY가 없습니다. .env.local에 공공데이터포털 인증키(Decoding)를 넣어 주세요.',
      503,
    );
  }
  // Encoding 키를 넣어도 동작하도록 한 번 풀어 준다 (URLSearchParams가 다시 인코딩함).
  return raw.includes('%') ? decodeURIComponent(raw) : raw;
}
