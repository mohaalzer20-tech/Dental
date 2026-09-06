"use client";

import { useActionState, useRef, useEffect, useTransition } from "react";
import StatusPill from "@/components/StatusPill";
import { addInstallment, toggleInstallmentPaid, deleteInstallment } from "./installmentActions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Installment = { id: string; due_date: string; amount: number; paid: boolean };

export default function InstallmentsPanel({
  invoiceId,
  installments,
}: {
  invoiceId: string;
  installments: Installment[];
}) {
  const [state, formAction, pending] = useActionState(addInstallment, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">خطة الأقساط</h2>
      {installments.length ? (
        <table className="w-full text-right text-sm">
          <thead className="text-ink-muted">
            <tr>
              <th className="pb-2 font-medium">تاريخ الاستحقاق</th>
              <th className="pb-2 font-medium">المبلغ</th>
              <th className="pb-2 font-medium">الحالة</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => {
              const overdue = !inst.paid && inst.due_date < today;
              return (
                <tr key={inst.id} className="border-t border-border">
                  <td className="py-2 font-mono text-ink-muted">{inst.due_date}</td>
                  <td className="py-2 font-mono text-ink">{inst.amount}</td>
                  <td className="py-2">
                    <StatusPill tone={inst.paid ? "primary" : overdue ? "danger" : "accent"}>
                      {inst.paid ? "مدفوع" : overdue ? "متأخر" : "مستحق"}
                    </StatusPill>
                  </td>
                  <td className="py-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startTransition(() => toggleInstallmentPaid(inst.id, invoiceId, !inst.paid))}
                      className="text-xs text-primary-strong underline underline-offset-2"
                    >
                      {inst.paid ? "إلغاء الدفع" : "تعليم كمدفوع"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startTransition(() => deleteInstallment(inst.id, invoiceId))}
                      className="text-xs text-danger underline underline-offset-2"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-ink-muted">ما في خطة أقساط لهذي الفاتورة</p>
      )}

      <form ref={formRef} action={formAction} className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
        <input type="hidden" name="invoice_id" value={invoiceId} />
        <input name="due_date" type="date" required className={inputClass} />
        <input name="amount" type="number" step="0.01" placeholder="المبلغ" required className={inputClass} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {pending ? "جاري الإضافة..." : "إضافة قسط"}
        </button>
        {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      </form>
    </div>
  );
}
