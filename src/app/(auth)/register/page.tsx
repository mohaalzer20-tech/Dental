"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-ink">إنشاء حساب عيادة جديد</h1>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="doctor_name" className="text-sm text-ink-muted">
          اسم الطبيب
        </label>
        <input
          id="doctor_name"
          name="doctor_name"
          type="text"
          required
          className="rounded-lg border border-border bg-bg px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-ink-muted">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-border bg-bg px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-ink-muted">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
        />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary py-2 font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإنشاء..." : "إنشاء الحساب"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        عندك حساب؟{" "}
        <Link href="/login" className="font-medium text-primary-strong underline underline-offset-2">
          سجّل دخول
        </Link>
      </p>
    </form>
  );
}
