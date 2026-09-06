"use client";

import { useActionState } from "react";
import { saveReconciliation } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function ReconciliationForm({
  workDate,
  expectedAmount,
  existingActual,
  existingNotes,
}: {
  workDate: string;
  expectedAmount: number;
  existingActual: number | null;
  existingNotes: string;
}) {
  const [state, formAction, pending] = useActionState(saveReconciliation, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <input type="hidden" name="work_date" value={workDate} />
      <input type="hidden" name="expected_amount" value={expectedAmount} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-bg p-3">
          <p className="text-xs text-ink-muted">النقد المتوقع اليوم (من النظام)</p>
          <p className="mt-1 font-mono text-lg text-ink">{expectedAmount}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted">المبلغ الفعلي المعدود</label>
          <input
            name="actual_amount"
            type="number"
            step="0.01"
            defaultValue={existingActual ?? ""}
            required
            className={inputClass + " w-full"}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted">ملاحظات</label>
          <input name="notes" type="text" defaultValue={existingNotes} className={inputClass + " w-full"} />
        </div>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الحفظ..." : "حفظ التسوية"}
      </button>
    </form>
  );
}
