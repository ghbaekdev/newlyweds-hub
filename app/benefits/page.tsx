import regions from '@/data/regions.json';

import BenefitsView from '@/views/benefits/ui/BenefitsView';

import { getBenefits } from '@/entities/benefits/api/getBenefits';

import { pageMetadata } from '../_lib/seo';

export const metadata = pageMetadata(
  '/benefits',
  '신혼부부 지원 혜택',
  '신혼부부가 받을 수 있는 정부와 지자체 지원 혜택을 지역별로 찾아보세요.',
);

export default async function Page() {
  const benefits = await getBenefits();
  return <BenefitsView benefits={benefits} regions={regions} />;
}
