'use client';

import { Collapsible as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

type RootProps = ComponentProps<typeof Primitive.Root>;
type TriggerProps = ComponentProps<typeof Primitive.Trigger>;
type ContentProps = ComponentProps<typeof Primitive.Content>;

export default function Collapsible(props: RootProps) {
  return <Primitive.Root data-slot="collapsible" {...props} />;
}

export function CollapsibleTrigger(props: TriggerProps) {
  return <Primitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

export function CollapsibleContent(props: ContentProps) {
  return <Primitive.Content data-slot="collapsible-content" {...props} />;
}
