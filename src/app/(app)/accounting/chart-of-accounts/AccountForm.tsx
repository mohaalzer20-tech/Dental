"use client";

import { useActionState, useRef, useEffect } from "react";
import { addAccount } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function AccountForm() {
  const [state, formAction, pending] = useActionState(addAccount, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="text-sm font-semibold text-ink">إضافة حساب جديد</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="code" type="text" placeholder="الرمز (مثال: 5040)" required className={inputClass} />
        <input name="name" type="text" placeholder="اسم الحساب" required className={inputClass} />
        <select name="type" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            نوع الحساب
          </option>
          <option value="asset">أصول</option>
          <option value="liability">خصوم</option>
          <option value="equity">حقوق ملكية</option>
          <option value="revenue">إيرادات</option>
          <option value="expense">مصروفات</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإضافة..." : "إضافة الحساب"}
      </button>
    </form>
  );
}
