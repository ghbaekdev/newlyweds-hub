/** 원 단위 금액을 '1.5억원' / '300만원'처럼 줄여 쓴다 */
export function formatWon(n: number): string {
  return n >= 100_000_000
    ? `${(n / 100_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}억원`
    : `${Math.round(n / 10_000).toLocaleString()}만원`;
}
