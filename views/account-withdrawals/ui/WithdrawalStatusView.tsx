import Link from 'next/link';

import WithdrawalStatusRefresh from '@/features/account-withdrawals/ui/WithdrawalStatusRefresh';

const messages = {
  pending: {
    title: '탈퇴 처리 중',
    text: '요청을 접수했어요. 창을 닫아도 삭제가 계속 진행됩니다.',
  },
  completed: {
    title: '회원 탈퇴 완료',
    text: '서비스 계정과 저장한 정보를 삭제했어요.',
  },
  unavailable: {
    title: '탈퇴 상태 확인',
    text: '현재 탈퇴 상태를 확인할 수 없어요. 잠시 후 새로고침해 주세요.',
  },
};

type WithdrawalStatusViewProps = { status: keyof typeof messages };

export default function WithdrawalStatusView({ status }: WithdrawalStatusViewProps) {
  const { title, text } = messages[status];

  return (
    <main className="hub-page">
      <div className="hub-container py-12 sm:py-20">
        <section className="border-hub-line max-w-xl rounded-xl border bg-white p-6 sm:p-8">
          <div role="status">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-hub-muted mt-3 text-sm leading-6">{text}</p>
          </div>
          {status === 'pending' && <WithdrawalStatusRefresh />}
          <Link
            href="/"
            className="text-hub-accent mt-3 inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
          >
            메인으로 이동
          </Link>
        </section>
      </div>
    </main>
  );
}
