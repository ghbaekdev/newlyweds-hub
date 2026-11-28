import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  {
    variants: {
      variant: {
        default: '',
        primary: 'bg-primary text-white enabled:hover:bg-primary-hover',
        reset:
          'text-primary enabled:hover:bg-hub-row-hover min-h-11 cursor-pointer text-left font-semibold hover:underline',
      },
    },
  },
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export default function Button({ className, variant, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button';
  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
