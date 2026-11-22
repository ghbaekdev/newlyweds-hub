import regions from '@/data/regions.json';

import BenefitsView from '@/views/benefits/ui/BenefitsView';

import { getBenefits } from '@/entities/benefits/api/getBenefits';

export const metadata = { title: '신혼부부 혜택' };

export default async function Page() {
  const benefits = await getBenefits();
  return <BenefitsView benefits={benefits} regions={regions} />;
}
