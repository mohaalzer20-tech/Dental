"use client";

import { useActionState, useRef, useState } from "react";
import { createJournalEntry } from "./actions";
import StatusPill from "@/components/StatusPill";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Account = { id: string; code: string; name: string };
type Line = { account_id: string; debit: string; credit: string; description: string };

const emptyLine = (): Line => ({ account_id: "", debit: "", credit: "", description: "" });

export default function JournalEntryForm({ accounts }: { accounts: Account[] }) {
  const [state, formAction, pending] = useActionState(createJournalEntry, null);
  const [lines, setLines] = useState<Line[]>([emptyLine(), emptyLine()]);
  const [showHelp, setShowHelp] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced =
    lines.some((l) => l.account_id) && Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const linesPayload = JSON.stringify(
    lines
      .filter((l) => l.account_id)
      .map((l) => ({
        account_id: l.account_id,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description || null,
      })),
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">قيد جديد</h2>
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="text-xs text-primary-strong underline underline-offset-2"
        >
          {showHelp ? "إخفاء الشرح" : "؟ شو يعني مدين ودائن"}
        </button>
      </div>

      {showHelp && (
        <div className="rounded-lg border border-border bg-surface-alt p-3 text-xs leading-relaxed text-ink-muted">
          <p className="mb-1 font-medium text-ink">مثال بسيط: استلمت 500 نقداً من مريض كدفعة</p>
          <p>
            <span className="text-primary-strong">مدين</span> (الحساب اللي زادت فيه المصاري عندك): الصندوق — 500
          </p>
          <p>
            <span className="text-primary-strong">دائن</span> (الحساب اللي يوضّح مصدر هالمبلغ): إيرادات الخدمات — 500
          </p>
          <p className="mt-1">
            القاعدة العامة: كل قيد لازم يكون فيه سطر مدين وسطر دائن على الأقل، ومجموع المدين = مجموع الدائن. أغلب
            القيود (الدفعات، المصروفات) تتسجل تلقائياً — هاي الصفحة للحالات الاستثنائية فقط.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="entry_date" type="date" className={inputClass} />
        <input name="memo" type="text" placeholder="بيان القيد" className={inputClass} />
      </div>

      <div className="flex flex-col gap-2">
        {lines.map((line, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_2fr_auto]">
            <select
              value={line.account_id}
              onChange={(e) => updateLine(i, { account_id: e.target.value })}
              className={`col-span-2 sm:col-span-1 ${inputClass}`}
            >
              <option value="">اختر الحساب</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="مدين"
              value={line.debit}
              onChange={(e) => updateLine(i, { debit: e.target.value, credit: e.target.value ? "" : line.credit })}
              className={inputClass}
            />
            <input
              type="number"
              step="0.01"
              placeholder="دائن"
              value={line.credit}
              onChange={(e) => updateLine(i, { credit: e.target.value, debit: e.target.value ? "" : line.debit })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="وصف السطر"
              value={line.description}
              onChange={(e) => updateLine(i, { description: e.target.value })}
              className={`col-span-2 sm:col-span-1 ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => removeLine(i)}
              disabled={lines.length <= 2}
              className="rounded-lg border border-border px-3 py-2 text-sm text-ink-muted hover:text-danger disabled:opacity-40"
            >
              حذف
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLines((prev) => [...prev, emptyLine()])}
        className="self-start rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-alt"
      >
        + إضافة سطر
      </button>

      <div className="flex flex-wrap items-center gap-6 border-t border-border pt-3 text-sm">
        <p className="text-ink-muted">
          إجمالي المدين: <span className="font-mono text-ink">{totalDebit.toFixed(2)}</span>
        </p>
        <p className="text-ink-muted">
          إجمالي الدائن: <span className="font-mono text-ink">{totalCredit.toFixed(2)}</span>
        </p>
        <StatusPill tone={balanced ? "primary" : "danger"}>{balanced ? "القيد متوازن ✓" : "القيد غير متوازن"}</StatusPill>
      </div>

      <input type="hidden" name="lines" value={linesPayload} />

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !balanced}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الترحيل..." : "ترحيل القيد"}
      </button>
    </form>
  );
}
