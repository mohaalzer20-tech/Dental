"use client";

import { useActionState, useState } from "react";
import { inviteStaff } from "./actions";
import { buildWhatsappLink } from "@/lib/whatsappLink";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function InviteStaffForm() {
  const [state, formAction, pending] = useActionState(inviteStaff, null);
  const [phone, setPhone] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullInviteUrl = state?.inviteUrl ? origin + state.inviteUrl : "";
  const waHref =
    fullInviteUrl && phone
      ? buildWhatsappLink(phone, `تم إضافتك كموظف بالعيادة. لتفعيل حسابك افتح هذا الرابط: ${fullInviteUrl}`)
      : "";

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">دعوة موظف جديد</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="full_name" type="text" placeholder="الاسم الكامل" required className={inputClass} />
        <input name="email" type="email" placeholder="الإيميل" required className={inputClass} />
        <select name="role" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            الدور
          </option>
          <option value="assistant">مساعد / ممرضة</option>
          <option value="reception">استقبال / سكرتير</option>
          <option value="accountant">محاسب</option>
        </select>
        <input
          type="tel"
          placeholder="رقم واتساب الموظف (لإرسال الرابط فقط، ما بينحفظ)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإنشاء..." : "إنشاء رابط الدعوة"}
      </button>

      {fullInviteUrl && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-alt p-3 text-sm">
          <p className="text-ink-muted">رابط الدعوة (صالح 48 ساعة):</p>
          <code className="break-all font-mono text-primary-strong">{fullInviteUrl}</code>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(fullInviteUrl)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface"
            >
              نسخ الرابط
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!phone}
              className={`rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface ${
                !phone ? "pointer-events-none opacity-50" : ""
              }`}
            >
              إرسال عبر واتساب
            </a>
          </div>
        </div>
      )}
    </form>
  );
}
