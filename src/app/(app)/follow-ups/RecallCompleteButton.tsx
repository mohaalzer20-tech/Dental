"use client";

import { useTransition } from "react";
import { markRecallCompleted } from "../appointments/actions";

export default function RecallCompleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markRecallCompleted(id))}
      className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-primary hover:text-primary-strong disabled:opacity-50"
    >
      {pending ? "..." : "تم التواصل"}
    </button>
  );
}
