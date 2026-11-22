import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rmdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MYHOME = 'https://apis.data.go.kr/1613000/HWSPR02/';
const LH = 'https://apply.lh.or.kr';
const MAX_PDF_BYTES = 32 * 1024 * 1024;
const DAY = 86_400_000;
const notices = [
  { endpoint: 'rsdtRcritNtcList', kind: '임대', prefix: 'rent' },
  { endpoint: 'ltRsdtRcritNtcList', kind: '분양', prefix: 'sale' },
];

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return fallback;
  }
}

async function writeAtomic(file, data) {
  const temp = `${file}.${randomUUID()}.tmp`;
  await writeFile(temp, data, { mode: 0o600 });
  await rename(temp, file);
}

export function discoverLhPdf(publicUrl, html) {
  const url = new URL(publicUrl);
  const currentId = html.match(/\bvar currPanId\s*=\s*['"](\d+)['"]/)?.[1];
  const currentKind = html.match(/\bvar currPanKdCd\s*=\s*['"](\d+)['"]/)?.[1];
  const needsCorrection =
    currentId && currentId !== url.searchParams.get('panId') && currentKind === '02';
  const correction = new URL(url);
  if (needsCorrection) {
    correction.searchParams.set('panId', currentId);
    correction.searchParams.set('panKdCd', currentKind);
  }
  const files = [
    ...html.matchAll(
      /<a\b[^>]*href=["']javascript:fileDownLoad\(['"](\d+)['"]\);?["'][^>]*>([^<]+\.pdf)\s*<\/a>/gi,
    ),
  ];
  const official = files.filter(([, , name]) => /(?:모집\s*공고|공고문)/.test(name));
  const corrected = official.filter(([, , name]) => /(?:정정|수정)/.test(name));
  const candidates = corrected.length ? corrected : official;
  return {
    correctionUrl: needsCorrection ? correction.href : null,
    cancelled: currentKind === '03',
    pdfUrl: candidates.length === 1 ? `${LH}/lhapply/lhFile.do?fileid=${candidates[0][1]}` : null,
  };
}

export async function processPdf(directory, bytes, parse) {
  if (bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Attachment is not a PDF');
  const hash = createHash('sha256').update(bytes).digest('hex');
  const documentDir = path.join(directory, 'pdfs', hash);
  const original = path.join(documentDir, 'original.pdf');
  const extracted = path.join(documentDir, 'extracted.json');
  await mkdir(documentDir, { recursive: true });
  const saved = await readJson(extracted, null);
  if (saved) return { hash, result: saved };

  await writeAtomic(original, bytes);
  const result = await parse(original);
  await writeAtomic(extracted, JSON.stringify(result));
  return { hash, result };
}

async function fetchMyhome(kind, startMonth, endMonth, key) {
  const grouped = new Map();
  const pageSize = 100;
  for (let page = 1; ; page++) {
    const url = new URL(kind.endpoint, MYHOME);
    url.search = new URLSearchParams({
      serviceKey: key,
      yearMtBegin: startMonth,
      yearMtEnd: endMonth,
      pageNo: String(page),
      numOfRows: String(pageSize),
    }).toString();

    let response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    } catch {
      throw new Error(`마이홈 ${kind.endpoint} 요청 실패 (페이지 ${page})`);
    }
    if (!response.ok) throw new Error(`마이홈 ${kind.endpoint} HTTP ${response.status}`);
    const { response: result } = await response.json();
    const code = String(result?.header?.resultCode);
    const body = result?.body;
    if (!['0', '00', '0000'].includes(code) || !body || !Number.isFinite(Number(body.totalCount))) {
      throw new Error(`마이홈 ${kind.endpoint} 응답 오류 (코드 ${code})`);
    }
    const rows = body.item ? [body.item].flat() : [];
    for (const row of rows) {
      const id = String(row.pblancId ?? '');
      if (!/^\d+$/.test(id)) throw new Error('마이홈 공고 식별자가 누락됐습니다.');
      const slug = `${kind.prefix}-${id}`;
      const region = [row.brtcNm, row.signguNm].filter(Boolean).join(' ').trim();
      const existing = grouped.get(slug);
      if (existing) {
        if (region && !existing.regions.includes(region)) existing.regions.push(region);
        continue;
      }
      grouped.set(slug, {
        slug,
        kind: kind.kind,
        title: row.pblancNm,
        supplier: row.suplyInsttNm ?? '',
        supplyType: row.suplyTyNm ?? '',
        noticeStatus: row.sttusNm ?? '',
        regions: region ? [region] : [],
        announceDate: isoDate(row.rcritPblancDe),
        startsOn: isoDate(row.beginDe),
        endsOn: isoDate(row.endDe),
        officialUrl: validPublicUrl(row.url || row.pcUrl) ?? validPublicUrl(row.pcUrl),
      });
    }
    if (page * pageSize >= Number(body.totalCount)) return [...grouped.values()];
    if (!rows.length) throw new Error(`마이홈 ${kind.endpoint} 페이지 ${page}가 비어 있습니다.`);
  }
}

function validPublicUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function isoDate(value) {
  const compact = String(value ?? '').replace(/[-.]/g, '');
  return /^\d{8}$/.test(compact)
    ? `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6)}`
    : null;
}

async function loadLh(url) {
  for (let hop = 0; hop < 4; hop++) {
    const address = new URL(url);
    if (address.origin !== LH || address.username || address.password)
      throw new Error('LH 주소가 허용된 출처가 아닙니다.');
    const res = await fetch(address, { signal: AbortSignal.timeout(25_000), redirect: 'manual' });
    if (![301, 302, 303, 307, 308].includes(res.status)) {
      if (!res.ok) throw new Error(`LH HTTP ${res.status}`);
      return res;
    }
    const location = res.headers.get('location');
    if (!location) throw new Error('LH 리디렉션 주소 없음');
    url = new URL(location, address).href;
    await res.body?.cancel();
  }
  throw new Error('LH 리디렉션 횟수 초과');
}

async function readPdf(response) {
  const max = MAX_PDF_BYTES;
  if (Number(response.headers.get('content-length')) > max) throw new Error('PDF 용량 한도 초과');
  const chunks = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > max) throw new Error('PDF 용량 한도 초과');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, total);
}

function runParser(filename) {
  return new Promise((resolve, reject) => {
    const parser = fileURLToPath(new URL('./parse-pdf.py', import.meta.url));
    const child = spawn(process.env.MYHOME_PYTHON || 'python3', [parser, filename], {
      signal: AbortSignal.timeout(180_000),
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const chunks = [];
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code !== 0) {
        reject(new Error('PDF 파싱 실패. Python과 pdfplumber 설치를 확인하세요.'));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function syncDocument(notice, directory) {
  if (!notice.officialUrl || new URL(notice.officialUrl).hostname !== 'apply.lh.or.kr') {
    return { pdfStatus: 'manual', pdfUrl: null, pdfHash: null, extracted: null };
  }

  let officialUrl = notice.officialUrl.replace(/^http:/, 'https:');
  let attachment = discoverLhPdf(officialUrl, await (await loadLh(officialUrl)).text());
  const seen = new Set([officialUrl]);
  while (attachment.correctionUrl && !attachment.cancelled) {
    if (seen.has(attachment.correctionUrl) || seen.size >= 5)
      return { pdfStatus: 'correction_pending', pdfUrl: null, pdfHash: null, extracted: null };
    officialUrl = attachment.correctionUrl;
    seen.add(officialUrl);
    attachment = discoverLhPdf(officialUrl, await (await loadLh(officialUrl)).text());
  }
  const pdfUrl = attachment.pdfUrl;
  if (!pdfUrl || attachment.cancelled) {
    const pdfStatus = attachment.cancelled
      ? 'cancelled'
      : seen.size > 1
        ? 'correction_pending'
        : 'unavailable';
    return { pdfStatus, pdfUrl, pdfHash: null, extracted: null, resolvedOfficialUrl: officialUrl };
  }
  const { hash, result } = await processPdf(
    directory,
    await readPdf(await loadLh(pdfUrl)),
    runParser,
  );
  return {
    pdfStatus: result.textPages ? 'parsed' : 'no_text',
    pdfUrl,
    pdfHash: hash,
    extracted: result.sections,
    resolvedOfficialUrl: officialUrl,
  };
}

function shouldCheck(notice, today, now) {
  if (!notice.checkedAt) return true;
  if (['manual', 'cancelled'].includes(notice.pdfStatus)) return false;
  if (notice.pdfStatus === 'failed')
    return now.getTime() - Date.parse(notice.checkedAt) >= 3_600_000;
  if (notice.endsOn && notice.endsOn < today && notice.pdfStatus !== 'correction_pending')
    return false;
  return now.getTime() - Date.parse(notice.checkedAt) >= DAY;
}

async function sync(directory, parseLimit, publish, selected) {
  const configured = process.env.DATA_GO_KR_SERVICE_KEY?.trim();
  if (!configured) throw new Error('DATA_GO_KR_SERVICE_KEY가 필요합니다.');
  const key = decodeURIComponent(configured);
  const now = new Date();
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(now);
  const [year, month] = today.split('-').map(Number);
  const startMonth = new Date(Date.UTC(year, month - 6, 1))
    .toISOString()
    .slice(0, 7)
    .replace('-', '');
  const endMonth = today.slice(0, 7).replace('-', '');
  const catalogPath = path.join(directory, 'catalog.json');
  const previous = await readJson(catalogPath, { notices: [] });
  const fetched = (
    await Promise.all(notices.map((kind) => fetchMyhome(kind, startMonth, endMonth, key)))
  ).flat();
  const catalog = new Map(previous.notices.map((notice) => [notice.slug, notice]));
  for (const item of fetched) {
    const old = catalog.get(item.slug);
    const sameSource =
      old?.officialUrl === item.officialUrl && old?.noticeStatus === item.noticeStatus;
    catalog.set(item.slug, { ...(sameSource ? old : { pdfStatus: 'pending' }), ...item });
  }
  const ordered = [...catalog.values()].sort(
    (a, b) =>
      (b.announceDate ?? '').localeCompare(a.announceDate ?? '') || a.slug.localeCompare(b.slug),
  );
  const candidates = fetched
    .map(({ slug }) => catalog.get(slug))
    .filter((notice) =>
      selected.length ? selected.includes(notice.slug) : shouldCheck(notice, today, now),
    )
    .sort(
      (a, b) =>
        Number(Boolean(a.checkedAt)) - Number(Boolean(b.checkedAt)) ||
        (a.checkedAt ?? '').localeCompare(b.checkedAt ?? ''),
    );
  const missing = selected.filter((slug) => !candidates.some((notice) => notice.slug === slug));
  if (missing.length)
    throw new Error(`마이홈 응답에서 공고를 찾을 수 없습니다: ${missing.join(', ')}`);
  const checkedAt = now.toISOString();

  for (const notice of candidates.slice(0, parseLimit)) {
    try {
      Object.assign(notice, await syncDocument(notice, directory), { checkedAt });
    } catch (error) {
      Object.assign(notice, { pdfStatus: 'failed', checkedAt, extracted: null });
      console.warn(`${notice.slug}: ${error.message}`);
    }
  }
  const snapshot = { fetchedAt: checkedAt, notices: ordered };
  await writeAtomic(catalogPath, JSON.stringify(snapshot));
  if (publish) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) throw new Error('Supabase URL과 적재용 키가 필요합니다.');
    const client = createClient(url, secret, { auth: { persistSession: false } });
    const { error } = await client.from('myhome_catalog').upsert({ id: 1, snapshot });
    if (error) throw new Error(`Supabase 게시 실패: ${error.message}`);
  }
  console.log(
    `마이홈 ${fetched.length}건 조회 · 저장 ${ordered.length}건 · 원문 확인 ${Math.min(candidates.length, parseLimit)}건`,
  );
}

async function main() {
  const directory = path.resolve(process.env.MYHOME_DATA_DIR || '.cache/myhome');
  const limit = Number(process.env.MYHOME_PARSE_LIMIT ?? '10');
  if (!Number.isSafeInteger(limit) || limit < 0)
    throw new Error('MYHOME_PARSE_LIMIT는 0 이상의 정수여야 합니다.');
  const lock = path.join(directory, 'sync.lock');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  try {
    await mkdir(lock);
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error('마이홈 동기화가 실행 중입니다. 중단된 작업이라면 sync.lock을 확인하세요.');
    throw error;
  }
  try {
    const selected = process.argv
      .slice(2)
      .filter((argument) => argument.startsWith('--notice='))
      .map((argument) => argument.slice('--notice='.length));
    await sync(directory, limit, process.argv.includes('--publish'), selected);
  } finally {
    await rmdir(lock);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
