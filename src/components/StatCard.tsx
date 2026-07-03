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
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: accentVar }}
          />
        )}
        <span className="text-sm font-medium text-secondary">{label}</span>
      </div>
      <div className="mt-3 text-4xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      {hint && <div className="mt-1.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}
