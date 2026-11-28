import assert from 'node:assert/strict';
import test from 'node:test';

import regions from '../../../data/regions.json' with { type: 'json' };
import { formatIncomeManwon, parseHouseholdProfile } from './parseHouseholdProfile.ts';

function profileForm(fields = {}) {
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    for (const entry of Array.isArray(value) ? value : [value]) form.append(name, entry);
  }
  return form;
}

test('keeps zero income, an unknown owner, a province and its districts, and separate residencies', () => {
  const result = parseHouseholdProfile(
    profileForm({
      desired_regions: ['경기도', '경기도|고양시', '경기도|수원시', '경기도|고양시'],
      applicant_monthly_income_krw: '0',
      partner_home_ownership: 'unknown',
      applicant_residence_province: '경기도',
      applicant_residence_district: '고양시',
      applicant_residence_since: '2024-02-29',
      partner_residence_province: '서울특별시',
      marriage_status: 'prospective',
      household_size: '2',
    }),
    regions,
  );

  assert.equal(result.error, null);
  assert.deepEqual(result.data, {
    desired_regions: ['경기도', '경기도|고양시', '경기도|수원시'],
    applicant_monthly_income_krw: 0,
    partner_monthly_income_krw: null,
    applicant_home_ownership: null,
    partner_home_ownership: 'unknown',
    applicant_residence_province: '경기도',
    applicant_residence_district: '고양시',
    applicant_residence_since: '2024-02-01',
    partner_residence_province: '서울특별시',
    partner_residence_district: null,
    partner_residence_since: null,
    marriage_status: 'prospective',
    marriage_registered_on: null,
    household_size: 2,
  });
});

test('clears all optional fields', () => {
  const { data, error } = parseHouseholdProfile(
    profileForm({
      applicant_monthly_income_krw: '',
      marriage_registered_on: '',
      household_size: '',
    }),
    regions,
  );

  assert.equal(error, null);
  assert.deepEqual(data.desired_regions, []);
  assert.ok(
    Object.entries(data).every(([name, value]) => name === 'desired_regions' || value === null),
  );
});

test('rejects impossible dates, ambiguous numbers, and invalid region pairs or addresses', () => {
  for (const fields of [
    { applicant_residence_since: '2025-02-29' },
    { marriage_registered_on: '2026-04-31' },
    { partner_monthly_income_krw: '1.25' },
    { partner_monthly_income_krw: '-1' },
    { partner_monthly_income_krw: '1e6' },
    { partner_monthly_income_krw: '9007199254740992' },
    { household_size: '0' },
    { household_size: '2147483648' },
    { applicant_home_ownership: 'other' },
    { desired_regions: '서울특별시|고양시' },
    { desired_regions: '서울특별시|강남구|테헤란로 1' },
    { desired_regions: 'constructor' },
    { partner_residence_district: '강남구' },
    { partner_residence_province: '서울특별시', partner_residence_district: '고양시' },
  ]) {
    const result = parseHouseholdProfile(profileForm(fields), regions);
    assert.equal(result.data, null, JSON.stringify(fields));
    assert.ok(result.error, JSON.stringify(fields));
  }
});

test('converts 만원 and residence months to the existing storage format', () => {
  const { data, error } = parseHouseholdProfile(
    profileForm({
      applicant_monthly_income_manwon: '320.0123',
      partner_monthly_income_manwon: '900719925474.0991',
      applicant_residence_month: '2024-02',
      partner_residence_month: '2025/12',
      marriage_registered_on: '2024-02-29',
    }),
    regions,
  );

  assert.equal(error, null);
  assert.equal(data.applicant_monthly_income_krw, 3_200_123);
  assert.equal(data.partner_monthly_income_krw, Number.MAX_SAFE_INTEGER);
  assert.equal(data.applicant_residence_since, '2024-02-01');
  assert.equal(data.partner_residence_since, '2025-12-01');
  assert.equal(data.marriage_registered_on, '2024-02-29');
});

test('rejects amounts that cannot be represented exactly and invalid months', () => {
  for (const fields of [
    { applicant_monthly_income_manwon: '0.00001' },
    { applicant_monthly_income_manwon: '900719925474.0992' },
    { applicant_monthly_income_manwon: '1e3' },
    { applicant_residence_month: '2024-13' },
    { applicant_residence_month: '0000-02' },
    { applicant_residence_month: '2024-02-29' },
  ]) {
    assert.equal(parseHouseholdProfile(profileForm(fields), regions).data, null);
  }
});

test('round-trips an existing won amount without rounding it to a whole 만원', () => {
  for (const won of [0, 1, 10_000, 3_200_123, Number.MAX_SAFE_INTEGER]) {
    const form = profileForm({ applicant_monthly_income_manwon: formatIncomeManwon(won) });
    assert.equal(parseHouseholdProfile(form, regions).data?.applicant_monthly_income_krw, won);
  }
});
