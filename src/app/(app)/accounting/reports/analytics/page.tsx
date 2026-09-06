import { createClient } from "@/lib/supabase/server";
import SimpleBarChart from "@/components/SimpleBarChart";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("ar-SY-u-nu-latn", { month: "short" });
}

export default async function AnalyticsReportPage() {
  const supabase = await createClient();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: payments },
    { data: monthTreatments },
    { data: patients },
    { data: monthAppointments },
    { data: providers },
  ] = await Promise.all([
    supabase.from("payments").select("amount, paid_at").gte("paid_at", sixMonthsAgo.toISOString()),
    supabase
      .from("treatments")
      .select("cost, doctor_id, procedures(name, category)")
      .gte("performed_at", monthStart)
      .is("deleted_at", null),
    supabase.from("patients").select("id, created_at").is("deleted_at", null),
    supabase.from("appointments").select("status").gte("start_time", monthStart).is("deleted_at", null),
    supabase.from("users").select("id, full_name"),
  ]);

  // Revenue by month (last 6 months)
  const revenueByMonth = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    revenueByMonth.set(monthKey(d), 0);
  }
  for (const p of payments ?? []) {
    const key = monthKey(new Date(p.paid_at));
    if (revenueByMonth.has(key)) revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(p.amount));
  }
  const revenueMonthData = [...revenueByMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, value]) => ({ label: monthLabel(key), value: Math.round(value) }));

  // Revenue by procedure (this month)
  const revenueByProcedure = new Map<string, number>();
  const providerNameById = new Map((providers ?? []).map((p) => [p.id, p.full_name]));
  const revenueByProvider = new Map<string, number>();
  for (const t of monthTreatments ?? []) {
    const proc = (t.procedures as unknown as { name: string; category: string } | null)?.name ?? "أخرى";
    revenueByProcedure.set(proc, (revenueByProcedure.get(proc) ?? 0) + Number(t.cost));
    const providerName = providerNameById.get(t.doctor_id) ?? "غير محدد";
    revenueByProvider.set(providerName, (revenueByProvider.get(providerName) ?? 0) + Number(t.cost));
  }
  const procedureData = [...revenueByProcedure.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value]) => ({ label, value: Math.round(value) }));

  // Patient new-vs-returning trend
  const newByMonth = new Map<string, number>();
  for (let i = 0; i < 6; i++) newByMonth.set(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)), 0);
  for (const p of patients ?? []) {
    const key = monthKey(new Date(p.created_at));
    if (newByMonth.has(key)) newByMonth.set(key, (newByMonth.get(key) ?? 0) + 1);
  }
  const newPatientsData = [...newByMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, value]) => ({ label: monthLabel(key), value }));

  // Appointment completion / no-show rate (this month)
  const total = monthAppointments?.length ?? 0;
  const completed = (monthAppointments ?? []).filter((a) => a.status === "completed").length;
  const noShow = (monthAppointments ?? []).filter((a) => a.status === "no_show").length;
  const cancelled = (monthAppointments ?? []).filter((a) => a.status === "cancelled").length;
  const activeTotal = total - cancelled;
  const completionRate = activeTotal ? Math.round((completed / activeTotal) * 100) : 0;
  const noShowRate = activeTotal ? Math.round((noShow / activeTotal) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">المحاسبة</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">التحليلات التشغيلية</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">الإيرادات آخر 6 أشهر</h2>
          <SimpleBarChart data={revenueMonthData} valueSuffix="" />
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">المرضى الجدد آخر 6 أشهر</h2>
          <SimpleBarChart data={newPatientsData} valueSuffix="" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">الإيرادات حسب الإجراء (هذا الشهر)</h2>
          {procedureData.length ? (
            <ul className="flex flex-col gap-2 text-sm">
              {procedureData.map((p) => (
                <li key={p.label} className="flex justify-between">
                  <span className="text-ink">{p.label}</span>
                  <span className="font-mono text-ink-muted">{p.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">لا توجد بيانات هذا الشهر</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">الإيرادات حسب الطبيب (هذا الشهر)</h2>
          {revenueByProvider.size ? (
            <ul className="flex flex-col gap-2 text-sm">
              {[...revenueByProvider.entries()].map(([name, value]) => (
                <li key={name} className="flex justify-between">
                  <span className="text-ink">{name}</span>
                  <span className="font-mono text-ink-muted">{Math.round(value)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">لا توجد بيانات هذا الشهر</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">نسبة إتمام المواعيد (هذا الشهر)</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-cat-cyan">{completionRate}%</p>
          <p className="mt-1 text-xs text-ink-muted">منتهية / (الكل - الملغاة)</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">نسبة عدم الحضور (هذا الشهر)</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-cat-pink">{noShowRate}%</p>
          <p className="mt-1 text-xs text-ink-muted">لم يحضر / (الكل - الملغاة)</p>
        </div>
      </div>
    </div>
  );
}
