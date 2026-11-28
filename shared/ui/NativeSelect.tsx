import * as React from 'react';

import { cn } from '@/shared/lib/cn';

type NativeSelectProps = React.ComponentProps<'select'> & { appearance?: 'hub' | 'custom' };

export default function NativeSelect({
  className,
  appearance = 'hub',
  ...props
}: NativeSelectProps) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        appearance === 'hub' && 'hub-field',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      {...props}
    />
  );
}
