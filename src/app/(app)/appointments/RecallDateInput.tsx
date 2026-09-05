"use client";

import { useTransition } from "react";
import { updateRecallDate } from "./actions";

export default function RecallDateInput({ id, recallDate }: { id: string; recallDate: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="date"
      defaultValue={recallDate ?? ""}
      disabled={pending}
      onChange={(e) => startTransition(() => updateRecallDate(id, e.target.value))}
      className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-primary disabled:opacity-50"
    />
  );
}
