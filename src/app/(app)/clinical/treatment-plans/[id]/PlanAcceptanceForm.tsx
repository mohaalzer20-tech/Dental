"use client";

import { useActionState } from "react";
import { acceptTreatmentPlan } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function PlanAcceptanceForm({
  planId,
  acceptedAt,
  acceptedByName,
}: {
  planId: string;
  acceptedAt: string | null;
  acceptedByName: string | null;
}) {
  const [state, formAction, pending] = useActionState(acceptTreatmentPlan, null);

  if (acceptedAt) {
    return (
      <div className="rounded-xl border border-primary bg-surface-alt p-4 text-sm">
        <p className="font-medium text-primary-strong">
          تمت الموافقة على الخطة بواسطة {acceptedByName} بتاريخ{" "}
          {new Date(acceptedAt).toLocaleString("ar-SY-u-nu-latn")}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="text-sm font-semibold text-ink">تأكيد موافقة المريض</h2>
      <p className="text-xs text-ink-muted">
        اكتب الاسم الكامل للمريض (أو ولي أمره) كتأكيد للموافقة على خطة العلاج — يُسجَّل مع الوقت والتاريخ.
      </p>
      <input type="hidden" name="treatment_plan_id" value={planId} />
      <div className="flex flex-wrap gap-3">
        <input
          name="accepted_by_name"
          type="text"
          placeholder="الاسم الكامل"
          required
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {pending ? "جاري التأكيد..." : "تأكيد الموافقة"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
