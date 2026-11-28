import Link from 'next/link';

import { myhomePdfLabels, MyhomePdfStatus } from '@/entities/housing-notices/model/myhomeCatalog';
import type { MyhomeCatalogItem } from '@/entities/housing-notices/model/myhomeCatalog';
import { MyhomeKind } from '@/entities/housing-notices/model/types';

import Button from '@/shared/ui/Button';
import Collapsible, { CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/Collapsible';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';

type Props = { notice: MyhomeCatalogItem };

export default function HousingNoticeCatalogView({ notice }: Props) {
  const official = notice.resolvedOfficialUrl ?? notice.officialUrl;
  const pdf = notice.pdfStatus === MyhomePdfStatus.PARSED ? notice.pdfUrl : null;

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#173129]">
      <div className="mx-auto max-w-6xl px-5 pt-6 pb-16 sm:px-10 sm:pt-8">
        <header className="border-b border-[#cdd8ce] pb-5">
          <Link href="/housing" className="text-sm font-bold hover:underline">
            <span aria-hidden="true">← </span>공고 목록
          </Link>
        </header>
        <div className="pt-10 pb-8 sm:pt-14">
          <p className="text-sm font-semibold text-[#37574b]">
            {notice.kind === MyhomeKind.RENT ? '공공임대' : '공공분양'}
            {notice.supplier && ` · ${notice.supplier}`}
            {notice.supplyType && ` · ${notice.supplyType}`}
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
            {notice.title}
          </h1>
          <p className="mt-3 text-sm text-[#425d51]">{notice.regions.join(', ')}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            {official && (
              <Button asChild>
                <a
                  href={official}
                  className="hover:bg-housing-button-hover rounded-md bg-[#214838] px-4 py-2.5 text-white"
                >
                  공식 공고 보기 <span aria-hidden="true">↗</span>
                </a>
              </Button>
            )}
            {pdf && (
              <Button asChild>
                <a
                  href={pdf}
                  className="rounded-md border border-[#a7b8ac] px-4 py-2.5 hover:bg-white"
                >
                  모집공고 PDF <span aria-hidden="true">↗</span>
                </a>
              </Button>
            )}
          </div>
        </div>
        <section className="border-t border-[#cdd8ce] py-6" aria-labelledby="catalog-schedule">
          <h2 id="catalog-schedule" className="text-2xl font-bold tracking-tight">
            공고 일정
          </h2>
          <dl className="mt-3 grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-semibold">공고일</dt>
            <dd>{notice.announceDate ?? '미제공'}</dd>
            <dt className="font-semibold">접수 기간</dt>
            <dd>
              {notice.startsOn || notice.endsOn
                ? `${notice.startsOn ?? '미정'} ~ ${notice.endsOn ?? '미정'}`
                : '미제공'}
            </dd>
            <dt className="font-semibold">공고 구분</dt>
            <dd>{notice.noticeStatus || '미제공'}</dd>
          </dl>
          <p className="mt-3 text-sm text-[#425d51]">
            마이홈 제공 일정입니다. 신청 대상별 일정은 공식 공고에서 확인하세요.
          </p>
        </section>
        <section className="border-t border-[#cdd8ce] pt-6" aria-labelledby="catalog-document">
          <h2 id="catalog-document" className="text-2xl font-bold tracking-tight">
            공고문 확인
          </h2>
          <p className="mt-2 text-sm font-semibold text-[#425d51]">
            {myhomePdfLabels[notice.pdfStatus]}
          </p>
          {pdf &&
            notice.extracted?.map((section, index) => (
              <Collapsible
                key={`${section.sourcePage}-${index}`}
                className="mt-4 rounded-lg border border-[#cdd8ce] bg-white p-4"
              >
                <CollapsibleTrigger className="cursor-pointer font-semibold before:mr-1 before:inline-block before:content-[\'▸\'] data-[state=open]:before:rotate-90">
                  {section.label} · 원문 {section.sourcePage}쪽
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="mt-2 text-sm text-[#425d51]">
                    PDF에서 자동 추출한 표입니다. 신청 전 원문을 확인하세요.
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <Table className="w-full min-w-[32rem] text-left text-sm">
                      <TableHeader className="bg-[#e6ece4]">
                        <TableRow>
                          {section.headers.map((header, column) => (
                            <TableHead key={column} scope="col" className="p-2">
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-[#d8e0d6]">
                        {section.rows.map((row, rowNumber) => (
                          <TableRow key={rowNumber}>
                            {row.map((cell, column) => (
                              <TableCell key={column} className="p-2 align-top">
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <a
                    href={`${pdf}#page=${section.sourcePage}`}
                    className="mt-3 inline-block text-sm underline"
                  >
                    PDF 원문 {section.sourcePage}쪽
                  </a>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </section>
      </div>
    </main>
  );
}
