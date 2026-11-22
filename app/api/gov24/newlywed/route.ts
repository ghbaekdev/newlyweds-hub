import { loadAllServices } from '@/entities/gov24-services/api/loadAllServices';
import { toNewlywedServicesResult } from '@/entities/gov24-services/lib/toNewlywedServicesResult';

import { toErrorResponse } from '@/shared/lib/api/errorResponse';

export async function GET(request: Request) {
  const refresh = new URL(request.url).searchParams.get('refresh') === '1';
  try {
    return Response.json(toNewlywedServicesResult(await loadAllServices(refresh)));
  } catch (e) {
    return toErrorResponse(e);
  }
}
