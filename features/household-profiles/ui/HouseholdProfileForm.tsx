'use client';

import { useActionState, useState } from 'react';

import type { HouseholdProfile } from '@/entities/household-profiles/model/types';

import Button from '@/shared/ui/Button';
import FieldSet from '@/shared/ui/FieldSet';
import Input from '@/shared/ui/Input';
import Label from '@/shared/ui/Label';
import NativeSelect from '@/shared/ui/NativeSelect';

import { MarriageStatusChoice } from '../lib/parseHouseholdProfile';
import { saveHouseholdProfile } from '../model/saveHouseholdProfile';
import DesiredRegionFields from './DesiredRegionFields';
import HouseholdPersonFields from './HouseholdPersonFields';

type HouseholdProfileFormProps = { profile: HouseholdProfile | null };

export default function HouseholdProfileForm({ profile }: HouseholdProfileFormProps) {
  const [state, action, pending] = useActionState(
    async (previous: Awaited<ReturnType<typeof saveHouseholdProfile>>, form: FormData) => {
      try {
        return await saveHouseholdProfile(previous, form);
      } catch {
        return { saved: false, message: '가구 조건을 저장하지 못했어요. 다시 시도해 주세요.' };
      }
    },
    { message: '', saved: false },
  );
  const [marriageStatus, setMarriageStatus] = useState<string>(profile?.marriage_status ?? '');
  const [registeredOn, setRegisteredOn] = useState(profile?.marriage_registered_on ?? '');
  const [householdSize, setHouseholdSize] = useState(String(profile?.household_size ?? ''));

  return (
    <form action={action} className="mt-4">
      <FieldSet disabled={pending} className="grid gap-6">
        <DesiredRegionFields initialRegions={profile?.desired_regions ?? []} />
        <div className="grid gap-4 lg:grid-cols-2">
          <HouseholdPersonFields person="applicant" label="신청자" profile={profile} />
          <HouseholdPersonFields
            person="partner"
            label="배우자 또는 결혼 예정자"
            profile={profile}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Label className="grid gap-1.5 text-sm font-medium">
            혼인 상태
            <NativeSelect
              name="marriage_status"
              value={marriageStatus}
              onChange={(event) => setMarriageStatus(event.target.value)}
            >
              <option value="">선택 안 함</option>
              <option value={MarriageStatusChoice.PROSPECTIVE}>예비부부</option>
              <option value={MarriageStatusChoice.MARRIED}>혼인신고 함</option>
              <option value={MarriageStatusChoice.OTHER}>그 외</option>
            </NativeSelect>
          </Label>
          <Label className="grid gap-1.5 text-sm font-medium">
            혼인신고일
            <Input
              name="marriage_registered_on"
              type="date"
              value={registeredOn}
              onChange={(event) => setRegisteredOn(event.target.value)}
            />
          </Label>
          <Label className="grid gap-1.5 text-sm font-medium">
            가구원 수 (명)
            <Input
              name="household_size"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={householdSize}
              onChange={(event) => setHouseholdSize(event.target.value)}
            />
          </Label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            className="min-h-11 rounded-md px-4 text-sm font-semibold disabled:opacity-60"
          >
            {pending ? '저장 중…' : '가구 조건 저장'}
          </Button>
          <p
            role="status"
            className={state.saved ? 'text-hub-muted text-sm' : 'text-sm text-red-700'}
          >
            {state.message}
          </p>
        </div>
      </FieldSet>
    </form>
  );
}
