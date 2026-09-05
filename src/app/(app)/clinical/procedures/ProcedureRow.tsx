"use client";

import { useState, useTransition } from "react";
import DeleteButton from "@/components/DeleteButton";
import { updateProcedure, deleteProcedure } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Procedure = { id: string; name: string; category: string | null; base_price: number };

export default function ProcedureRow({ procedure }: { procedure: Procedure }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProcedure(null, formData);
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
        <td colSpan={4} className="px-4 py-3">
          <form action={handleSubmit} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={procedure.id} />
            <input name="name" defaultValue={procedure.name} required placeholder="الاسم" className={inputClass} />
            <input
              name="category"
              defaultValue={procedure.category ?? ""}
              placeholder="التصنيف"
              className={inputClass}
            />
            <input
              name="base_price"
              type="number"
              step="0.01"
              defaultValue={procedure.base_price}
              placeholder="السعر"
              className={inputClass}
            />
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
      <td className="px-4 py-2.5 text-ink">{procedure.name}</td>
      <td className="px-4 py-2.5 text-ink-muted">{procedure.category ?? "—"}</td>
      <td className="px-4 py-2.5 font-mono text-ink-muted">{procedure.base_price}</td>
      <td className="px-4 py-2.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-alt"
          >
            تعديل
          </button>
          <DeleteButton action={deleteProcedure.bind(null, procedure.id)} />
        </div>
      </td>
    </tr>
  );
}
