'use client';

import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { cn } from '@/shared/lib/cn';

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

export default function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary focus-visible:outline-ring inline-flex size-[13px] shrink-0 items-center justify-center rounded-[2px] border bg-white text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
