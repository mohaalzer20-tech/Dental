import { createClient } from "@/lib/supabase/server";

export default async function IncomeStatementPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("chart_of_accounts")
    .select("id, code, name, type")
    .in("type", ["revenue", "expense"]);

  let linesQuery = supabase
    .from("journal_entry_lines")
    .select("account_id, debit, credit, journal_entries!inner(entry_date)");
  if (from) linesQuery = linesQuery.gte("journal_entries.entry_date", from);
  if (to) linesQuery = linesQuery.lte("journal_entries.entry_date", to);
  const { data: lines } = await linesQuery;

  const accountsById = new Map((accounts ?? []).map((a) => [a.id, a]));
  const totals = new Map<string, number>();
  for (const l of lines ?? []) {
    const acc = accountsById.get(l.account_id);
    if (!acc) continue;
    const amount = acc.type === "revenue" ? Number(l.credit) - Number(l.debit) : Number(l.debit) - Number(l.credit);
    totals.set(l.account_id, (totals.get(l.account_id) ?? 0) + amount);
  }

  const revenueAccounts = (accounts ?? []).filter((a) => a.type === "revenue");
  const expenseAccounts = (accounts ?? []).filter((a) => a.type === "expense");
  const totalRevenue = revenueAccounts.reduce((s, a) => s + (totals.get(a.id) ?? 0), 0);
  const totalExpense = expenseAccounts.reduce((s, a) => s + (totals.get(a.id) ?? 0), 0);
  const netIncome = totalRevenue - totalExpense;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">التقارير المالية</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">قائمة الدخل</h1>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-5">
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          من تاريخ
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          إلى تاريخ
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong"
        >
          تطبيق
        </button>
      </form>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">الإيرادات</h2>
        {revenueAccounts.map((a) => (
          <div key={a.id} className="flex justify-between border-t border-border py-2 text-sm">
            <span className="text-ink">{a.name}</span>
            <span className="font-mono text-ink">{(totals.get(a.id) ?? 0).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
          <span className="text-ink">إجمالي الإيرادات</span>
          <span className="font-mono text-primary-strong">{totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">المصروفات</h2>
        {expenseAccounts.map((a) => (
          <div key={a.id} className="flex justify-between border-t border-border py-2 text-sm">
            <span className="text-ink">{a.name}</span>
            <span className="font-mono text-ink">{(totals.get(a.id) ?? 0).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
          <span className="text-ink">إجمالي المصروفات</span>
          <span className="font-mono text-danger">{totalExpense.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex justify-between text-base font-bold">
          <span className="text-ink">صافي الدخل</span>
          <span className={`font-mono ${netIncome >= 0 ? "text-primary-strong" : "text-danger"}`}>
            {netIncome.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
