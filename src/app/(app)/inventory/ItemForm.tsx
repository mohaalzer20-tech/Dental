"use client";

import { useActionState, useRef, useEffect } from "react";
import { addItem } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function ItemForm() {
  const [state, formAction, pending] = useActionState(addItem, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">إضافة صنف جديد</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input name="name" type="text" placeholder="اسم الصنف" required className={inputClass} />
        <input name="unit" type="text" placeholder="الوحدة (قطعة/علبة...)" className={inputClass} />
        <input name="minimum_stock" type="number" step="0.01" placeholder="الحد الأدنى" className={inputClass} />
        <input name="purchase_price" type="number" step="0.01" placeholder="سعر الشراء" className={inputClass} />
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
