"use client";

export type ToothStatus = "proposed" | "completed" | undefined;

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const TONE_CLASS: Record<Exclude<ToothStatus, undefined>, string> = {
  proposed: "border-accent bg-accent/15 text-accent",
  completed: "border-primary bg-primary/15 text-primary-strong",
};

export default function OdontogramChart({
  statuses,
  selected,
  onSelect,
}: {
  statuses: Record<number, ToothStatus>;
  selected?: number;
  onSelect: (tooth: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg p-4">
      <ToothRow teeth={UPPER} statuses={statuses} selected={selected} onSelect={onSelect} />
      <div className="h-px w-full bg-border" />
      <ToothRow teeth={LOWER} statuses={statuses} selected={selected} onSelect={onSelect} />
      <div className="mt-2 flex gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-accent bg-accent/15" /> مقترح
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-primary bg-primary/15" /> منجز
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-border" /> سليم
        </span>
      </div>
    </div>
  );
}

function ToothRow({
  teeth,
  statuses,
  selected,
  onSelect,
}: {
  teeth: number[];
  statuses: Record<number, ToothStatus>;
  selected?: number;
  onSelect: (tooth: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {teeth.map((n) => {
        const status = statuses[n];
        const isSelected = selected === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={`flex h-10 w-8 flex-col items-center justify-center rounded-md border text-[10px] font-mono transition-colors ${
              status ? TONE_CLASS[status] : "border-border text-ink-muted hover:border-primary/50"
            } ${isSelected ? "ring-2 ring-primary" : ""}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
