'use client';

import { useState } from 'react';

import Button from '@/shared/ui/Button';
import FieldSet, { FieldLegend } from '@/shared/ui/FieldSet';

import RegionFields from './RegionFields';

type DesiredRegionFieldsProps = { initialRegions: string[] };

export default function DesiredRegionFields({ initialRegions }: DesiredRegionFieldsProps) {
  const [selected, setSelected] = useState(initialRegions);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const region = district ? `${province}|${district}` : province;

  return (
    <FieldSet className="grid gap-3">
      <FieldLegend className="mb-2 text-base font-semibold">희망 지역</FieldLegend>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <RegionFields
            province={province}
            district={district}
            onProvinceChange={(value) => {
              setProvince(value);
              setDistrict('');
            }}
            onDistrictChange={setDistrict}
            districtPlaceholder="시·도 전체"
          />
        </div>
        <Button
          type="button"
          onClick={() => setSelected((current) => [...current, region])}
          disabled={!province || selected.includes(region)}
          className="border-hub-line hover:bg-hub-soft disabled:text-hub-muted min-h-11 rounded-md border px-3 text-sm font-semibold disabled:opacity-60"
        >
          지역 추가
        </Button>
      </div>
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="선택한 희망 지역">
          {selected.map((region) => {
            const [province, district] = region.split('|');
            const label = `${province} ${district ?? '전체'}`;
            return (
              <li
                key={region}
                className="bg-hub-soft inline-flex items-center gap-2 rounded-md pl-3 text-sm"
              >
                <input type="hidden" name="desired_regions" value={region} />
                {label}
                <Button
                  type="button"
                  aria-label={`${label} 삭제`}
                  className="hover:bg-hub-line min-h-11 min-w-11 rounded-r-md text-base"
                  onClick={() =>
                    setSelected((current) => current.filter((value) => value !== region))
                  }
                >
                  ×
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </FieldSet>
  );
}
