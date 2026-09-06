import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import Avatar from "@/components/Avatar";
import StatusPill, { type StatusTone } from "@/components/StatusPill";
import SimpleBarChart from "@/components/SimpleBarChart";
import { CalendarIcon, UsersIcon, ClipboardIcon, ExpenseIcon } from "./NavLinks";
import { appointmentStatusLabels } from "./appointments/statusStyles";

const appointmentStatusTone: Record<string, StatusTone> = {
  pending: "accent",
  scheduled: "muted",
  confirmed: "primary",
  completed: "muted",
  cancelled: "danger",
  no_show: "danger",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: practice },
    { count: patientsCount },
    { data: todayAppointments },
    { count: pendingTreatmentsCount },
    { data: monthPayments },
    { data: monthTreatments },
    { data: stockAlerts },
    { count: overdueInvoicesCount },
  ] = await Promise.all([
    supabase.from("practices").select("doctor_name").single(),
    supabase.from("patients").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("appointments")
      .select("id, start_time, status, patients(name)")
      .gte("start_time", todayStart)
      .lt("start_time", todayEnd)
      .is("deleted_at", null)
      .order("start_time", { ascending: true }),
    supabase
      .from("treatment_plan_items")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("payments").select("amount").gte("paid_at", monthStart),
    supabase
      .from("treatments")
      .select("cost, procedures(category)")
      .gte("performed_at", monthStart)
      .is("deleted_at", null),
    supabase.from("v_stock_alerts").select("item_id").limit(1),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .in("status", ["unpaid", "partial"])
      .is("deleted_at", null),
  ]);

  const revenueMTD = (monthPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  const categoryTotals = new Map<string, number>();
  for (const t of monthTreatments ?? []) {
    const category = (t.procedures as unknown as { category: string } | null)?.category ?? "أخرى";
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + 1);
  }
  const totalTreatments = [...categoryTotals.values()].reduce((a, b) => a + b, 0);
  const treatmentMix = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({
      label,
      value: totalTreatments ? Math.round((count / totalTreatments) * 100) : 0,
    }));

  const hasStockAlert = (stockAlerts?.length ?? 0) > 0;
  const hasOverdueInvoices = (overdueInvoicesCount ?? 0) > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">لوحة التحكم</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">أهلاً {practice?.doctor_name ?? ""}</h1>
      </div>

      {(hasStockAlert || hasOverdueInvoices) && (
        <div className="flex flex-col gap-2 rounded-xl border border-danger bg-danger-bg p-4 text-sm text-danger">
          {hasStockAlert && (
            <Link href="/inventory" className="underline underline-offset-2">
              في أصناف بالمخزون تحتاج انتباه (كمية منخفضة أو قربت تنتهي صلاحيتها)
            </Link>
          )}
          {hasOverdueInvoices && (
            <Link href="/invoices" className="underline underline-offset-2">
              في {overdueInvoicesCount} فاتورة غير مدفوعة بالكامل
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/appointments"
          label="مواعيد اليوم"
          value={todayAppointments?.length ?? 0}
          accent="cyan"
          icon={<CalendarIcon className="h-4 w-4" />}
        />
        <StatCard
          href="/patients"
          label="عدد المرضى"
          value={patientsCount ?? 0}
          accent="violet"
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <StatCard
          href="/clinical/treatment-plans"
          label="معالجات معلّقة"
          value={pendingTreatmentsCount ?? 0}
          accent="pink"
          icon={<ClipboardIcon className="h-4 w-4" />}
        />
        <StatCard
          href="/invoices"
          label="إيرادات الشهر"
          value={revenueMTD.toFixed(0)}
          accent="green"
          icon={<ExpenseIcon className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">جدول اليوم</h2>
          {todayAppointments?.length ? (
            <ul className="flex flex-col gap-3">
              {todayAppointments.map((a, i) => {
                const patient = a.patients as unknown as { name: string } | null;
                return (
                  <li key={a.id} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 font-mono text-xs text-ink-muted">
                      {new Date(a.start_time).toLocaleTimeString("ar-SY-u-nu-latn", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Avatar name={patient?.name ?? "؟"} index={i} size="sm" />
                    <span className="flex-1 truncate text-sm text-ink">{patient?.name ?? "—"}</span>
                    <StatusPill tone={appointmentStatusTone[a.status] ?? "muted"}>
                      {appointmentStatusLabels[a.status] ?? a.status}
                    </StatusPill>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">ما في مواعيد اليوم</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">توزيع المعالجات</h2>
          {treatmentMix.length ? (
            <SimpleBarChart data={treatmentMix} />
          ) : (
            <p className="text-sm text-ink-muted">ما في معالجات مسجّلة هذا الشهر</p>
          )}
        </div>
      </div>
    </div>
  );
}
