import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

const badgeVariants = cva('rounded px-1.5 py-0.5 text-xs', {
  variants: {
    tone: {
      neutral: 'bg-hub-bg text-hub-muted',
      blue: 'bg-hub-soft text-hub-accent',
      amber: 'bg-amber-50 text-amber-800',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export default function Badge({ className, tone, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props} />;
}
