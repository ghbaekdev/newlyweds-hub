import SaveAccountProfileForm from '@/features/account-profiles/ui/SaveAccountProfileForm';
import HouseholdProfileForm from '@/features/household-profiles/ui/HouseholdProfileForm';

import type { HouseholdProfile } from '@/entities/household-profiles/model/types';

import Button from '@/shared/ui/Button';

type MyPageViewProps = {
  displayName: string | null | undefined;
  household: HouseholdProfile | null | undefined;
};

export default function MyPageView({ displayName, household }: MyPageViewProps) {
  return (
    <main className="hub-page">
      <div className="hub-container max-w-4xl py-12 sm:py-20">
        <h1 className="text-2xl font-bold tracking-tight">마이페이지</h1>
        <section className="border-hub-line mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">내 정보</h2>
          <dl className="mt-3 flex gap-4 text-sm">
            <dt className="text-hub-muted">연결된 로그인 수단</dt>
            <dd className="font-semibold">카카오</dd>
          </dl>
          <div className="mt-5">
            {displayName === undefined ? (
              <p role="status" className="text-hub-muted text-sm">
                표시 이름을 불러오지 못했어요. 새로고침해 주세요.
              </p>
            ) : (
              <SaveAccountProfileForm displayName={displayName} />
            )}
          </div>
        </section>
        <section className="border-hub-line mt-4 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">가구 조건</h2>
          <div className="mt-4">
            {household === undefined ? (
              <p role="status" className="text-hub-muted text-sm">
                가구 조건을 불러오지 못했어요. 새로고침해 주세요.
              </p>
            ) : (
              <HouseholdProfileForm profile={household} />
            )}
          </div>
        </section>
        <section className="border-hub-line mt-4 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">계정 관리</h2>
          <form method="post" action="/auth/sign-out" className="mt-4">
            <Button
              type="submit"
              className="border-hub-line hover:bg-hub-soft min-h-11 cursor-pointer rounded-md border px-4 text-sm font-semibold"
            >
              로그아웃
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
