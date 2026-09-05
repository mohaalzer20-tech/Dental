"use client";

import { useState, useTransition } from "react";
import { updateDiscount } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function DiscountForm({ invoiceId, discountAmount }: { invoiceId: string; discountAmount: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(discountAmount));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-ink-muted underline underline-offset-2"
      >
        تعديل الخصم
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-28 ${inputClass}`}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await updateDiscount(invoiceId, Number(value) || 0);
                setError(null);
                setEditing(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "تعذر تحديث الخصم");
              }
            })
          }
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {pending ? "..." : "حفظ"}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(false);
          }}
          className="text-xs text-ink-muted underline underline-offset-2"
        >
          إلغاء
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
