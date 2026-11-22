import type { MyhomeKind } from './types';

type ApplicationPeriod = {
  group: string;
  opensOn: string;
  closesOn: string;
  opensAt: string;
  closesAt: string;
  sourcePage: number;
};

type IncomeRow = {
  group: string;
  basePercent: number;
  bothSpousesHaveIncome: boolean;
  maximumMonthlyIncomeKrwByHouseholdSize: Partial<Record<string, number>>;
};

type ScoreItem = {
  key: string;
  label: string;
  options: { condition: string; points: number }[];
  notes: string | null;
  sourcePage: number;
};

export type MyhomeNoticeDetail = {
  myhomeId: string;
  slug: string;
  title: string;
  kind: MyhomeKind;
  location: string;
  eligibilityAsOf: string;
  source: { supplierNoticeUrl: string; pdfUrl: string };
  applicationPeriods: ApplicationPeriod[];
  eligibility: { summary: string; sourcePage: number };
  reviewNote?: string;
  supply?: {
    publicSaleUnitsIncludingAdvanceApplicants: number;
    exclusiveAreaSquareMeters: number;
    sourcePage: number;
  };
  selection: {
    rankSourcePage?: number;
    ranks?: { rank: number; criteria: string }[];
    income: {
      sourcePage: number;
      rows: IncomeRow[];
      householdSizeAdjustmentPp?: Record<string, number>;
    };
    scoreItems?: ScoreItem[];
    ordering?: string[];
    stages?: {
      name: string;
      allocationPercent?: number;
      allocation?: string;
      method: string;
      sourcePage: number;
      scoreItems: ScoreItem[];
    }[];
  };
};

export type MyhomeNoticeSummary = Pick<
  MyhomeNoticeDetail,
  'slug' | 'title' | 'kind' | 'location' | 'reviewNote'
> & {
  applicationPeriods?: ApplicationPeriod[];
  catalogPeriod?: { startsOn: string | null; endsOn: string | null };
  statusLabel?: string;
};
