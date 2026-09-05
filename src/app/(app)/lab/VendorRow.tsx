"use client";

import { useState, useTransition } from "react";
import DeleteButton from "@/components/DeleteButton";
import { updateLabVendor, deleteLabVendor } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Vendor = { id: string; name: string; phone: string | null };

export default function VendorRow({ vendor }: { vendor: Vendor }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateLabVendor(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <tr className="border-t border-border">
        <td colSpan={3} className="px-4 py-3">
          <form action={handleSubmit} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={vendor.id} />
            <input name="name" defaultValue={vendor.name} required placeholder="الاسم" className={inputClass} />
            <input name="phone" defaultValue={vendor.phone ?? ""} placeholder="الهاتف" className={inputClass} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
            >
              {pending ? "..." : "حفظ"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setEditing(false);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-alt"
            >
              إلغاء
            </button>
            {error && <p className="w-full text-sm text-danger">{error}</p>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-2.5 text-ink">{vendor.name}</td>
      <td className="px-4 py-2.5 font-mono text-ink-muted">{vendor.phone ?? "—"}</td>
      <td className="px-4 py-2.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-alt"
          >
            تعديل
          </button>
          <DeleteButton action={deleteLabVendor.bind(null, vendor.id)} />
        </div>
      </td>
    </tr>
  );
}
