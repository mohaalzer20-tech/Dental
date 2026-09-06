"use client";

import { useTransition } from "react";
import { updatePlanStatus } from "../actions";

const statuses = [
  { value: "draft", label: "مسودة" },
  { value: "proposed", label: "مقترحة" },
  { value: "accepted", label: "مقبولة" },
  { value: "declined", label: "مرفوضة من المريض" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "completed", label: "منتهية" },
  { value: "cancelled", label: "ملغاة" },
];

export default function PlanStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updatePlanStatus(id, e.target.value))}
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
