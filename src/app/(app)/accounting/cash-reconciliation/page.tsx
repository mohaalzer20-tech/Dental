import { createClient } from "@/lib/supabase/server";
import StatusPill from "@/components/StatusPill";
import ReconciliationForm from "./ReconciliationForm";

export default async function CashReconciliationPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;

  const [{ data: cashPayments }, { data: existing }, { data: history }] = await Promise.all([
    supabase
      .from("payments")
      .select("amount")
      .eq("method", "cash")
      .gte("paid_at", todayStart)
      .lte("paid_at", todayEnd),
    supabase.from("cash_reconciliations").select("id, actual_amount, notes").eq("work_date", today).maybeSingle(),
    supabase
      .from("cash_reconciliations")
      .select("work_date, expected_amount, actual_amount, variance")
      .order("work_date", { ascending: false })
      .limit(14),
  ]);

  const expectedToday = (cashPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">المحاسبة</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">التسوية النقدية اليومية</h1>
      </div>

      <ReconciliationForm workDate={today} expectedAmount={expectedToday} existingActual={existing?.actual_amount ?? null} existingNotes={existing?.notes ?? ""} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">آخر التسويات</h2>
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
              <th className="px-4 py-2.5 font-medium">المتوقع</th>
              <th className="px-4 py-2.5 font-medium">الفعلي</th>
              <th className="px-4 py-2.5 font-medium">الفرق</th>
            </tr>
          </thead>
          <tbody>
            {history?.length ? (
              history.map((h) => (
                <tr key={h.work_date} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-ink">{h.work_date}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{h.expected_amount}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{h.actual_amount ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <StatusPill tone={Number(h.variance) === 0 ? "primary" : "danger"}>{h.variance}</StatusPill>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-muted">
                  ما في تسويات سابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
