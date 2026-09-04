"use client";

import { useActionState, useRef, useEffect } from "react";
import { addPurchaseOrderItem } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Item = { id: string; name: string };

export default function POItemForm({ poId, items }: { poId: string; items: Item[] }) {
  const [state, formAction, pending] = useActionState(addPurchaseOrderItem, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="purchase_order_id" value={poId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        <input name="quantity" type="number" step="0.01" placeholder="الكمية" required className={inputClass} />
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
