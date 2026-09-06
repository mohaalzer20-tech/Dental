"use client";

import { useActionState } from "react";
import { submitIntake } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function IntakeForm({ token, patientName }: { token: string; patientName: string }) {
  const [state, formAction, pending] = useActionState(submitIntake, null);

  if (state?.done) {
    return <p className="text-center text-sm text-ink">تم إرسال بياناتك، شكراً لك. نراك قريباً بالعيادة.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <h1 className="font-display text-xl font-bold text-ink">نموذج الفحص المبدئي</h1>
      <p className="text-sm text-ink-muted">أهلاً {patientName}، الرجاء تعبئة المعلومات التالية قبل زيارتك الأولى.</p>

      <label className="flex flex-col gap-1 text-sm text-ink-muted">
        الحساسية (أدوية، مواد...)
        <textarea name="allergies" rows={2} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-muted">
        التاريخ المرضي (أمراض مزمنة، عمليات سابقة...)
        <textarea name="medical_history" rows={3} className={inputClass} />
      </label>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإرسال..." : "إرسال"}
      </button>
    </form>
  );
}
