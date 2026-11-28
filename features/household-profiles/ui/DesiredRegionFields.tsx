'use client';

import { useState } from 'react';

import RegionFields from './RegionFields';

type DesiredRegionFieldsProps = { initialRegions: string[] };

export default function DesiredRegionFields({ initialRegions }: DesiredRegionFieldsProps) {
  const [selected, setSelected] = useState(initialRegions);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const region = district ? `${province}|${district}` : province;

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-base font-semibold">희망 지역</legend>
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
        <button
          type="button"
          onClick={() => setSelected((current) => [...current, region])}
          disabled={!province || selected.includes(region)}
          className="border-hub-line hover:bg-hub-soft disabled:text-hub-muted min-h-11 rounded-md border px-3 text-sm font-semibold disabled:opacity-60"
        >
          지역 추가
        </button>
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
                <button
                  type="button"
                  aria-label={`${label} 삭제`}
                  className="hover:bg-hub-line min-h-11 min-w-11 rounded-r-md text-base"
                  onClick={() =>
                    setSelected((current) => current.filter((value) => value !== region))
                  }
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </fieldset>
  );
}
