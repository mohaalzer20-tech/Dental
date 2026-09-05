import { createClient } from "@/lib/supabase/server";

const typeLabels: Record<string, string> = {
  asset: "أصول",
  liability: "خصوم",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

export default async function TrialBalancePage() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: lines }] = await Promise.all([
    supabase.from("chart_of_accounts").select("id, code, name, type").order("code"),
    supabase.from("journal_entry_lines").select("account_id, debit, credit"),
  ]);

  const totals = new Map<string, { debit: number; credit: number }>();
  for (const l of lines ?? []) {
    const t = totals.get(l.account_id) ?? { debit: 0, credit: 0 };
    t.debit += Number(l.debit);
    t.credit += Number(l.credit);
    totals.set(l.account_id, t);
  }

  const rows = (accounts ?? [])
    .map((a) => ({ ...a, ...(totals.get(a.id) ?? { debit: 0, credit: 0 }) }))
    .filter((r) => r.debit > 0 || r.credit > 0);
  const grandDebit = rows.reduce((s, r) => s + r.debit, 0);
  const grandCredit = rows.reduce((s, r) => s + r.credit, 0);
  const balanced = Math.abs(grandDebit - grandCredit) < 0.01;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">التقارير المالية</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">ميزان المراجعة</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الرمز</th>
              <th className="px-4 py-2.5 font-medium">الحساب</th>
              <th className="px-4 py-2.5 font-medium">النوع</th>
              <th className="px-4 py-2.5 font-medium">مدين</th>
              <th className="px-4 py-2.5 font-medium">دائن</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-ink">{r.code}</td>
                  <td className="px-4 py-2.5 text-ink">{r.name}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{typeLabels[r.type] ?? r.type}</td>
                  <td className="px-4 py-2.5 font-mono text-ink">{r.debit > 0 ? r.debit.toFixed(2) : "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink">{r.credit > 0 ? r.credit.toFixed(2) : "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  ما في حركات محاسبية بعد
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-surface-alt">
              <td className="px-4 py-2.5 font-medium text-ink" colSpan={3}>
                الإجمالي
              </td>
              <td className="px-4 py-2.5 font-mono font-medium text-primary-strong">{grandDebit.toFixed(2)}</td>
              <td className="px-4 py-2.5 font-mono font-medium text-primary-strong">{grandCredit.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!balanced && rows.length > 0 && (
        <p className="text-sm text-danger">تحذير: الميزان غير متوازن — راجع القيود.</p>
      )}
    </div>
  );
}
