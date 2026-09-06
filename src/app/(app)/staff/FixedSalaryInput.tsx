"use client";

import { useActionState } from "react";
import { updateFixedSalary } from "./actions";

export default function FixedSalaryInput({
  userId,
  initialSalary,
}: {
  userId: string;
  initialSalary: number | null;
}) {
  const [state, formAction, pending] = useActionState(updateFixedSalary, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <input
        name="fixed_salary"
        type="number"
        step="0.01"
        min="0"
        defaultValue={initialSalary ?? ""}
        placeholder="بدون راتب ثابت"
        className="w-28 rounded-lg border border-border bg-bg px-2 py-1 font-mono text-sm text-ink outline-none focus:border-primary"
      />
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
