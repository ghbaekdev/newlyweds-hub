'use client';

import { useState } from 'react';

import type { HouseholdProfile } from '@/entities/household-profiles/model/types';

import FieldSet, { FieldLegend } from '@/shared/ui/FieldSet';
import Input from '@/shared/ui/Input';
import Label from '@/shared/ui/Label';
import MonthPicker from '@/shared/ui/MonthPicker';
import Select, { SelectItem } from '@/shared/ui/Select';

import { formatIncomeManwon, HomeOwnershipChoice } from '../lib/parseHouseholdProfile';
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
  const [income, setIncome] = useState(
    formatIncomeManwon(profile?.[`${person}_monthly_income_krw`]),
  );
  const [ownership, setOwnership] = useState<string>(profile?.[`${person}_home_ownership`] ?? '');
  const [province, setProvince] = useState(profile?.[`${person}_residence_province`] ?? '');
  const [district, setDistrict] = useState(profile?.[`${person}_residence_district`] ?? '');
  const [since, setSince] = useState(
    profile?.[`${person}_residence_since`]?.slice(0, 7).replace('-', '/') ?? '',
  );

  return (
    <FieldSet className="border-hub-line grid gap-4 rounded-md border p-3 sm:p-4">
      <FieldLegend className="px-1 text-sm font-semibold">{label}</FieldLegend>
      <Label className="grid gap-1.5 text-sm font-medium">
        월평균 소득 (만원)
        <Input
          name={`${person}_monthly_income_manwon`}
          type="text"
          inputMode="decimal"
          pattern="[0-9]+([.][0-9]{1,4})?"
          placeholder="예: 320"
          value={income}
          onChange={(event) => setIncome(event.target.value)}
        />
      </Label>
      <Label className="grid gap-1.5 text-sm font-medium">
        주택 소유 여부
        <Select
          aria-label="주택 소유 여부"
          name={`${person}_home_ownership`}
          value={ownership}
          onValueChange={setOwnership}
        >
          <SelectItem value="">선택 안 함</SelectItem>
          <SelectItem value={HomeOwnershipChoice.OWNED}>소유</SelectItem>
          <SelectItem value={HomeOwnershipChoice.NOT_OWNED}>미소유</SelectItem>
          <SelectItem value={HomeOwnershipChoice.UNKNOWN}>모름</SelectItem>
        </Select>
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
      <div className="grid gap-1.5 text-sm font-medium">
        <Label htmlFor={`${person}-residence-month`}>연속 거주 시작 연월</Label>
        <MonthPicker
          id={`${person}-residence-month`}
          name={`${person}_residence_month`}
          label="연속 거주 시작 연월"
          value={since}
          onValueChange={setSince}
        />
      </div>
    </FieldSet>
  );
}
