import { createClient } from "@/lib/supabase/server";
import TransactionForm from "./TransactionForm";

const typeLabels: Record<string, string> = {
  purchase: "شراء",
  sale: "استخدام/بيع",
  adjustment_in: "تسوية زيادة",
  adjustment_out: "تسوية نقص",
  damaged: "تالف",
  expired: "منتهي الصلاحية",
  returned: "إرجاع",
  consumption: "استهلاك سريري",
};

export default async function TransactionsPage() {
  const supabase = await createClient();

  const [{ data: transactions }, { data: items }] = await Promise.all([
    supabase
      .from("stock_transactions")
      .select("id, type, quantity, previous_stock, new_stock, notes, transaction_date, inventory_items(name)")
      .order("transaction_date", { ascending: false })
      .limit(100),
    supabase.from("inventory_items").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{transactions?.length ?? 0} حركة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">حركات المخزون</h1>
      </div>

      <TransactionForm items={items ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الصنف</th>
              <th className="px-4 py-2.5 font-medium">النوع</th>
              <th className="px-4 py-2.5 font-medium">الكمية</th>
              <th className="px-4 py-2.5 font-medium">قبل → بعد</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.length ? (
              transactions.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    {(t.inventory_items as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{typeLabels[t.type] ?? t.type}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{t.quantity}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {t.previous_stock} → {t.new_stock}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {new Date(t.transaction_date).toLocaleDateString("ar-SY")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  ما في حركات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
