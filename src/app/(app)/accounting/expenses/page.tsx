import { createClient } from "@/lib/supabase/server";
import ExpenseForm from "./ExpenseForm";

const categoryLabels: Record<string, string> = {
  rent: "إيجار",
  utilities: "خدمات (كهرباء/ماء)",
  salaries: "رواتب",
  commission: "عمولات",
  supplies: "مستلزمات",
  maintenance: "صيانة",
  other: "أخرى",
};

export default async function ExpensesPage() {
  const supabase = await createClient();

  const [{ data: expenses }, { data: accounts }] = await Promise.all([
    supabase
      .from("expenses")
      .select("id, expense_no, category, payee, amount, expense_date")
      .order("expense_date", { ascending: false }),
    supabase.from("chart_of_accounts").select("id, code, name, type").eq("is_active", true).order("code"),
  ]);

  const expenseAccounts = (accounts ?? []).filter((a) => a.type === "expense");
  const cashAccounts = (accounts ?? []).filter((a) => a.type === "asset");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{expenses?.length ?? 0} مصروف</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">المصروفات</h1>
      </div>

      <ExpenseForm expenseAccounts={expenseAccounts} cashAccounts={cashAccounts} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">رقم المصروف</th>
              <th className="px-4 py-2.5 font-medium">الفئة</th>
              <th className="px-4 py-2.5 font-medium">الجهة</th>
              <th className="px-4 py-2.5 font-medium">المبلغ</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {expenses?.length ? (
              expenses.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-ink">{e.expense_no}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{categoryLabels[e.category] ?? e.category}</td>
                  <td className="px-4 py-2.5 text-ink">{e.payee ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-danger">{e.amount}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {new Date(e.expense_date).toLocaleDateString("ar-SY-u-nu-latn")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  ما في مصروفات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
