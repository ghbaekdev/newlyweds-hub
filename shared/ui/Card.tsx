import type { ComponentProps } from 'react';

type CardProps = ComponentProps<'div'> & { as?: 'div' | 'section' };

export default function Card({ as: Component = 'div', ...props }: CardProps) {
  return <Component data-slot="card" {...props} />;
}
