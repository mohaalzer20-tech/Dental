"use client";

import { useActionState, useRef, useEffect } from "react";
import { addExpense } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Account = { id: string; code: string; name: string };

export default function ExpenseForm({
  expenseAccounts,
  cashAccounts,
}: {
  expenseAccounts: Account[];
  cashAccounts: Account[];
}) {
  const [state, formAction, pending] = useActionState(addExpense, null);
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
      <h2 className="text-sm font-semibold text-ink">تسجيل مصروف</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select name="category" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            الفئة
          </option>
          <option value="rent">إيجار</option>
          <option value="utilities">خدمات (كهرباء/ماء)</option>
          <option value="salaries">رواتب</option>
          <option value="commission">عمولات</option>
          <option value="supplies">مستلزمات</option>
          <option value="maintenance">صيانة</option>
          <option value="other">أخرى</option>
        </select>
        <input name="payee" type="text" placeholder="الجهة المستفيدة" className={inputClass} />
        <input name="amount" type="number" step="0.01" placeholder="المبلغ" required className={inputClass} />
        <input name="expense_date" type="date" className={inputClass} />
        <select name="payment_method" defaultValue="cash" className={inputClass}>
          <option value="cash">نقداً</option>
          <option value="card">بطاقة</option>
          <option value="transfer">تحويل</option>
          <option value="other">أخرى</option>
        </select>
        <select name="expense_account_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            حساب المصروف
          </option>
          {expenseAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} - {a.name}
            </option>
          ))}
        </select>
        <select name="cash_or_bank_account_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            صُرف من حساب
          </option>
          {cashAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} - {a.name}
            </option>
          ))}
        </select>
        <input name="notes" type="text" placeholder="ملاحظات" className={`sm:col-span-2 ${inputClass}`} />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري التسجيل..." : "تسجيل المصروف"}
      </button>
    </form>
  );
}
