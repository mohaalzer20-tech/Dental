"use client";

import { useActionState, useRef, useEffect } from "react";
import { addInvoiceItem } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function ItemForm({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, pending] = useActionState(addInvoiceItem, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input name="description" type="text" placeholder="الوصف" required className={`sm:col-span-2 ${inputClass}`} />
        <input name="quantity" type="number" min="1" defaultValue="1" placeholder="الكمية" className={inputClass} />
        <input name="unit_price" type="number" step="0.01" placeholder="سعر الوحدة" required className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإضافة..." : "إضافة بند"}
      </button>
    </form>
  );
}
