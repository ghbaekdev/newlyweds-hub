export const BenefitLevel = {
  NATIONAL: 'national',
  SIDO: 'sido',
  SIGUNGU: 'sigungu',
  OTHER: 'other',
} as const;
export type BenefitLevel = (typeof BenefitLevel)[keyof typeof BenefitLevel];

/** core: 신혼 전용 · includes: 신혼을 포함하는 일반 사업 · incidental: 신혼이 부수적으로 언급됨 */
export const BenefitRelevance = {
  CORE: 'core',
  INCLUDES: 'includes',
  INCIDENTAL: 'incidental',
} as const;
export type BenefitRelevance = (typeof BenefitRelevance)[keyof typeof BenefitRelevance];

export const BenefitCategory = {
  HOUSING_LOAN: 'housing_loan',
  HOUSING_RENT: 'housing_rent',
  HOUSING_PURCHASE: 'housing_purchase',
  HOUSING_SUPPLY: 'housing_supply',
  MARRIAGE_GRANT: 'marriage_grant',
  WEDDING: 'wedding',
  HEALTH_CHECKUP: 'health_checkup',
  FERTILITY: 'fertility',
  CHILDBIRTH_PARENTING: 'childbirth_parenting',
  TAX: 'tax',
  OTHER: 'other',
} as const;
export type BenefitCategory = (typeof BenefitCategory)[keyof typeof BenefitCategory];

export const BenefitCategoryLabel: Record<BenefitCategory, string> = {
  [BenefitCategory.HOUSING_LOAN]: '주택 대출이자',
  [BenefitCategory.HOUSING_RENT]: '월세·보증료',
  [BenefitCategory.HOUSING_PURCHASE]: '주택 구입',
  [BenefitCategory.HOUSING_SUPPLY]: '임대·분양 공급',
  [BenefitCategory.MARRIAGE_GRANT]: '결혼장려금',
  [BenefitCategory.WEDDING]: '결혼식',
  [BenefitCategory.HEALTH_CHECKUP]: '건강검진',
  [BenefitCategory.FERTILITY]: '난임',
  [BenefitCategory.CHILDBIRTH_PARENTING]: '출산·양육',
  [BenefitCategory.TAX]: '세금',
  [BenefitCategory.OTHER]: '기타',
};

export const BenefitType = {
  CASH: 'cash',
  LOAN: 'loan',
  IN_KIND: 'in_kind',
  SERVICE: 'service',
  VOUCHER: 'voucher',
  DISCOUNT: 'discount',
  HOUSING: 'housing',
  OTHER: 'other',
} as const;
export type BenefitType = (typeof BenefitType)[keyof typeof BenefitType];

/** 자격 조건이 부부 중 누구에게 적용되는지 */
export const EligibilityScope = {
  BOTH: 'both',
  EITHER: 'either',
  APPLICANT: 'applicant',
} as const;
export type EligibilityScope = (typeof EligibilityScope)[keyof typeof EligibilityScope];

export const EligibilityScopeLabel: Record<EligibilityScope, string> = {
  [EligibilityScope.BOTH]: '부부 모두',
  [EligibilityScope.EITHER]: '부부 중 1명',
  [EligibilityScope.APPLICANT]: '신청인',
};

export const IncomeKind = {
  MEDIAN_PCT: 'median_pct',
  ANNUAL_KRW: 'annual_krw',
  NONE: 'none',
  OTHER: 'other',
} as const;
export type IncomeKind = (typeof IncomeKind)[keyof typeof IncomeKind];

export const DeadlineType = {
  ALWAYS: 'always',
  PERIOD: 'period',
  ANNUAL: 'annual',
  BUDGET: 'budget',
  VARIES: 'varies',
  UNKNOWN: 'unknown',
} as const;
export type DeadlineType = (typeof DeadlineType)[keyof typeof DeadlineType];

export const DeadlineTypeLabel: Record<DeadlineType, string> = {
  [DeadlineType.ALWAYS]: '상시',
  [DeadlineType.PERIOD]: '기간',
  [DeadlineType.ANNUAL]: '매년',
  [DeadlineType.BUDGET]: '예산 소진 시',
  [DeadlineType.VARIES]: '기관별 상이',
  [DeadlineType.UNKNOWN]: '확인 필요',
};

/** tags 컬럼은 자유 문자열이라 알려진 값만 라벨을 붙이고 나머지는 원문 그대로 보여 준다 */
export const BenefitTagLabel: Record<string, string> = {
  first_marriage: '초혼',
  no_children: '무자녀',
  first_child: '첫째',
  pregnant: '임신',
  both_spouses_apply: '부부 함께',
  one_time: '1회 한정',
  no_duplicate: '중복수혜 불가',
  dual_income: '맞벌이',
  foreign_spouse_ok: '외국인 배우자',
};

export const Confidence = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;
export type Confidence = (typeof Confidence)[keyof typeof Confidence];

/** Supabase `benefits` 테이블 한 행 (컬럼명 그대로 snake_case) */
export type Benefit = {
  service_id: string;
  name: string;
  org_name: string | null;
  level: BenefitLevel;
  sido: string | null;
  sigungu: string | null;
  relevance: BenefitRelevance;
  category: BenefitCategory;
  benefit_type: BenefitType;
  summary: string | null;
  amount_max_krw: number | null;
  amount_text: string | null;
  marriage_max_years: number | null;
  prospective_allowed: boolean;
  age_min: number | null;
  age_max: number | null;
  income_kind: IncomeKind | null;
  income_max_median_pct: number | null;
  income_max_annual_krw: number | null;
  homeless_required: boolean | null;
  residency_required: boolean | null;
  residency_scope: EligibilityScope | null;
  residency_min_months: number | null;
  tags: string[];
  deadline_type: DeadlineType | null;
  apply_start: string | null;
  apply_end: string | null;
  detail_url: string | null;
  eligibility: {
    residency?: { text?: string | null };
    marriage?: { basis?: string | null; prospective_text?: string | null };
    age?: { scope?: EligibilityScope | null };
    income?: { basis?: string | null; text?: string | null };
    housing_limits?: string | null;
    other?: string[];
  };
  application: { text?: string | null; method?: string | null; online_url?: string | null };
  review: { notes?: string | null };
  stale_suspect: boolean;
  confidence: Confidence | null;
};
