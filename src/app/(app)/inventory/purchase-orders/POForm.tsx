"use client";

import { useActionState } from "react";
import { addPurchaseOrder } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Supplier = { id: string; name: string };

export default function POForm({ suppliers }: { suppliers: Supplier[] }) {
  const [state, formAction, pending] = useActionState(addPurchaseOrder, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">إنشاء أمر شراء جديد</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select name="supplier_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            اختر المورد
          </option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
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
