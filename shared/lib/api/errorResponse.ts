import { DataGoKrError } from './dataGoKr';

/** route handler의 catch에서 쓴다: `{ error }` JSON + 알맞은 상태 코드 */
export function toErrorResponse(e: unknown): Response {
  const status = e instanceof DataGoKrError ? e.status : 500;
  return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status });
}
