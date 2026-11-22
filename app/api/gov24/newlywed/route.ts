import { findNewlywedHits, Gov24Error, loadAllServices, NEWLYWED_KEYWORDS } from "@/lib/gov24";

export async function GET(request: Request) {
  const refresh = new URL(request.url).searchParams.get("refresh") === "1";
  try {
    const snap = await loadAllServices(refresh);

    const items = snap.services
      .map((s) => ({ service: s, hits: findNewlywedHits(s) }))
      .filter((x) => x.hits.length > 0)
      .map(({ service: s, hits }) => ({
        id: s.서비스ID,
        name: s.서비스명 ?? "",
        org: s.소관기관명 ?? "",
        orgType: s.소관기관유형 ?? "",
        field: s.서비스분야 ?? "",
        supportType: s.지원유형 ?? "",
        target: s.지원대상 ?? "",
        content: s.지원내용 ?? "",
        deadline: s.신청기한 ?? "",
        url: s.상세조회URL ?? "",
        views: s.조회수 ?? 0,
        keywords: [...new Set(hits.map((h) => h.keyword))],
        hits,
      }))
      .sort((a, b) => b.views - a.views);

    const count = (key: (i: (typeof items)[number]) => string[]) => {
      const m: Record<string, number> = {};
      for (const i of items) for (const k of key(i)) m[k] = (m[k] ?? 0) + 1;
      return Object.entries(m).sort((a, b) => b[1] - a[1]);
    };

    return Response.json({
      fetchedAt: snap.fetchedAt,
      totalCount: snap.totalCount,
      loadedCount: snap.services.length,
      matchedCount: items.length,
      keywords: NEWLYWED_KEYWORDS.map((k) => k.label),
      stats: {
        byKeyword: count((i) => i.keywords),
        byField: count((i) => [...new Set(i.hits.map((h) => h.field))]),
        byOrgType: count((i) => [i.orgType || "(없음)"]),
        byServiceField: count((i) => [i.field || "(없음)"]),
      },
      items,
    });
  } catch (e) {
    const status = e instanceof Gov24Error ? e.status : 500;
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status });
  }
}
