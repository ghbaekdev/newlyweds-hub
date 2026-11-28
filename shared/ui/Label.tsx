'use client';

import { Label as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

type LabelProps = ComponentProps<typeof Primitive.Root>;

export default function Label(props: LabelProps) {
  return <Primitive.Root data-slot="label" {...props} />;
}
