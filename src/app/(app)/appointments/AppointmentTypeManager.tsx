"use client";

import { useActionState, useState, useTransition } from "react";
import { addAppointmentType, deleteAppointmentType } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type AppointmentType = { id: string; name: string; color: string; default_duration_minutes: number };

export default function AppointmentTypeManager({ types }: { types: AppointmentType[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addAppointmentType, null);
  const [, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm text-ink-muted underline underline-offset-2"
      >
        إدارة أنواع المواعيد ({types.length})
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">أنواع المواعيد</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-muted underline">
          إغلاق
        </button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {types.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-ink"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
            {t.name} ({t.default_duration_minutes} د)
            <button
              type="button"
              onClick={() => startTransition(() => deleteAppointmentType(t.id))}
              className="text-danger"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input name="name" type="text" placeholder="اسم النوع" required className={inputClass} />
        <input
          name="default_duration_minutes"
          type="number"
          defaultValue={30}
          placeholder="المدة (دقيقة)"
          className={inputClass}
        />
        <input name="color" type="color" defaultValue="#22d3ee" className="h-10 w-14 rounded-lg border border-border bg-bg" />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {pending ? "..." : "إضافة"}
        </button>
      </form>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </div>
  );
}
