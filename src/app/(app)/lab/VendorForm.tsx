"use client";

import { useActionState, useRef, useEffect } from "react";
import { addLabVendor } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function VendorForm() {
  const [state, formAction, pending] = useActionState(addLabVendor, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">إضافة مخبر جديد</label>
        <input name="name" type="text" placeholder="اسم المخبر" required className={inputClass} />
      </div>
      <input name="phone" type="tel" placeholder="الهاتف" className={inputClass} />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "..." : "إضافة"}
      </button>
    </form>
  );
}
