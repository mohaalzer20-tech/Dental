"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">تسجيل الدخول</h1>

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
          className="rounded-lg border border-border bg-bg px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
        />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary py-2 font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الدخول..." : "دخول"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        عيادة جديدة؟{" "}
        <Link href="/register" className="font-medium text-primary-strong underline underline-offset-2">
          أنشئ حساب
        </Link>
      </p>
    </form>
  );
}
