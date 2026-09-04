"use client";

import { useActionState, useRef, useEffect } from "react";
import { addPayment } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function PaymentForm({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, pending] = useActionState(addPayment, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input name="amount" type="number" step="0.01" placeholder="المبلغ" required className={inputClass} />
        <select name="method" defaultValue="cash" className={inputClass}>
          <option value="cash">نقداً</option>
          <option value="card">بطاقة</option>
          <option value="transfer">تحويل</option>
          <option value="other">أخرى</option>
        </select>
        <input name="notes" type="text" placeholder="ملاحظات" className={`sm:col-span-2 ${inputClass}`} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري التسجيل..." : "تسجيل دفعة"}
      </button>
    </form>
  );
}
