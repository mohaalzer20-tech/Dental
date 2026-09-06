import { createClient } from "@/lib/supabase/server";
import StaffStatusToggle from "./StaffStatusToggle";
import { staffStatusLabels } from "../statusLabels";
import { roleLabels } from "@/lib/roleLabels";
import CommissionRateInput from "../CommissionRateInput";
import FixedSalaryInput from "../FixedSalaryInput";

const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default async function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("users")
    .select("id, full_name, role, email, status, commission_rate, fixed_salary")
    .eq("id", id)
    .single();

  if (!member) {
    return <p className="text-ink-muted">الموظف غير موجود</p>;
  }

  const [{ data: shifts }, { data: treatments }, { data: commission }] = await Promise.all([
    supabase
      .from("staff_shifts")
      .select("id, day_of_week, start_time, end_time")
      .eq("user_id", id)
      .is("deleted_at", null)
      .order("day_of_week"),
    supabase
      .from("treatments")
      .select("id, diagnosis, cost, performed_at, patients(name), procedures(name)")
      .eq("doctor_id", id)
      .is("deleted_at", null)
      .order("performed_at", { ascending: false })
      .limit(10),
    supabase
      .from("v_staff_payroll")
      .select("total_billed, commission_amount, total_pay")
      .eq("user_id", id)
      .maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-muted">ملف الموظف</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">{member.full_name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {roleLabels[member.role] ?? member.role} — {member.email} — {staffStatusLabels[member.status] ?? member.status}
          </p>
        </div>
        <StaffStatusToggle id={member.id} status={member.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs text-ink-muted">الراتب الثابت</p>
          <FixedSalaryInput userId={member.id} initialSalary={member.fixed_salary} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs text-ink-muted">نسبة العمولة</p>
          <CommissionRateInput userId={member.id} initialRate={member.commission_rate} />
        </div>
      </div>

      {commission && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-ink-muted">إجمالي الفواتير</p>
            <p className="mt-1 font-mono text-lg text-ink">{commission.total_billed}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-ink-muted">العمولة المستحقة</p>
            <p className="mt-1 font-mono text-lg text-ink">{commission.commission_amount}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-ink-muted">إجمالي المستحق</p>
            <p className="mt-1 font-mono text-lg text-primary-strong">{commission.total_pay}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">الدوامات</h2>
        {shifts?.length ? (
          <ul className="flex flex-col gap-2 text-sm">
            {shifts.map((sh) => (
              <li key={sh.id} className="flex justify-between">
                <span className="text-ink">{days[sh.day_of_week]}</span>
                <span className="font-mono text-ink-muted">
                  {sh.start_time} — {sh.end_time}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">ما في دوامات مسجّلة</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">المعالجات</h2>
        {treatments?.length ? (
          <ul className="flex flex-col gap-2 text-sm">
            {treatments.map((t) => (
              <li key={t.id} className="flex justify-between">
                <span className="text-ink">
                  {(t.patients as unknown as { name: string } | null)?.name ?? "—"} —{" "}
                  {(t.procedures as unknown as { name: string } | null)?.name ?? t.diagnosis ?? "معالجة"}
                </span>
                <span className="font-mono text-ink-muted">{t.cost}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">ما في معالجات مسجّلة لهذا الموظف</p>
        )}
      </div>
    </div>
  );
}
