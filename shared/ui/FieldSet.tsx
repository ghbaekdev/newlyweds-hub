import type { ComponentProps } from 'react';

type FieldSetProps = ComponentProps<'fieldset'>;
type FieldLegendProps = ComponentProps<'legend'>;

export default function FieldSet(props: FieldSetProps) {
  return <fieldset data-slot="field-set" {...props} />;
}

export function FieldLegend(props: FieldLegendProps) {
  return <legend data-slot="field-legend" {...props} />;
}
