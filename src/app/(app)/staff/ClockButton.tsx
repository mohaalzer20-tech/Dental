"use client";

import { useTransition } from "react";
import { clockIn, clockOut } from "./actions";

export default function ClockButton({
  userId,
  checkedIn,
  checkedOut,
}: {
  userId: string;
  checkedIn: boolean;
  checkedOut: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (checkedOut) {
    return <span className="text-sm text-ink-muted">تم تسجيل انصرافك اليوم</span>;
  }

  if (checkedIn) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => clockOut(userId))}
        className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "..." : "تسجيل انصراف"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => clockIn(userId))}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
    >
      {pending ? "..." : "تسجيل حضور"}
    </button>
  );
}
