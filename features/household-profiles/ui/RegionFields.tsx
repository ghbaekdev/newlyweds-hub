'use client';

import regions from '@/data/regions.json';

import Label from '@/shared/ui/Label';
import Select, { SelectItem } from '@/shared/ui/Select';

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
      <Label className="grid gap-1.5 text-sm font-medium">
        시·도
        <Select
          aria-label="시·도"
          name={provinceName}
          value={province}
          onValueChange={onProvinceChange}
        >
          <SelectItem value="">선택 안 함</SelectItem>
          {provinceOptions.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </Select>
      </Label>
      <Label className="grid gap-1.5 text-sm font-medium">
        시·군·구
        <Select
          aria-label="시·군·구"
          name={districtName}
          disabled={!province || districtOptions.length === 0}
          value={district}
          onValueChange={onDistrictChange}
        >
          <SelectItem value="">{districtPlaceholder}</SelectItem>
          {districtOptions.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </Select>
      </Label>
    </div>
  );
}
