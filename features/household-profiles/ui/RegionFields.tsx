'use client';

import regions from '@/data/regions.json';

const regionMap: Record<string, readonly string[]> = regions;
const provinces = Object.keys(regionMap).sort((a, b) => a.localeCompare(b, 'ko'));

type RegionFieldsProps = {
  province: string;
  district: string;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  provinceName?: string;
  districtName?: string;
  districtPlaceholder: string;
};

export default function RegionFields({
  province,
  district,
  onProvinceChange,
  onDistrictChange,
  provinceName,
  districtName,
  districtPlaceholder,
}: RegionFieldsProps) {
  const districts = Object.hasOwn(regionMap, province) ? regionMap[province] : [];
  const provinceOptions =
    province && !Object.hasOwn(regionMap, province) ? [province, ...provinces] : provinces;
  const districtOptions =
    district && !districts.includes(district) ? [district, ...districts] : districts;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">
        시·도
        <select
          className="hub-field"
          name={provinceName}
          value={province}
          onChange={(event) => onProvinceChange(event.target.value)}
        >
          <option value="">선택 안 함</option>
          {provinceOptions.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        시·군·구
        <select
          className="hub-field"
          name={districtName}
          disabled={!province || districtOptions.length === 0}
          value={district}
          onChange={(event) => onDistrictChange(event.target.value)}
        >
          <option value="">{districtPlaceholder}</option>
          {districtOptions.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
