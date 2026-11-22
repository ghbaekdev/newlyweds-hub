import { loadHousing } from '@/entities/housing-notices/api/loadHousing';

import { toErrorResponse } from '@/shared/lib/api/errorResponse';

export async function GET(request: Request) {
  const refresh = new URL(request.url).searchParams.get('refresh') === '1';
  try {
    return Response.json(await loadHousing(refresh));
  } catch (e) {
    return toErrorResponse(e);
  }
}
