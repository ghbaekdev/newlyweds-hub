import type {
  HomeOwnership,
  HouseholdProfile,
  MarriageStatus,
} from '@/entities/household-profiles/model/types';

export const HomeOwnershipChoice = {
  OWNED: 'owned',
  NOT_OWNED: 'not_owned',
  UNKNOWN: 'unknown',
} as const satisfies Record<string, HomeOwnership>;

export const MarriageStatusChoice = {
  PROSPECTIVE: 'prospective',
  MARRIED: 'married',
  OTHER: 'other',
} as const satisfies Record<string, MarriageStatus>;

const wonPerManwon = 10_000;
const maxRegions = 300;
const maxHouseholdSize = 2_147_483_647;

type RegionMap = Record<string, readonly string[]>;
type ParseResult = { data: HouseholdProfile; error: null } | { data: null; error: string };

export function parseHouseholdProfile(form: FormData, regions: RegionMap): ParseResult {
  function invalid(error: string): ParseResult {
    return { data: null, error };
  }

  const requested = form.getAll('desired_regions').map(String);
  if (
    requested.length > maxRegions ||
    requested.some((value) => !isDesiredRegion(value, regions))
  ) {
    return invalid('희망 지역을 목록에서 다시 선택해 주세요.');
  }

  const applicantIncome = optionalIncome(form, 'applicant');
  const partnerIncome = optionalIncome(form, 'partner');
  if (applicantIncome === undefined || partnerIncome === undefined) {
    return invalid(
      '월평균 소득을 0 이상의 만원 단위로 입력해 주세요. 소수점은 넷째 자리까지 입력할 수 있어요.',
    );
  }

  const applicantHomeOwnership = optionalChoice(
    form.get('applicant_home_ownership'),
    HomeOwnershipChoice,
  );
  const partnerHomeOwnership = optionalChoice(
    form.get('partner_home_ownership'),
    HomeOwnershipChoice,
  );
  if (applicantHomeOwnership === undefined || partnerHomeOwnership === undefined) {
    return invalid('주택 소유 여부를 다시 선택해 주세요.');
  }

  const applicantProvince = String(form.get('applicant_residence_province') ?? '');
  const applicantDistrict = String(form.get('applicant_residence_district') ?? '');
  const partnerProvince = String(form.get('partner_residence_province') ?? '');
  const partnerDistrict = String(form.get('partner_residence_district') ?? '');
  if (
    !isResidenceRegion(applicantProvince, applicantDistrict, regions) ||
    !isResidenceRegion(partnerProvince, partnerDistrict, regions)
  ) {
    return invalid('현재 거주지를 목록에서 다시 선택해 주세요.');
  }

  const applicantSince = optionalResidenceMonth(form, 'applicant');
  const partnerSince = optionalResidenceMonth(form, 'partner');
  const marriageRegisteredOn = optionalDate(form.get('marriage_registered_on'));
  if (
    applicantSince === undefined ||
    partnerSince === undefined ||
    marriageRegisteredOn === undefined
  ) {
    return invalid('거주 시작 연월 또는 혼인신고일을 확인해 주세요.');
  }

  const marriageStatus = optionalChoice(form.get('marriage_status'), MarriageStatusChoice);
  if (marriageStatus === undefined) return invalid('혼인 상태를 다시 선택해 주세요.');

  const householdSize = optionalWholeNumber(form.get('household_size'), 1, maxHouseholdSize);
  if (householdSize === undefined) return invalid('가구원 수를 1명 이상의 정수로 입력해 주세요.');

  return {
    error: null,
    data: {
      desired_regions: [...new Set(requested)],
      applicant_monthly_income_krw: applicantIncome,
      partner_monthly_income_krw: partnerIncome,
      applicant_home_ownership: applicantHomeOwnership,
      partner_home_ownership: partnerHomeOwnership,
      applicant_residence_province: applicantProvince || null,
      applicant_residence_district: applicantDistrict || null,
      applicant_residence_since: applicantSince,
      partner_residence_province: partnerProvince || null,
      partner_residence_district: partnerDistrict || null,
      partner_residence_since: partnerSince,
      marriage_status: marriageStatus,
      marriage_registered_on: marriageRegisteredOn,
      household_size: householdSize,
    },
  };
}

function isDesiredRegion(value: string, regions: RegionMap) {
  const [province, district, extra] = value.split('|');
  if (extra !== undefined || district === '' || !Object.hasOwn(regions, province)) return false;
  return district === undefined || regions[province].includes(district);
}

function isResidenceRegion(province: string, district: string, regions: RegionMap) {
  if (!province) return !district;
  return Object.hasOwn(regions, province) && (!district || regions[province].includes(district));
}

function optionalWholeNumber(entry: FormDataEntryValue | null, min: number, max: number) {
  if (entry === null || entry === '') return null;
  if (typeof entry !== 'string' || !/^\d+$/.test(entry)) return undefined;
  const value = Number(entry);
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : undefined;
}

function optionalChoice<T extends string>(
  entry: FormDataEntryValue | null,
  choices: Record<string, T>,
) {
  if (entry === null || entry === '') return null;
  return Object.values(choices).find((choice) => choice === entry);
}

function optionalDate(entry: FormDataEntryValue | null) {
  if (entry === null || entry === '') return null;
  if (typeof entry !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry) || entry.startsWith('0000')) {
    return undefined;
  }

  const date = new Date(`${entry}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) || !date.toISOString().startsWith(entry) ? undefined : entry;
}

type HouseholdPerson = 'applicant' | 'partner';

export function formatIncomeManwon(won: number | null | undefined): string {
  if (won == null) return '';
  const whole = Math.floor(won / wonPerManwon);
  const fraction = String(won % wonPerManwon)
    .padStart(4, '0')
    .replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function optionalIncome(form: FormData, person: HouseholdPerson) {
  const entry = form.get(`${person}_monthly_income_manwon`);
  if (entry === null) {
    return optionalWholeNumber(
      form.get(`${person}_monthly_income_krw`),
      0,
      Number.MAX_SAFE_INTEGER,
    );
  }
  if (entry === '') return null;
  if (typeof entry !== 'string' || !/^\d+(?:\.\d{1,4})?$/.test(entry)) return undefined;

  const [whole, fraction = ''] = entry.split('.');
  const won = Number(whole) * wonPerManwon + Number(fraction.padEnd(4, '0'));
  return Number.isSafeInteger(won) ? won : undefined;
}

function optionalResidenceMonth(form: FormData, person: HouseholdPerson) {
  const entry = form.get(`${person}_residence_month`);
  if (entry === null) {
    const legacyDate = optionalDate(form.get(`${person}_residence_since`));
    return legacyDate ? `${legacyDate.slice(0, 7)}-01` : legacyDate;
  }
  if (entry === '') return null;
  if (typeof entry !== 'string' || !/^\d{4}[-/](0[1-9]|1[0-2])$/.test(entry)) return undefined;
  return optionalDate(`${entry.replace('/', '-')}-01`);
}
