"use client";

import { useTransition } from "react";

export default function DeleteButton({
  action,
  confirmMessage = "متأكد إنك تبي تحذف هذا العنصر؟",
  label = "حذف",
  className,
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await action();
        });
      }}
      className={
        className ??
        "rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
      }
    >
      {pending ? "جاري الحذف..." : label}
    </button>
  );
}
