"use client";

import { useTransition } from "react";
import { updateAppointmentStatus } from "./actions";

const statuses = [
  { value: "pending", label: "بانتظار التأكيد" },
  { value: "scheduled", label: "مجدول" },
  { value: "confirmed", label: "مؤكد" },
  { value: "completed", label: "منتهي" },
  { value: "cancelled", label: "ملغى" },
  { value: "no_show", label: "لم يحضر" },
];

export default function AppointmentStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateAppointmentStatus(id, e.target.value))}
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
