"use client";

import { useTransition } from "react";
import { togglePaymentReminders } from "../actions";

export default function PaymentReminderToggle({ id, enabled }: { id: string; enabled: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => togglePaymentReminders(id, !enabled))}
      className={`self-start rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
        enabled
          ? "border-border text-ink-muted hover:border-danger hover:text-danger"
          : "border-primary text-primary-strong"
      }`}
    >
      {pending ? "..." : enabled ? "إيقاف متابعة الدفعات" : "تفعيل متابعة الدفعات"}
    </button>
  );
}
