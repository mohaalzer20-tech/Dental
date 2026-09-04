"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTreatment } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Patient = { id: string; name: string };
type Procedure = { id: string; name: string };
type Doctor = { id: string; full_name: string };

export default function TreatmentForm({
  patients,
  procedures,
  doctors,
}: {
  patients: Patient[];
  procedures: Procedure[];
  doctors: Doctor[];
}) {
  const [state, formAction, pending] = useActionState(addTreatment, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">تسجيل معالجة</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select name="patient_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            المريض
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select name="procedure_id" defaultValue="" className={inputClass}>
          <option value="">الإجراء (اختياري)</option>
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select name="doctor_id" defaultValue="" className={inputClass}>
          <option value="">الطبيب المعالج (اختياري)</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name}
            </option>
          ))}
        </select>
        <input name="tooth_numbers" type="text" placeholder="أرقام الأسنان" className={inputClass} />
        <input name="diagnosis" type="text" placeholder="التشخيص" className={inputClass} />
        <input name="cost" type="number" step="0.01" placeholder="التكلفة" className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري التسجيل..." : "تسجيل"}
      </button>
    </form>
  );
}
