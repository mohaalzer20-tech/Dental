"use client";

import { useTransition } from "react";

export default function ResolveButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => action())}
      className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-primary hover:text-primary-strong disabled:opacity-50"
    >
      {pending ? "..." : "تم العلاج"}
    </button>
  );
}
