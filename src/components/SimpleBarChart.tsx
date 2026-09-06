const BAR_COLOR = ["bg-cat-cyan", "bg-cat-violet", "bg-cat-pink", "bg-cat-green"] as const;
const TEXT_COLOR = ["text-cat-cyan", "text-cat-violet", "text-cat-pink", "text-cat-green"] as const;

export default function SimpleBarChart({
  data,
  valueSuffix = "%",
}: {
  data: { label: string; value: number }[];
  valueSuffix?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-6">
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end justify-center">
            <div
              className={`w-8 rounded-t-md ${BAR_COLOR[i % BAR_COLOR.length]}`}
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted">{d.label}</p>
          <p className={`font-mono text-sm font-semibold ${TEXT_COLOR[i % TEXT_COLOR.length]}`}>
            {d.value}
            {valueSuffix}
          </p>
        </div>
      ))}
    </div>
  );
}
