export type HomeOwnership = 'owned' | 'not_owned' | 'unknown';
export type MarriageStatus = 'prospective' | 'married' | 'other';

export type HouseholdProfile = {
  desired_regions: string[];
  applicant_monthly_income_krw: number | null;
  partner_monthly_income_krw: number | null;
  applicant_home_ownership: HomeOwnership | null;
  partner_home_ownership: HomeOwnership | null;
  applicant_residence_province: string | null;
  applicant_residence_district: string | null;
  applicant_residence_since: string | null;
  partner_residence_province: string | null;
  partner_residence_district: string | null;
  partner_residence_since: string | null;
  marriage_status: MarriageStatus | null;
  marriage_registered_on: string | null;
  household_size: number | null;
};
