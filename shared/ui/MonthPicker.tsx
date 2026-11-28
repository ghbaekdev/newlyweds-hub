'use client';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover } from 'radix-ui';
import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';

const months = Array.from({ length: 12 }, (_, index) => index + 1);
const yearPattern = /^[0-9]{1,4}$/;

type MonthPickerProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export default function MonthPicker({
  id,
  name,
  label,
  value,
  onValueChange,
  disabled,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const yearNumber = Number(year);
  const validYear = yearPattern.test(year) && yearNumber >= 1;
  const displayYear = year.padStart(4, '0');

  function changeOpen(next: boolean) {
    if (next) setYear(value ? value.slice(0, 4) : String(new Date().getFullYear()));
    setOpen(next);
  }

  function chooseMonth(month: string) {
    onValueChange(month);
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <input type="hidden" name={name} value={value} disabled={disabled} />
      <Popover.Trigger asChild>
        <Button
          id={id}
          type="button"
          disabled={disabled}
          data-slot="month-picker-trigger"
          className={cn(
            'hub-field flex items-center justify-between gap-2 text-left font-normal',
            !value && 'text-hub-muted',
          )}
        >
          {value || '연월 선택'}
          <CalendarDays className="text-hub-muted size-4 shrink-0" aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          aria-label={label}
          data-slot="month-picker-calendar"
          className="border-hub-line text-hub-ink z-50 grid w-64 max-w-[calc(100vw-1rem)] gap-3 rounded-md border bg-white p-3 shadow-md"
        >
          <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
            <Button
              type="button"
              aria-label="이전 연도"
              disabled={!validYear || yearNumber <= 1}
              onClick={() => setYear(String(yearNumber - 1))}
              className="hover:bg-hub-row-hover grid size-11 place-items-center rounded-md disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Input
              aria-label="연도"
              inputMode="numeric"
              maxLength={4}
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="text-center tabular-nums"
            />
            <Button
              type="button"
              aria-label="다음 연도"
              disabled={!validYear || yearNumber >= 9999}
              onClick={() => setYear(String(yearNumber + 1))}
              className="hover:bg-hub-row-hover grid size-11 place-items-center rounded-md disabled:opacity-40"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1" role="group" aria-label="월">
            {months.map((month) => {
              const candidate = `${displayYear}/${String(month).padStart(2, '0')}`;
              return (
                <Button
                  key={month}
                  type="button"
                  aria-pressed={value === candidate}
                  disabled={!validYear}
                  onClick={() => chooseMonth(candidate)}
                  className="hover:bg-hub-row-hover aria-pressed:bg-hub-soft aria-pressed:text-hub-accent min-h-11 rounded-md text-sm disabled:opacity-40"
                >
                  {month}월
                </Button>
              );
            })}
          </div>
          {value && (
            <Button type="button" variant="reset" onClick={() => chooseMonth('')}>
              선택 지우기
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
