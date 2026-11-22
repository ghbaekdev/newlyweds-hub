import Link from "next/link";
import regions from "@/data/regions.json";
import { getBenefits } from "@/lib/benefits";
import BenefitsBrowser from "./BenefitsBrowser";

export const metadata = { title: "신혼부부 혜택" };

export default async function Page() {
  const benefits = await getBenefits();
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">신혼부부 혜택 찾기</h1>
        <p className="mt-1 text-sm text-zinc-500">
          보조금24 공공서비스 {benefits.length}건을 정규화해 Supabase에 저장한 데이터입니다. 조건을 입력하면 받을 수 있는 혜택만
          남깁니다.{" "}
          <Link href="/benefits/raw" className="underline">
            원본 API 탐색
          </Link>
        </p>
      </header>
      <BenefitsBrowser benefits={benefits} regions={regions} />
    </div>
  );
}
