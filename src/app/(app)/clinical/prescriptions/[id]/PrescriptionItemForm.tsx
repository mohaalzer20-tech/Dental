"use client";

import { useActionState, useRef, useEffect } from "react";
import { addPrescriptionItem } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function PrescriptionItemForm({ prescriptionId }: { prescriptionId: string }) {
  const [state, formAction, pending] = useActionState(addPrescriptionItem, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="prescription_id" value={prescriptionId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input name="medication_name" type="text" placeholder="اسم الدواء" required className={inputClass} />
        <input name="dosage" type="text" placeholder="الجرعة" className={inputClass} />
        <input name="frequency" type="text" placeholder="عدد المرات" className={inputClass} />
        <input name="duration" type="text" placeholder="المدة" className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإضافة..." : "إضافة دواء"}
      </button>
    </form>
  );
}
