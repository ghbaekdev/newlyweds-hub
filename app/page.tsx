import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold">newlyweds-test</h1>
      <p className="mt-2 text-sm text-zinc-500">신혼부부 공고·혜택 서비스 API 실험장</p>
      <ul className="mt-6 list-disc space-y-1 pl-5">
        <li>
          <Link href="/benefits" className="text-blue-600 underline">
            신혼부부 혜택 찾기 (Supabase 정규화 데이터)
          </Link>
        </li>
        <li>
          <Link href="/benefits/raw" className="text-blue-600 underline">
            보조금24 공공서비스(혜택) API 원본 탐색
          </Link>
        </li>
        <li>
          <Link href="/housing" className="text-blue-600 underline">
            청약홈 · 마이홈 API — 신혼부부 주택 공고
          </Link>
        </li>
      </ul>
    </main>
  );
}
