"use client";

import { useTransition } from "react";
import { updateLabOrderStatus } from "./actions";

const statuses = [
  { value: "sent", label: "أُرسل" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "received", label: "تم الاستلام" },
  { value: "cancelled", label: "ملغى" },
];

export default function StatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateLabOrderStatus(orderId, e.target.value))}
      className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-primary"
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
