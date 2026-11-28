import * as React from 'react';

import { cn } from '@/shared/lib/cn';

type InputProps = React.ComponentProps<'input'> & { appearance?: 'hub' | 'custom' };

export default function Input({ className, appearance = 'hub', ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      className={cn(
        appearance === 'hub' && 'hub-field',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      {...props}
    />
  );
}
