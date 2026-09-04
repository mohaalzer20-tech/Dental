"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTemplate } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function TemplateForm() {
  const [state, formAction, pending] = useActionState(addTemplate, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">قوالب الرسائل (طبيب فقط)</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="name" type="text" placeholder="اسم القالب" required className={inputClass} />
        <select name="channel" defaultValue="sms" className={inputClass}>
          <option value="sms">SMS</option>
          <option value="whatsapp">واتساب</option>
          <option value="email">بريد إلكتروني</option>
        </select>
        <input name="body" type="text" placeholder="نص القالب" required className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإضافة..." : "إضافة قالب"}
      </button>
    </form>
  );
}
