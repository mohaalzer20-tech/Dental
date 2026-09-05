"use client";

import { useState, useTransition } from "react";
import DeleteButton from "@/components/DeleteButton";
import { updateItem, deleteItem } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Item = {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  purchase_price: number;
};

export default function ItemRow({ item }: { item: Item }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateItem(null, formData);
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
        <td colSpan={6} className="px-4 py-3">
          <form action={handleSubmit} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={item.id} />
            <input name="name" defaultValue={item.name} required placeholder="الاسم" className={inputClass} />
            <input name="unit" defaultValue={item.unit} placeholder="الوحدة" className={inputClass} />
            <input
              name="minimum_stock"
              type="number"
              step="0.01"
              defaultValue={item.minimum_stock}
              placeholder="الحد الأدنى"
              className={inputClass}
            />
            <input
              name="purchase_price"
              type="number"
              step="0.01"
              defaultValue={item.purchase_price}
              placeholder="سعر الشراء"
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
      <td className="px-4 py-2.5 text-ink">{item.name}</td>
      <td className="px-4 py-2.5 text-ink-muted">{item.unit}</td>
      <td
        className={`px-4 py-2.5 font-mono ${item.current_stock <= item.minimum_stock ? "text-danger" : "text-ink"}`}
      >
        {item.current_stock}
      </td>
      <td className="px-4 py-2.5 font-mono text-ink-muted">{item.minimum_stock}</td>
      <td className="px-4 py-2.5 font-mono text-ink-muted">{item.purchase_price}</td>
      <td className="px-4 py-2.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-alt"
          >
            تعديل
          </button>
          <DeleteButton action={deleteItem.bind(null, item.id)} />
        </div>
      </td>
    </tr>
  );
}
