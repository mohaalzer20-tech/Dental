"use client";

import { useActionState } from "react";
import { updateCommissionRate } from "./actions";

export default function CommissionRateInput({
  userId,
  initialRate,
}: {
  userId: string;
  initialRate: number | null;
}) {
  const [state, formAction, pending] = useActionState(updateCommissionRate, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <input
        name="commission_rate"
        type="number"
        step="0.1"
        min="0"
        max="100"
        defaultValue={initialRate ?? ""}
        placeholder="0"
        className="w-20 rounded-lg border border-border bg-bg px-2 py-1 font-mono text-sm text-ink outline-none focus:border-primary"
      />
      <span className="text-xs text-ink-muted">%</span>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-border px-2 py-1 text-xs text-ink-muted hover:bg-surface-alt disabled:opacity-50"
      >
        حفظ
      </button>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
