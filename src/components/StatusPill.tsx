const TONES = {
  primary: "bg-primary/15 text-primary-strong",
  accent: "bg-accent/15 text-accent",
  danger: "bg-danger/15 text-danger",
  muted: "bg-surface-alt text-ink-muted",
  cyan: "bg-cat-cyan/15 text-cat-cyan",
  violet: "bg-cat-violet/15 text-cat-violet",
  pink: "bg-cat-pink/15 text-cat-pink",
  green: "bg-cat-green/15 text-cat-green",
} as const;

export type StatusTone = keyof typeof TONES;

export default function StatusPill({
  tone,
  children,
}: {
  tone: StatusTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
