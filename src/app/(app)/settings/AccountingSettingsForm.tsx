"use client";

import { useActionState } from "react";
import { updateAccountingSettings } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Account = { id: string; code: string; name: string };

export default function AccountingSettingsForm({
  currency,
  cashAccountId,
  bankAccountId,
  revenueAccountId,
  assetAccounts,
  revenueAccounts,
}: {
  currency: string;
  cashAccountId: string | null;
  bankAccountId: string | null;
  revenueAccountId: string | null;
  assetAccounts: Account[];
  revenueAccounts: Account[];
}) {
  const [state, formAction, pending] = useActionState(updateAccountingSettings, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          العملة
          <input name="currency" type="text" defaultValue={currency} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          حساب النقدية الافتراضي
          <select name="default_cash_account_id" defaultValue={cashAccountId ?? ""} className={inputClass}>
            <option value="">بدون</option>
            {assetAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          حساب البنك الافتراضي
          <select name="default_bank_account_id" defaultValue={bankAccountId ?? ""} className={inputClass}>
            <option value="">بدون</option>
            {assetAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          حساب الإيرادات الافتراضي
          <select name="default_revenue_account_id" defaultValue={revenueAccountId ?? ""} className={inputClass}>
            <option value="">بدون</option>
            {revenueAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-ink-muted">
        هذه الحسابات تُستخدم لترحيل دفعات الفواتير تلقائياً إلى القيود اليومية.
      </p>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
