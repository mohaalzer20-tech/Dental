"use client";

import { useActionState, useRef, useEffect } from "react";
import { addToWaitlist } from "./actions";
import PatientSelect from "@/components/PatientSelect";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Patient = { id: string; name: string };

export default function WaitlistForm({ patients }: { patients: Patient[] }) {
  const [state, formAction, pending] = useActionState(addToWaitlist, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">إضافة لقائمة الانتظار</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <PatientSelect patients={patients} required className={inputClass} />
        <input name="desired_from" type="datetime-local" placeholder="من" className={inputClass} />
        <input name="desired_to" type="datetime-local" placeholder="إلى" className={inputClass} />
        <input name="notes" type="text" placeholder="ملاحظات" className={inputClass} />
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
