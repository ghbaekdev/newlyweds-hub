'use client';

import { useActionState, useId, useState } from 'react';

import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Label from '@/shared/ui/Label';

import { saveAccountProfile } from '../model/saveAccountProfile';
import {
  type AccountProfileSaveState,
  SaveAccountProfileState,
} from '../model/saveAccountProfileState';

const feedback = {
  [SaveAccountProfileState.IDLE]: '',
  [SaveAccountProfileState.SAVED]: '표시 이름을 저장했어요.',
  [SaveAccountProfileState.INVALID]: '표시 이름은 줄바꿈 없이 40자 이내로 입력해 주세요.',
  [SaveAccountProfileState.SIGN_IN_REQUIRED]: '다시 로그인한 뒤 저장해 주세요.',
  [SaveAccountProfileState.FAILED]: '표시 이름을 저장하지 못했어요. 다시 시도해 주세요.',
};

type SaveAccountProfileFormProps = { displayName: string | null };

export default function SaveAccountProfileForm({ displayName }: SaveAccountProfileFormProps) {
  const nameId = useId();
  const statusId = useId();
  const [draft, setDraft] = useState(displayName ?? '');
  const [state, formAction, pending] = useActionState<AccountProfileSaveState, FormData>(
    async (previousState, formData) => {
      try {
        const result = await saveAccountProfile(previousState, formData);
        if (result === SaveAccountProfileState.SAVED) setDraft((value) => value.trim());
        return result;
      } catch {
        return SaveAccountProfileState.FAILED;
      }
    },
    SaveAccountProfileState.IDLE,
  );

  return (
    <form action={formAction} className="mt-5">
      <Label htmlFor={nameId} className="text-sm font-semibold">
        표시 이름 <span className="text-hub-muted font-normal">(선택)</span>
      </Label>
      <Input
        id={nameId}
        name="displayName"
        className="mt-2"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        readOnly={pending}
        aria-invalid={state === SaveAccountProfileState.INVALID || undefined}
        aria-describedby={statusId}
      />
      <p className="text-hub-muted mt-2 text-sm">이름을 비운 채 저장하면 표시 이름이 지워져요.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          className="min-h-11 cursor-pointer rounded-md px-4 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
        >
          {pending ? '저장 중…' : '표시 이름 저장'}
        </Button>
        <p id={statusId} role="status" className="text-hub-muted text-sm">
          {pending ? '' : feedback[state]}
        </p>
      </div>
    </form>
  );
}
