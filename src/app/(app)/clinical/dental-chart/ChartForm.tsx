"use client";

import { useActionState, useRef, useEffect } from "react";
import { addChartEntry } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

const quadrants = [
  { label: "الربع 1 (علوي أيمن)", start: 11 },
  { label: "الربع 2 (علوي أيسر)", start: 21 },
  { label: "الربع 3 (سفلي أيسر)", start: 31 },
  { label: "الربع 4 (سفلي أيمن)", start: 41 },
];

const conditions = [
  { value: "healthy", label: "سليم" },
  { value: "caries", label: "تسوس" },
  { value: "filled", label: "حشوة" },
  { value: "crown", label: "تاج" },
  { value: "bridge", label: "جسر" },
  { value: "implant", label: "زراعة" },
  { value: "root_canal", label: "علاج عصب" },
  { value: "extraction", label: "خلع" },
  { value: "missing", label: "مفقود" },
  { value: "fractured", label: "كسر" },
];

type Patient = { id: string; name: string };

export default function ChartForm({
  patients,
  lockedPatientId,
  selectedTooth,
}: {
  patients: Patient[];
  lockedPatientId?: string;
  selectedTooth?: number;
}) {
  const [state, formAction, pending] = useActionState(addChartEntry, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form
      key={selectedTooth}
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="text-sm font-semibold text-ink">تسجيل حالة سن</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {lockedPatientId ? (
          <>
            <input type="hidden" name="patient_id" value={lockedPatientId} />
            <select disabled defaultValue={lockedPatientId} className={inputClass}>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </>
        ) : (
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
        )}
        <select name="tooth_number" required defaultValue={selectedTooth ?? ""} className={inputClass}>
          <option value="" disabled>
            رقم السن (FDI)
          </option>
          {quadrants.map((q) => (
            <optgroup key={q.start} label={q.label}>
              {Array.from({ length: 8 }, (_, i) => q.start + i).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select name="condition" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            الحالة
          </option>
          {conditions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input name="notes" type="text" placeholder="ملاحظات" className={inputClass} />
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
