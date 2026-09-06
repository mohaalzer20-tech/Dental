"use client";

import { useState, useTransition } from "react";
import { updatePatient } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Patient = {
  id: string;
  name: string;
  phone: string | null;
  dob: string | null;
  national_id: string | null;
  notes: string | null;
};

export default function PatientEditForm({ patient }: { patient: Patient }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updatePatient(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        setEditing(false);
      }
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="self-start rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-alt"
      >
        تعديل البيانات
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-surface-alt p-4">
      <input type="hidden" name="id" value={patient.id} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="name" defaultValue={patient.name} placeholder="الاسم" required className={inputClass} />
        <input name="phone" defaultValue={patient.phone ?? ""} placeholder="رقم الهاتف" className={inputClass} />
        <input name="dob" type="date" defaultValue={patient.dob ?? ""} className={inputClass} />
        <input
          name="national_id"
          defaultValue={patient.national_id ?? ""}
          placeholder="رقم الهوية"
          className={inputClass}
        />
        <input name="notes" defaultValue={patient.notes ?? ""} placeholder="ملاحظات" className={inputClass} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {pending ? "جاري الحفظ..." : "حفظ"}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(false);
          }}
          className="rounded-lg border border-border px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-alt"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
