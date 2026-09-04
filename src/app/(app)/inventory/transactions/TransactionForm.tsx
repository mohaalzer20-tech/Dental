"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTransaction } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

const types = [
  { value: "purchase", label: "شراء (زيادة)" },
  { value: "adjustment_in", label: "تسوية زيادة" },
  { value: "returned", label: "إرجاع للمخزون" },
  { value: "sale", label: "استخدام/بيع (نقص)" },
  { value: "adjustment_out", label: "تسوية نقص" },
  { value: "damaged", label: "تالف" },
  { value: "expired", label: "منتهي الصلاحية" },
  { value: "consumption", label: "استهلاك سريري" },
];

type Item = { id: string; name: string };

export default function TransactionForm({ items }: { items: Item[] }) {
  const [state, formAction, pending] = useActionState(addTransaction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">تسجيل حركة مخزون</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <select name="item_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            الصنف
          </option>
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name}
            </option>
          ))}
        </select>
        <select name="type" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            نوع الحركة
          </option>
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input name="quantity" type="number" step="0.01" min="0.01" placeholder="الكمية" required className={inputClass} />
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
