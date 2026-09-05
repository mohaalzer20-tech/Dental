import { createClient } from "@/lib/supabase/server";

export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ as_of?: string }>;
}) {
  const { as_of } = await searchParams;
  const asOf = as_of || new Date().toISOString().slice(0, 10);
  const supabase = await createClient();

  const { data: accounts } = await supabase.from("chart_of_accounts").select("id, code, name, type");
  const { data: lines } = await supabase
    .from("journal_entry_lines")
    .select("account_id, debit, credit, journal_entries!inner(entry_date)")
    .lte("journal_entries.entry_date", asOf);

  const accountsById = new Map((accounts ?? []).map((a) => [a.id, a]));
  const balances = new Map<string, number>();
  for (const l of lines ?? []) {
    const acc = accountsById.get(l.account_id);
    if (!acc) continue;
    const debitNormal = acc.type === "asset" || acc.type === "expense";
    const delta = debitNormal ? Number(l.debit) - Number(l.credit) : Number(l.credit) - Number(l.debit);
    balances.set(acc.id, (balances.get(acc.id) ?? 0) + delta);
  }

  const assets = (accounts ?? []).filter((a) => a.type === "asset");
  const liabilities = (accounts ?? []).filter((a) => a.type === "liability");
  const equity = (accounts ?? []).filter((a) => a.type === "equity");
  const revenue = (accounts ?? []).filter((a) => a.type === "revenue");
  const expense = (accounts ?? []).filter((a) => a.type === "expense");

  const totalAssets = assets.reduce((s, a) => s + (balances.get(a.id) ?? 0), 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + (balances.get(a.id) ?? 0), 0);
  const totalEquity = equity.reduce((s, a) => s + (balances.get(a.id) ?? 0), 0);
  const netIncomeToDate =
    revenue.reduce((s, a) => s + (balances.get(a.id) ?? 0), 0) -
    expense.reduce((s, a) => s + (balances.get(a.id) ?? 0), 0);
  const totalEquityWithEarnings = totalEquity + netIncomeToDate;
  const balanced = Math.abs(totalAssets - (totalLiabilities + totalEquityWithEarnings)) < 0.01;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">التقارير المالية</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">الميزانية العمومية</h1>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-5">
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          حتى تاريخ
          <input
            type="date"
            name="as_of"
            defaultValue={asOf}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">الأصول</h2>
          {assets.map((a) => (
            <div key={a.id} className="flex justify-between border-t border-border py-2 text-sm">
              <span className="text-ink">{a.name}</span>
              <span className="font-mono text-ink">{(balances.get(a.id) ?? 0).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
            <span className="text-ink">إجمالي الأصول</span>
            <span className="font-mono text-primary-strong">{totalAssets.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">الخصوم</h2>
            {liabilities.map((a) => (
              <div key={a.id} className="flex justify-between border-t border-border py-2 text-sm">
                <span className="text-ink">{a.name}</span>
                <span className="font-mono text-ink">{(balances.get(a.id) ?? 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
              <span className="text-ink">إجمالي الخصوم</span>
              <span className="font-mono text-ink">{totalLiabilities.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">حقوق الملكية</h2>
            {equity.map((a) => (
              <div key={a.id} className="flex justify-between border-t border-border py-2 text-sm">
                <span className="text-ink">{a.name}</span>
                <span className="font-mono text-ink">{(balances.get(a.id) ?? 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border py-2 text-sm">
              <span className="text-ink">الأرباح المرحلة (غير مقفلة)</span>
              <span className="font-mono text-ink">{netIncomeToDate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
              <span className="text-ink">إجمالي حقوق الملكية</span>
              <span className="font-mono text-ink">{totalEquityWithEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex justify-between text-sm">
          <span className="text-ink-muted">الأصول = الخصوم + حقوق الملكية</span>
          <span className={`font-mono font-semibold ${balanced ? "text-primary-strong" : "text-danger"}`}>
            {totalAssets.toFixed(2)} = {(totalLiabilities + totalEquityWithEarnings).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
