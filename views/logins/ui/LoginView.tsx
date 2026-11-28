import Link from 'next/link';

import { AuthIssue } from '@/features/account-sessions/lib/loginPath';
import { accountPath } from '@/features/account-sessions/lib/returnPath';

import Button from '@/shared/ui/Button';

const messages = {
  [AuthIssue.CANCELLED]: '카카오 로그인을 취소했어요. 언제든 다시 시도할 수 있어요.',
  [AuthIssue.LOGIN_FAILED]: '카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.',
  [AuthIssue.SIGN_OUT_FAILED]:
    '서버에서 로그아웃을 확인하지 못했어요. 마이페이지가 열리면 로그아웃을 다시 시도해 주세요.',
};

type LoginViewProps = { next: string; issue?: string | string[] };

export default function LoginView({ next, issue }: LoginViewProps) {
  const message =
    typeof issue === 'string' && Object.hasOwn(messages, issue)
      ? messages[issue as keyof typeof messages]
      : null;

  return (
    <main className="hub-page">
      <div className="hub-container py-12 sm:py-20">
        <section className="border-hub-line mx-auto max-w-md rounded-xl border bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
          <p className="text-hub-muted mt-2 text-sm">카카오 계정으로 가입하거나 로그인하세요.</p>
          {message && (
            <p role="status" className="bg-hub-soft mt-5 rounded-md px-3 py-2 text-sm">
              {message}
            </p>
          )}
          <form method="post" action="/auth/kakao" className="mt-6">
            <input type="hidden" name="next" value={next} />
            <Button
              type="submit"
              className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-md bg-[#fee500] px-4 text-sm font-semibold text-[#191919] hover:bg-[#f1d900]"
            >
              카카오로 계속하기
            </Button>
          </form>
          <Link
            href={next === accountPath ? '/' : next}
            className="text-hub-accent mt-3 inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
          >
            {next === accountPath ? '메인으로 이동' : '둘러보던 화면으로 돌아가기'}
          </Link>
        </section>
      </div>
    </main>
  );
}
