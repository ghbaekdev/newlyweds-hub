import type { ComponentProps } from 'react';

type AlertProps = ComponentProps<'div'>;

export default function Alert({ ...props }: AlertProps) {
  return <div role="alert" data-slot="alert" {...props} />;
}
