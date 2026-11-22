import { getServiceDetail } from '@/entities/gov24-services/api/getServiceDetail';

import { toErrorResponse } from '@/shared/lib/api/errorResponse';

export async function GET(_request: Request, ctx: RouteContext<'/api/gov24/service/[id]'>) {
  const { id } = await ctx.params;
  try {
    return Response.json(await getServiceDetail(id));
  } catch (e) {
    return toErrorResponse(e);
  }
}
