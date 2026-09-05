"use client";

import { useTransition } from "react";
import { updateStaffStatus } from "../actions";

export default function StaffStatusToggle({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const disabled = status === "disabled";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => updateStaffStatus(id, disabled ? "active" : "disabled"))}
      className={`self-start rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
        disabled ? "border-primary text-primary-strong" : "border-border text-ink-muted hover:border-danger hover:text-danger"
      }`}
    >
      {pending ? "..." : disabled ? "تفعيل الموظف" : "تعطيل الموظف"}
    </button>
  );
}
