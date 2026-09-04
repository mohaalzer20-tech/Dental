"use client";

import { useActionState, useRef, useEffect } from "react";
import { queueMessage } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Patient = { id: string; name: string };

export default function MessageForm({ patients }: { patients: Patient[] }) {
  const [state, formAction, pending] = useActionState(queueMessage, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">إرسال رسالة</h2>
      <p className="text-xs text-ink-muted">
        ملاحظة: الإرسال الفعلي عبر SMS/WhatsApp يحتاج ربط حساب مزوّد خارجي — حالياً الرسائل تُحفظ بقائمة الانتظار فقط.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select name="patient_id" defaultValue="" className={inputClass}>
          <option value="">كل المرضى / بدون تحديد</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select name="channel" defaultValue="sms" className={inputClass}>
          <option value="sms">SMS</option>
          <option value="whatsapp">واتساب</option>
          <option value="email">بريد إلكتروني</option>
        </select>
        <input name="body" type="text" placeholder="نص الرسالة" required className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإضافة..." : "إضافة لقائمة الانتظار"}
      </button>
    </form>
  );
}
