'use client';

import { useState } from 'react';

import type { HouseholdProfile } from '@/entities/household-profiles/model/types';

import FieldSet, { FieldLegend } from '@/shared/ui/FieldSet';
import Input from '@/shared/ui/Input';
import Label from '@/shared/ui/Label';
import NativeSelect from '@/shared/ui/NativeSelect';

import { HomeOwnershipChoice } from '../lib/parseHouseholdProfile';
import RegionFields from './RegionFields';

type HouseholdPersonFieldsProps = {
  person: 'applicant' | 'partner';
  label: string;
  profile: HouseholdProfile | null;
};

export default function HouseholdPersonFields({
  person,
  label,
  profile,
}: HouseholdPersonFieldsProps) {
  const [income, setIncome] = useState(String(profile?.[`${person}_monthly_income_krw`] ?? ''));
  const [ownership, setOwnership] = useState<string>(profile?.[`${person}_home_ownership`] ?? '');
  const [province, setProvince] = useState(profile?.[`${person}_residence_province`] ?? '');
  const [district, setDistrict] = useState(profile?.[`${person}_residence_district`] ?? '');
  const [since, setSince] = useState(profile?.[`${person}_residence_since`] ?? '');

  return (
    <FieldSet className="border-hub-line grid gap-4 rounded-md border p-3 sm:p-4">
      <FieldLegend className="px-1 text-sm font-semibold">{label}</FieldLegend>
      <Label className="grid gap-1.5 text-sm font-medium">
        월평균 소득 (원)
        <Input
          name={`${person}_monthly_income_krw`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={income}
          onChange={(event) => setIncome(event.target.value)}
        />
      </Label>
      <Label className="grid gap-1.5 text-sm font-medium">
        주택 소유 여부
        <NativeSelect
          name={`${person}_home_ownership`}
          value={ownership}
          onChange={(event) => setOwnership(event.target.value)}
        >
          <option value="">선택 안 함</option>
          <option value={HomeOwnershipChoice.OWNED}>소유</option>
          <option value={HomeOwnershipChoice.NOT_OWNED}>미소유</option>
          <option value={HomeOwnershipChoice.UNKNOWN}>모름</option>
        </NativeSelect>
      </Label>
      <FieldSet>
        <FieldLegend className="mb-1.5 text-sm font-semibold">현재 거주지</FieldLegend>
        <RegionFields
          province={province}
          district={district}
          onProvinceChange={(value) => {
            setProvince(value);
            setDistrict('');
          }}
          onDistrictChange={setDistrict}
          provinceName={`${person}_residence_province`}
          districtName={`${person}_residence_district`}
          districtPlaceholder="선택 안 함"
        />
      </FieldSet>
      <Label className="grid gap-1.5 text-sm font-medium">
        연속 거주 시작일
        <Input
          name={`${person}_residence_since`}
          type="date"
          value={since}
          onChange={(event) => setSince(event.target.value)}
        />
      </Label>
    </FieldSet>
  );
}
