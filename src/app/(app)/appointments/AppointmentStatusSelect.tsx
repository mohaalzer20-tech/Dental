"use client";

import { useTransition } from "react";
import { updateAppointmentStatus } from "./actions";
import { appointmentStatuses, appointmentStatusBadgeClass } from "./statusStyles";

export default function AppointmentStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateAppointmentStatus(id, e.target.value))}
      className={`rounded-lg border px-2 py-1 text-xs outline-none focus:border-primary ${appointmentStatusBadgeClass(status)}`}
    >
      {appointmentStatuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
