"use client";

import { useActionState } from "react";
import { acceptStaffInvite } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptStaffInvite, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-ink-muted">كلمة المرور الجديدة</label>
        <input name="password" type="password" required minLength={8} className={inputClass} />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary py-2 font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري التفعيل..." : "تفعيل الحساب"}
      </button>
    </form>
  );
}
