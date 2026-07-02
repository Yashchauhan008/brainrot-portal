export default function StatCard({
  label,
  value,
  hint,
  accentVar,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accentVar?: string;
}) {
  return (
    <div className="card !p-5">
      <div className="flex items-center gap-2">
        {accentVar && (
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: accentVar }}
          />
        )}
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
      </div>
      <div className="mt-2 text-4xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
