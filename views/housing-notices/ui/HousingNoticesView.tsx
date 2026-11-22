import HousingNoticeList from '@/features/housing-filters/ui/HousingNoticeList';

import type { MyhomeNoticeSummary } from '@/entities/housing-notices/model/myhomeNoticeDetails';

type Props = { notices: MyhomeNoticeSummary[]; fetchedAt?: string };

export default function HousingNoticesView({ notices, fetchedAt }: Props) {
  return (
    <main className="hub-page">
      <div className="hub-container pt-8 pb-14 sm:pt-10">
        <header className="mb-5 sm:mb-7">
          <h1 className="text-4xl font-bold tracking-[-0.055em] sm:text-5xl">마이홈 주택 공고</h1>
          <p className="text-hub-muted mt-2">
            공공임대와 공공분양의 접수 일정 및 공급기관 원문을 확인하세요.
          </p>
          {fetchedAt && (
            <p className="text-hub-muted mt-2 text-sm">
              수집 일자{' '}
              {new Intl.DateTimeFormat('ko-KR', {
                dateStyle: 'medium',
                timeZone: 'Asia/Seoul',
              }).format(new Date(fetchedAt))}
            </p>
          )}
        </header>
        <HousingNoticeList notices={notices} />
      </div>
    </main>
  );
}
