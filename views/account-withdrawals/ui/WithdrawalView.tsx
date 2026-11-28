import Link from 'next/link';

import {
  WithdrawalIssue,
  withdrawalPath,
} from '@/features/account-withdrawals/lib/withdrawalPaths';

import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';

const messages = {
  [WithdrawalIssue.CANCELLED]: '카카오 본인 확인을 취소했어요.',
  [WithdrawalIssue.VERIFICATION_FAILED]:
    '카카오 본인 확인에 실패했어요. 잠시 후 다시 시도해 주세요.',
  [WithdrawalIssue.ACCOUNT_MISMATCH]: '현재 서비스에 로그인한 카카오 계정으로 다시 확인해 주세요.',
  [WithdrawalIssue.EXPIRED]: '본인 확인 시간이 지났어요. 카카오에서 다시 확인해 주세요.',
  [WithdrawalIssue.REQUEST_FAILED]: '탈퇴 요청을 확인하지 못했어요. 다시 시도해 주세요.',
};

type WithdrawalViewProps = { available: boolean; verified: boolean; issue?: string };

export default function WithdrawalView({ available, verified, issue }: WithdrawalViewProps) {
  const message =
    issue && Object.hasOwn(messages, issue) ? messages[issue as keyof typeof messages] : null;

  return (
    <main className="hub-page">
      <div className="hub-container py-12 sm:py-20">
        <Card
          as="section"
          className="border-hub-line max-w-xl rounded-xl border bg-white p-6 sm:p-8"
        >
          <h1 className="text-2xl font-bold tracking-tight">회원 탈퇴</h1>
          <p className="text-hub-muted mt-3 text-sm leading-6">
            탈퇴하면 서비스 계정, 표시 이름, 가구 프로필이 삭제되고 모든 기기에서 서비스 이용이
            종료돼요. 삭제한 정보는 복구할 수 없어요. 카카오 계정은 계속 이용할 수 있어요.
          </p>
          {message && (
            <p role="status" className="bg-hub-soft mt-4 rounded-md px-3 py-2 text-sm">
              {message}
            </p>
          )}
          {!available && (
            <p role="status" className="bg-hub-soft mt-4 rounded-md px-3 py-2 text-sm">
              현재 회원 탈퇴를 요청할 수 없어요. 잠시 후 다시 확인해 주세요.
            </p>
          )}
          {available && verified && (
            <form method="post" action={`${withdrawalPath}/confirm`} className="mt-6 space-y-3">
              <p className="text-sm font-semibold">카카오 계정 확인을 마쳤어요.</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  name="intent"
                  value="confirm"
                  className="min-h-11 cursor-pointer rounded-md bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800"
                >
                  회원 탈퇴 확정
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="cancel"
                  className="border-hub-line hover:bg-hub-soft min-h-11 cursor-pointer rounded-md border px-4 text-sm font-semibold"
                >
                  취소
                </Button>
              </div>
            </form>
          )}
          {available && !verified && (
            <form method="post" action={`${withdrawalPath}/verify`} className="mt-6">
              <Button
                type="submit"
                variant="primary"
                className="min-h-11 cursor-pointer rounded-md px-4 text-sm font-semibold"
              >
                카카오 계정 확인
              </Button>
            </form>
          )}
          {!verified && (
            <Link
              href="/my-page"
              className="text-hub-accent mt-3 inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
            >
              마이페이지로 돌아가기
            </Link>
          )}
        </Card>
      </div>
    </main>
  );
}
