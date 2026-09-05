import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RecallCompleteButton from "./RecallCompleteButton";

export default async function FollowUpsPage() {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const [{ data: recalls }, { data: invoices }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, recall_date, patients!inner(id, name, appointment_reminders_enabled)")
      .is("deleted_at", null)
      .eq("recall_completed", false)
      .eq("patients.appointment_reminders_enabled", true)
      .not("recall_date", "is", null)
      .lte("recall_date", today)
      .order("recall_date", { ascending: true }),
    supabase
      .from("invoices")
      .select("id, invoice_no, total_amount, paid_amount, status, created_at, patients!inner(id, name, payment_reminders_enabled)")
      .is("deleted_at", null)
      .in("status", ["unpaid", "partial"])
      .eq("patients.payment_reminders_enabled", true)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">متابعة دورية</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">المتابعة الدورية</h1>
        <p className="mt-1 text-sm text-ink-muted">
          قائمة عمل يومية — مواعيد تحتاج متابعة ودفعات متأخرة. هذي القائمة للاستخدام اليدوي (اتصال/رسالة) وما ترسل
          تلقائياً.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">متابعة المواعيد (Recall)</h2>
        {recalls?.length ? (
          <table className="w-full text-right text-sm">
            <thead className="text-ink-muted">
              <tr>
                <th className="pb-2 font-medium">المريض</th>
                <th className="pb-2 font-medium">تاريخ المتابعة المستحق</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recalls.map((r) => {
                const patient = r.patients as unknown as { id: string; name: string } | null;
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 text-ink">
                      {patient ? (
                        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                          {patient.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 font-mono text-danger">{r.recall_date}</td>
                    <td className="py-2">
                      <RecallCompleteButton id={r.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-ink-muted">ما في مواعيد تحتاج متابعة حالياً</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">متابعة الدفعات المتأخرة</h2>
        {invoices?.length ? (
          <table className="w-full text-right text-sm">
            <thead className="text-ink-muted">
              <tr>
                <th className="pb-2 font-medium">المريض</th>
                <th className="pb-2 font-medium">الفاتورة</th>
                <th className="pb-2 font-medium">المتبقي</th>
                <th className="pb-2 font-medium">منذ</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const patient = inv.patients as unknown as { id: string; name: string } | null;
                const daysAgo = Math.floor(
                  (now.getTime() - new Date(inv.created_at).getTime()) / (1000 * 60 * 60 * 24),
                );
                return (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="py-2 text-ink">
                      {patient ? (
                        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                          {patient.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 font-mono text-ink">
                      <Link href={`/invoices/${inv.id}`} className="underline underline-offset-2">
                        {inv.invoice_no}
                      </Link>
                    </td>
                    <td className="py-2 font-mono text-danger">{inv.total_amount - inv.paid_amount}</td>
                    <td className="py-2 font-mono text-ink-muted">{daysAgo} يوم</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-ink-muted">ما في دفعات متأخرة تحتاج متابعة حالياً</p>
        )}
      </div>
    </div>
  );
}
