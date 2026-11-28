'use client';

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  name?: string;
  disabled?: boolean;
  className?: string;
  appearance?: 'hub' | 'custom';
  'aria-label': string;
};

// Radix reserves the empty string for its placeholder. Prefix item values so an empty filter stays selectable.
export default function Select({
  value,
  onValueChange,
  children,
  name,
  disabled,
  className,
  appearance = 'hub',
  'aria-label': accessibleName,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={`:${value}`}
      onValueChange={(next) => onValueChange(next.slice(1))}
      disabled={disabled}
    >
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        aria-label={accessibleName}
        className={cn(
          'focus-visible:outline-ring flex items-center justify-between gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
          appearance === 'hub' && 'hub-field',
          className,
        )}
      >
        <span className="min-w-0 truncate">
          <SelectPrimitive.Value data-slot="select-value" />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 opacity-60" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          data-slot="select-content"
          position="popper"
          align="start"
          sideOffset={4}
          className="border-hub-line text-hub-ink z-50 max-h-(--radix-select-content-available-height) max-w-(--radix-select-content-available-width) min-w-(--radix-select-trigger-width) overflow-hidden rounded-md border bg-white shadow-md"
        >
          <SelectPrimitive.ScrollUpButton className="flex justify-center py-1">
            <ChevronUpIcon aria-hidden="true" className="size-4" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex justify-center py-1">
            <ChevronDownIcon aria-hidden="true" className="size-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>;

export function SelectItem({ children, className, value, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={`:${value}`}
      className={cn(
        'data-[highlighted]:bg-hub-soft data-[state=checked]:text-hub-accent relative cursor-default rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute top-1/2 right-2 -translate-y-1/2">
        <CheckIcon aria-hidden="true" className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
