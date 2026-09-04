"use client";

import { useActionState, useRef, useEffect } from "react";
import { addShift } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

type StaffMember = { id: string; full_name: string };

export default function ShiftForm({ staff }: { staff: StaffMember[] }) {
  const [state, formAction, pending] = useActionState(addShift, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">إضافة دوام</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <select name="user_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            اختر الموظف
          </option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
        <select name="day_of_week" defaultValue="0" className={inputClass}>
          {days.map((d, i) => (
            <option key={i} value={i}>
              {d}
            </option>
          ))}
        </select>
        <input name="start_time" type="time" required className={inputClass} />
        <input name="end_time" type="time" required className={inputClass} />
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
