"use client";

import { useActionState } from "react";
import { bookAppointment } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function BookingForm({ practiceId }: { practiceId: string }) {
  const [state, formAction, pending] = useActionState(bookAppointment, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="practice_id" value={practiceId} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-ink-muted">الاسم الكامل</label>
        <input name="patient_name" type="text" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-ink-muted">رقم الهاتف</label>
        <input name="patient_phone" type="tel" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-ink-muted">الوقت المفضّل</label>
        <input name="preferred_time" type="datetime-local" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-ink-muted">ملاحظات (اختياري)</label>
        <input name="notes" type="text" className={inputClass} />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary py-2 font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإرسال..." : "طلب حجز موعد"}
      </button>
    </form>
  );
}
