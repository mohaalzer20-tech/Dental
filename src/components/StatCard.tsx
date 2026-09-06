import Link from "next/link";
import type { ReactNode } from "react";

const UNDERLINE = {
  cyan: "from-cat-cyan",
  violet: "from-cat-violet",
  pink: "from-cat-pink",
  green: "from-cat-green",
} as const;

const NUMBER_COLOR = {
  cyan: "text-cat-cyan",
  violet: "text-cat-violet",
  pink: "text-cat-pink",
  green: "text-cat-green",
} as const;

export type StatAccent = keyof typeof UNDERLINE;

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent: StatAccent;
  href?: string;
}) {
  const content = (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-ink-muted">{label}</p>
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-ink-muted">
            {icon}
          </span>
        )}
      </div>
      <p className={`mt-3 font-mono text-3xl font-semibold ${NUMBER_COLOR[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l ${UNDERLINE[accent]} to-transparent`} />
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
