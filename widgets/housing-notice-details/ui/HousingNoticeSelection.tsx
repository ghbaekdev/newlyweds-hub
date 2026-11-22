import type { MyhomeNoticeDetail } from '@/entities/housing-notices/model/myhomeNoticeDetails';

type Props = { notice: MyhomeNoticeDetail };
type ScoreItems = NonNullable<MyhomeNoticeDetail['selection']['scoreItems']>;

function ScoreItems({ items }: { items: ScoreItems }) {
  return (
    <ul className="divide-y divide-[#d8e0d6]">
      {items.map((item) => (
        <li key={item.key} className="py-3">
          <p className="text-sm font-semibold">{item.label}</p>
          <ul className="mt-1 space-y-1 text-sm text-[#425d51]">
            {item.options.map(({ condition, points }) => (
              <li key={condition} className="flex justify-between gap-4">
                <span>{condition}</span>
                <span className="shrink-0 font-semibold tabular-nums">{points}점</span>
              </li>
            ))}
          </ul>
          {item.notes && <p className="mt-2 text-xs leading-5 text-[#425d51]">{item.notes}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function HousingNoticeSelection({ notice }: Props) {
  const { selection, source } = notice;
  const { income, ranks, scoreItems, ordering, stages, rankSourcePage } = selection;
  const sizes = Object.keys(income.rows[0].maximumMonthlyIncomeKrwByHouseholdSize).sort(
    (left, right) => Number(left.replace('<=', '')) - Number(right.replace('<=', '')),
  );

  return (
    <>
      <section className="border-t border-[#cdd8ce] pt-6" aria-labelledby="income">
        <h2 id="income" className="text-2xl font-bold tracking-tight">
          월평균 소득 상한
        </h2>
        <div
          className="mt-4 overflow-x-auto rounded-lg border border-[#cdd8ce] bg-white"
          tabIndex={0}
          role="region"
          aria-label="가구원 수별 소득 상한 표"
        >
          <table className="w-full min-w-[43rem] text-left text-sm">
            <caption className="sr-only">가구원 수별 월평균 소득 상한, 원 단위</caption>
            <thead className="bg-[#e6ece4]">
              <tr>
                <th scope="col" className="px-3 py-3">
                  공급 구분·기준
                </th>
                {sizes.map((size) => (
                  <th key={size} scope="col" className="px-3 py-3 text-right whitespace-nowrap">
                    {size.startsWith('<=') ? `${size.slice(2)}인 이하` : `${size}인`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8e0d6]">
              {income.rows.map((row) => (
                <tr key={`${row.group}-${row.basePercent}`}>
                  <th scope="row" className="px-3 py-2 font-medium">
                    {row.group} {row.basePercent}%
                    {row.bothSpousesHaveIncome && (
                      <span className="block text-xs text-[#425d51]">부부 모두 소득 있음</span>
                    )}
                  </th>
                  {sizes.map((size) => (
                    <td key={size} className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                      {row.maximumMonthlyIncomeKrwByHouseholdSize[size]?.toLocaleString('ko-KR')}원
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {income.householdSizeAdjustmentPp && (
          <p className="mt-2 text-xs leading-5 text-[#425d51]">
            1인 가구 {income.householdSizeAdjustmentPp['1']}%p, 2인 가구{' '}
            {income.householdSizeAdjustmentPp['2']}%p 가산이 이미 반영된 금액입니다.
          </p>
        )}
        <p className="mt-2 text-xs leading-5 text-[#425d51]">
          완화 기준과 검증 예외는 모집공고 PDF를 확인하세요.
        </p>
        <a
          href={`${source.pdfUrl}#page=${income.sourcePage}`}
          className="mt-2 inline-block text-sm text-[#37574b] underline underline-offset-4"
        >
          소득 기준 근거 · 원문 {income.sourcePage}쪽
        </a>
      </section>
      <section className="border-t border-[#cdd8ce] pt-6" aria-labelledby="selection">
        <h2 id="selection" className="text-2xl font-bold tracking-tight">
          순위·배점
        </h2>
        {ranks && (
          <ol className="mt-3 divide-y divide-[#d8e0d6]">
            {ranks.map(({ rank, criteria }) => (
              <li
                key={rank}
                className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 py-3 text-sm leading-6"
              >
                <span className="font-bold">{rank}순위</span>
                <span className="text-[#425d51]">{criteria}</span>
              </li>
            ))}
          </ol>
        )}
        {rankSourcePage && (
          <a
            href={`${source.pdfUrl}#page=${rankSourcePage}`}
            className="text-sm text-[#37574b] underline underline-offset-4"
          >
            입주 순위 근거 · 원문 {rankSourcePage}쪽
          </a>
        )}
        {scoreItems && (
          <details className="mt-4 rounded-lg border border-[#cdd8ce] bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold">동순위 배점 보기</summary>
            {ordering && <p className="mt-3 text-sm text-[#425d51]">{ordering.join(' → ')}</p>}
            <ScoreItems items={scoreItems} />
            <a
              href={`${source.pdfUrl}#page=${scoreItems[0].sourcePage}`}
              className="text-sm text-[#37574b] underline underline-offset-4"
            >
              배점 근거 · 원문 {scoreItems[0].sourcePage}쪽
            </a>
          </details>
        )}
        {stages && (
          <ol className="mt-3 divide-y divide-[#d8e0d6]">
            {stages.map((stage) => (
              <li key={stage.name} className="py-4 text-sm">
                <h3 className="font-bold">
                  {stage.name} ·{' '}
                  {stage.allocationPercent != null
                    ? `${stage.allocationPercent}%`
                    : stage.allocation}
                </h3>
                <p className="mt-1 text-[#425d51]">{stage.method}</p>
                <a
                  href={`${source.pdfUrl}#page=${stage.sourcePage}`}
                  className="mt-2 inline-block text-[#37574b] underline underline-offset-4"
                >
                  선정 기준 · 원문 {stage.sourcePage}쪽
                </a>
                {stage.scoreItems.length > 0 && (
                  <details className="mt-3 rounded-lg border border-[#cdd8ce] bg-white px-4 py-3">
                    <summary className="cursor-pointer font-semibold">
                      {stage.name} 배점 보기
                    </summary>
                    <ScoreItems items={stage.scoreItems} />
                    <a
                      href={`${source.pdfUrl}#page=${stage.scoreItems[0].sourcePage}`}
                      className="text-[#37574b] underline underline-offset-4"
                    >
                      배점 근거 · 원문 {stage.scoreItems[0].sourcePage}쪽
                    </a>
                  </details>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
