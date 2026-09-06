"use client";

import { useActionState, useRef, useEffect } from "react";
import { addAppointment } from "./actions";
import PatientSelect from "@/components/PatientSelect";

type Patient = { id: string; name: string };
type AppointmentType = { id: string; name: string; color: string };

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function AppointmentForm({
  patients,
  types = [],
}: {
  patients: Patient[];
  types?: AppointmentType[];
}) {
  const [state, formAction, pending] = useActionState(addAppointment, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="text-sm font-semibold text-ink">إضافة موعد جديد</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PatientSelect patients={patients} required className={inputClass} />
        <input name="notes" type="text" placeholder="ملاحظات" className={inputClass} />
        {types.length > 0 && (
          <select name="appointment_type_id" defaultValue="" className={inputClass}>
            <option value="">بدون نوع محدد</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        <input name="start_time" type="datetime-local" required className={inputClass} />
        <input name="end_time" type="datetime-local" required className={inputClass} />
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          تاريخ المتابعة (اختياري)
          <input name="recall_date" type="date" className={inputClass} />
        </label>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإضافة..." : "إضافة"}
      </button>
    </form>
  );
}
