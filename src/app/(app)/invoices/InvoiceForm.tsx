"use client";

import { useActionState } from "react";
import { addInvoice } from "./actions";
import PatientSelect from "@/components/PatientSelect";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Patient = { id: string; name: string };
type Provider = { id: string; full_name: string };

export default function InvoiceForm({
  patients,
  providers,
  defaultPatientId,
}: {
  patients: Patient[];
  providers: Provider[];
  defaultPatientId?: string;
}) {
  const [state, formAction, pending] = useActionState(addInvoice, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">إنشاء فاتورة جديدة</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PatientSelect
          patients={patients}
          defaultPatientId={defaultPatientId}
          required
          className={inputClass}
          placeholder="ابحث عن المريض بالاسم"
        />
        <select name="provider_id" defaultValue="" className={inputClass}>
          <option value="">بدون طبيب محدد</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>
        <input
          name="discount_amount"
          type="number"
          step="0.01"
          placeholder="الخصم (اختياري)"
          className={inputClass}
        />
        <input name="notes" type="text" placeholder="ملاحظات" className={inputClass} />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإنشاء..." : "إنشاء الفاتورة"}
      </button>
    </form>
  );
}
