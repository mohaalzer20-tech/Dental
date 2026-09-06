"use client";

import { useState, useTransition } from "react";
import { updateSupplier } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  contact_person: string | null;
  email: string | null;
  address: string | null;
  payment_terms: string | null;
};

export default function SupplierEditForm({ supplier }: { supplier: Supplier }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSupplier(null, formData);
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
      <input type="hidden" name="id" value={supplier.id} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="name" defaultValue={supplier.name} placeholder="الاسم" required className={inputClass} />
        <input name="phone" defaultValue={supplier.phone ?? ""} placeholder="الهاتف" className={inputClass} />
        <input
          name="contact_person"
          defaultValue={supplier.contact_person ?? ""}
          placeholder="المسؤول"
          className={inputClass}
        />
        <input name="email" type="email" defaultValue={supplier.email ?? ""} placeholder="الإيميل" className={inputClass} />
        <input name="address" defaultValue={supplier.address ?? ""} placeholder="العنوان" className={inputClass} />
        <input
          name="payment_terms"
          defaultValue={supplier.payment_terms ?? ""}
          placeholder="شروط الدفع"
          className={inputClass}
        />
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
