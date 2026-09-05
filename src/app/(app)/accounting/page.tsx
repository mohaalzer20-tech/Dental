import { createClient } from "@/lib/supabase/server";

export default async function AccountingOverviewPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const [{ data: accounts }, { data: allLines }, { data: monthLines }] = await Promise.all([
    supabase.from("chart_of_accounts").select("id, type"),
    supabase.from("journal_entry_lines").select("account_id, debit, credit"),
    supabase
      .from("journal_entry_lines")
      .select("account_id, debit, credit, journal_entries!inner(entry_date)")
      .gte("journal_entries.entry_date", monthStart),
  ]);

  const typeOf = new Map((accounts ?? []).map((a) => [a.id, a.type]));

  function sumCash(rows: { account_id: string; debit: number; credit: number }[]) {
    let cash = 0;
    for (const l of rows) {
      if (typeOf.get(l.account_id) === "asset") cash += Number(l.debit) - Number(l.credit);
    }
    return cash;
  }

  function sumRevenueExpense(rows: { account_id: string; debit: number; credit: number }[]) {
    let revenue = 0;
    let expense = 0;
    for (const l of rows) {
      const t = typeOf.get(l.account_id);
      if (t === "revenue") revenue += Number(l.credit) - Number(l.debit);
      if (t === "expense") expense += Number(l.debit) - Number(l.credit);
    }
    return { revenue, expense };
  }

  const cashBalance = sumCash(allLines ?? []);
  const { revenue: monthRevenue, expense: monthExpense } = sumRevenueExpense(monthLines ?? []);
  const netIncome = monthRevenue - monthExpense;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">المحاسبة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">نظرة عامة</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="رصيد النقدية والبنك" value={cashBalance} />
        <StatCard label="إيرادات الشهر" value={monthRevenue} tone="positive" />
        <StatCard label="مصروفات الشهر" value={monthExpense} tone="negative" />
        <StatCard label="صافي دخل الشهر" value={netIncome} tone={netIncome >= 0 ? "positive" : "negative"} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "positive" | "negative" | "neutral";
}) {
  const color = tone === "positive" ? "text-primary-strong" : tone === "negative" ? "text-danger" : "text-ink";
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-medium ${color}`}>{value.toFixed(2)}</p>
    </div>
  );
}
