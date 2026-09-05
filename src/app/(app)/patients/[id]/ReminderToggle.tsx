"use client";

import { useTransition } from "react";

export default function ReminderToggle({
  enabled,
  onLabel,
  offLabel,
  onToggle,
}: {
  enabled: boolean;
  onLabel: string;
  offLabel: string;
  onToggle: (enabled: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => onToggle(!enabled))}
      className={`self-start rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
        enabled
          ? "border-border text-ink-muted hover:border-danger hover:text-danger"
          : "border-primary text-primary-strong"
      }`}
    >
      {pending ? "..." : enabled ? onLabel : offLabel}
    </button>
  );
}
