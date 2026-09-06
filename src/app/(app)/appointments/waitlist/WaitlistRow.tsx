"use client";

import { useTransition } from "react";
import { toggleNotified, removeFromWaitlist } from "./actions";

export default function WaitlistRow({ id, notified }: { id: string; notified: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleNotified(id, !notified))}
        className="text-xs text-primary-strong underline underline-offset-2 disabled:opacity-50"
      >
        {notified ? "إلغاء التبليغ" : "تعليم كمُبلَّغ"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => removeFromWaitlist(id))}
        className="text-xs text-danger underline underline-offset-2 disabled:opacity-50"
      >
        حذف
      </button>
    </div>
  );
}
