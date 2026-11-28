import type { ComponentProps } from 'react';

type TableProps = ComponentProps<'table'>;
type TableHeaderProps = ComponentProps<'thead'>;
type TableBodyProps = ComponentProps<'tbody'>;
type TableRowProps = ComponentProps<'tr'>;
type TableHeadProps = ComponentProps<'th'>;
type TableCellProps = ComponentProps<'td'>;
type TableCaptionProps = ComponentProps<'caption'>;

export default function Table(props: TableProps) {
  return <table data-slot="table" {...props} />;
}

export function TableHeader(props: TableHeaderProps) {
  return <thead data-slot="table-header" {...props} />;
}

export function TableBody(props: TableBodyProps) {
  return <tbody data-slot="table-body" {...props} />;
}

export function TableRow(props: TableRowProps) {
  return <tr data-slot="table-row" {...props} />;
}

export function TableHead(props: TableHeadProps) {
  return <th data-slot="table-head" {...props} />;
}

export function TableCell(props: TableCellProps) {
  return <td data-slot="table-cell" {...props} />;
}

export function TableCaption(props: TableCaptionProps) {
  return <caption data-slot="table-caption" {...props} />;
}
