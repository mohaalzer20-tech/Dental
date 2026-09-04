"use client";

import { useActionState, useRef, useEffect } from "react";
import { addPlanItem } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Procedure = { id: string; name: string };

export default function PlanItemForm({ planId, procedures }: { planId: string; procedures: Procedure[] }) {
  const [state, formAction, pending] = useActionState(addPlanItem, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="treatment_plan_id" value={planId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <select name="procedure_id" defaultValue="" className={inputClass}>
          <option value="">بدون إجراء محدد</option>
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input name="tooth_numbers" type="text" placeholder="أرقام الأسنان (FDI)" className={inputClass} />
        <input name="estimated_cost" type="number" step="0.01" placeholder="التكلفة المقدّرة" className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإضافة..." : "إضافة بند"}
      </button>
    </form>
  );
}
