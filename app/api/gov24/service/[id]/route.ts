import { CONDITION_LABELS, Gov24Error, gov24Get } from "@/lib/gov24";

export async function GET(_request: Request, ctx: RouteContext<"/api/gov24/service/[id]">) {
  const { id } = await ctx.params;
  try {
    const cond = { page: 1, perPage: 1, "cond[서비스ID::EQ]": id };
    const [detail, conditions] = await Promise.all([
      gov24Get<Record<string, string>>("serviceDetail", cond),
      gov24Get<Record<string, string | number | null>>("supportConditions", cond),
    ]);

    const raw = conditions.data[0] ?? {};
    const flags = Object.entries(raw)
      .filter(([k, v]) => k in CONDITION_LABELS && v === "Y")
      .map(([k]) => ({ code: k, label: CONDITION_LABELS[k] }));

    return Response.json({
      detail: detail.data[0] ?? null,
      conditions: {
        ageFrom: raw.JA0110 ?? null,
        ageTo: raw.JA0111 ?? null,
        flags,
        raw,
      },
    });
  } catch (e) {
    const status = e instanceof Gov24Error ? e.status : 500;
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status });
  }
}
