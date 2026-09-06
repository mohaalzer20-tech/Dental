"use client";

import { useActionState } from "react";
import { addPrescription } from "./actions";
import PatientSelect from "@/components/PatientSelect";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Patient = { id: string; name: string };

export default function PrescriptionForm({ patients }: { patients: Patient[] }) {
  const [state, formAction, pending] = useActionState(addPrescription, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">إنشاء وصفة جديدة</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PatientSelect patients={patients} required className={inputClass} />
        <input name="diagnosis" type="text" placeholder="التشخيص" className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإنشاء..." : "إنشاء"}
      </button>
    </form>
  );
}
