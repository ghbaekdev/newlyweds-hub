import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * 행정안전부 대한민국 공공서비스(혜택) 정보 (보조금24)
 * https://www.data.go.kr/data/15113968/openapi.do
 */
const BASE_URL = "https://api.odcloud.kr/api/gov24/v3";
const PER_PAGE = 1000;
const CONCURRENCY = 4;
const CACHE_FILE = path.join(process.cwd(), ".cache", "gov24-services.json");

export type Gov24Service = {
  서비스ID: string;
  지원유형?: string;
  서비스명?: string;
  서비스목적요약?: string;
  지원대상?: string;
  선정기준?: string;
  지원내용?: string;
  신청방법?: string;
  신청기한?: string;
  상세조회URL?: string;
  소관기관코드?: string;
  소관기관명?: string;
  부서명?: string;
  조회수?: number;
  소관기관유형?: string;
  사용자구분?: string;
  서비스분야?: string;
  접수기관?: string;
  전화문의?: string;
  등록일시?: string;
  수정일시?: string;
  신청기한유형?: string;
};

type Gov24Page<T> = {
  page: number;
  perPage: number;
  totalCount: number;
  currentCount: number;
  matchCount: number;
  data: T[];
};

export class Gov24Error extends Error {
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
    throw new Gov24Error(
      "DATA_GO_KR_SERVICE_KEY가 없습니다. .env.local에 공공데이터포털 인증키(Decoding)를 넣어 주세요.",
      503,
    );
  }
  // Encoding 키를 넣어도 동작하도록 한 번 풀어 준다 (URLSearchParams가 다시 인코딩함).
  return raw.includes("%") ? decodeURIComponent(raw) : raw;
}

export async function gov24Get<T>(
  endpoint: "serviceList" | "serviceDetail" | "supportConditions",
  params: Record<string, string | number>,
): Promise<Gov24Page<T>> {
  const qs = new URLSearchParams({ serviceKey: serviceKey(), returnType: "JSON" });
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));

  const res = await fetch(`${BASE_URL}/${endpoint}?${qs}`, { cache: "no-store" });
  const body = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    throw new Gov24Error(`gov24 ${endpoint}: JSON이 아닌 응답 (${res.status}) ${body.slice(0, 200)}`, 502);
  }
  const err = json as { code?: number; msg?: string };
  if (!res.ok || (typeof err.code === "number" && err.code < 0)) {
    throw new Gov24Error(`gov24 ${endpoint}: ${err.msg ?? res.statusText} (code ${err.code ?? res.status})`, 502);
  }
  return json as Gov24Page<T>;
}

export type ServiceSnapshot = {
  fetchedAt: string;
  totalCount: number;
  services: Gov24Service[];
};

let memo: ServiceSnapshot | null = null;

/** 전체 서비스 목록(약 1만 건)을 받아 .cache에 저장한다. refresh=false면 캐시를 쓴다. */
export async function loadAllServices(refresh = false): Promise<ServiceSnapshot> {
  if (!refresh) {
    if (memo) return memo;
    try {
      memo = JSON.parse(await readFile(CACHE_FILE, "utf8")) as ServiceSnapshot;
      return memo;
    } catch {
      // 캐시 없음 → 새로 받는다
    }
  }

  const first = await gov24Get<Gov24Service>("serviceList", { page: 1, perPage: PER_PAGE });
  const pages = Math.ceil(first.totalCount / PER_PAGE);
  const services = [...first.data];

  const rest = Array.from({ length: Math.max(0, pages - 1) }, (_, i) => i + 2);
  for (let i = 0; i < rest.length; i += CONCURRENCY) {
    const batch = await Promise.all(
      rest
        .slice(i, i + CONCURRENCY)
        .map((page) => gov24Get<Gov24Service>("serviceList", { page, perPage: PER_PAGE })),
    );
    for (const p of batch) services.push(...p.data);
  }

  memo = { fetchedAt: new Date().toISOString(), totalCount: first.totalCount, services };
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(memo));
  return memo;
}

/* ---------- 신혼부부 관련 판별 (텍스트 키워드) ---------- */

export const NEWLYWED_KEYWORDS: { label: string; pattern: RegExp }[] = [
  { label: "신혼", pattern: /신혼/g },
  { label: "예비부부", pattern: /예비\s?(부부|신랑|신부)/g },
  // '미혼인', '이혼인', '혼인관계증명서'(구비서류) 같은 오탐을 뺀다
  { label: "혼인", pattern: /(?<![미이])혼인(?!관계\s?증명)/g },
  // '결혼이민자'·'결혼이주여성'(다문화)은 별도 라벨로 분리해 노이즈를 눈으로 확인할 수 있게 함
  { label: "결혼", pattern: /결혼(?!\s?이[민주])/g },
  { label: "결혼이민", pattern: /결혼\s?이[민주]/g },
];

export const SEARCH_FIELDS = ["서비스명", "서비스목적요약", "지원대상", "선정기준", "지원내용"] as const;
export type SearchField = (typeof SEARCH_FIELDS)[number];

export type Hit = { field: SearchField; keyword: string; snippet: string };

export function findNewlywedHits(s: Gov24Service): Hit[] {
  const hits: Hit[] = [];
  for (const field of SEARCH_FIELDS) {
    const text = s[field];
    if (!text) continue;
    for (const { label, pattern } of NEWLYWED_KEYWORDS) {
      pattern.lastIndex = 0;
      const m = pattern.exec(text);
      if (!m) continue;
      const start = Math.max(0, m.index - 40);
      const end = Math.min(text.length, m.index + m[0].length + 60);
      hits.push({
        field,
        keyword: label,
        snippet: `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ")}${end < text.length ? "…" : ""}`,
      });
    }
  }
  return hits;
}

/* ---------- 지원조건 코드 ---------- */

export const CONDITION_LABELS: Record<string, string> = {
  JA0101: "남성",
  JA0102: "여성",
  JA0201: "중위소득 0~50%",
  JA0202: "중위소득 51~75%",
  JA0203: "중위소득 76~100%",
  JA0204: "중위소득 101~200%",
  JA0205: "중위소득 200% 초과",
  JA0301: "예비부모/난임",
  JA0302: "임산부",
  JA0303: "출산/입양",
  JA0313: "농업인",
  JA0314: "어업인",
  JA0315: "축산업인",
  JA0316: "임업인",
  JA0317: "초등학생",
  JA0318: "중학생",
  JA0319: "고등학생",
  JA0320: "대학생/대학원생",
  JA0322: "(직업) 해당사항없음",
  JA0326: "근로자/직장인",
  JA0327: "구직자/실업자",
  JA0328: "장애인",
  JA0329: "국가보훈대상자",
  JA0330: "질병/질환자",
  JA0401: "다문화가족",
  JA0402: "북한이탈주민",
  JA0403: "한부모가정/조손가정",
  JA0404: "1인가구",
  JA0410: "(가구) 해당사항없음",
  JA0411: "다자녀가구",
  JA0412: "무주택세대",
  JA0413: "신규전입",
  JA0414: "확대가족",
  JA1101: "예비창업자",
  JA1102: "영업중",
  JA1103: "생계곤란/폐업예정자",
  JA1201: "음식점업",
  JA1202: "제조업",
  JA1299: "기타업종",
  JA2101: "중소기업",
  JA2102: "사회복지시설",
  JA2103: "기관/단체",
  JA2201: "제조업(법인)",
  JA2202: "농업,임업 및 어업(법인)",
  JA2203: "정보통신업(법인)",
  JA2299: "기타업종(법인)",
};
