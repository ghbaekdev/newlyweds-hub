import { Gov24Error } from "@/lib/gov24";
import { loadHousing } from "@/lib/housing";

export async function GET(request: Request) {
  const refresh = new URL(request.url).searchParams.get("refresh") === "1";
  try {
    return Response.json(await loadHousing(refresh));
  } catch (e) {
    const status = e instanceof Gov24Error ? e.status : 500;
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status });
  }
}
