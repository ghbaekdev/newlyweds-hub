import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { discoverLhPdf, processPdf } from './sync.mjs';

test('PDF discovery follows the actual correction ID and ignores the static notice banner', () => {
  const html = `
    <span>정정 공고문이 있습니다.</span>
    <script>var currPanId = '0002'; var currPanKdCd = '02';</script>
    <a href="javascript:fileDownLoad('123');">입주자모집공고문.pdf</a>
    <a href="javascript:fileDownLoad('456');">팸플릿.pdf</a>`;
  const url = 'https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancInfo.do?panId=0001';
  assert.deepEqual(discoverLhPdf(url, html), {
    correctionUrl: url.replace('0001', '0002') + '&panKdCd=02',
    cancelled: false,
    pdfUrl: 'https://apply.lh.or.kr/lhapply/lhFile.do?fileid=123',
  });
  assert.equal(discoverLhPdf(url, html.replace("'02'", "'01'")).correctionUrl, null);
});

test('parses identical PDF bytes once and parses a replacement at the same URL', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'myhome-sync-test-'));
  let calls = 0;
  const parse = async () => {
    calls++;
    return { pageCount: 1 };
  };
  try {
    const first = await processPdf(directory, Buffer.from('%PDF-first'), parse);
    const repeated = await processPdf(directory, Buffer.from('%PDF-first'), parse);
    assert.deepEqual(repeated, first);
    assert.equal(calls, 1);
    const replacement = await processPdf(directory, Buffer.from('%PDF-replacement'), parse);
    assert.notEqual(replacement.hash, first.hash);
    assert.equal(calls, 2);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
