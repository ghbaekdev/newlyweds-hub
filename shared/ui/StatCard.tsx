type StatCardProps = {
  label: string;
  value: number | string;
};

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-xl font-semibold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
