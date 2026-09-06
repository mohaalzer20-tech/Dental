import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import ShiftForm from "./ShiftForm";
import CommissionRateInput from "./CommissionRateInput";
import FixedSalaryInput from "./FixedSalaryInput";
import ClockButton from "./ClockButton";
import InviteStaffForm from "./InviteStaffForm";
import { staffStatusLabels } from "./statusLabels";
import { roleLabels } from "@/lib/roleLabels";
import { deleteShift } from "./actions";

const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default async function StaffPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = user
    ? await supabase.from("users").select("id, role").eq("id", user.id).single()
    : { data: null };
  const isDoctor = me?.role === "doctor";
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: staff }, { data: shifts }, { data: commissions }, { data: myAttendance }, { data: attendanceLog }] =
    await Promise.all([
    supabase.from("users").select("id, full_name, role, email, commission_rate, fixed_salary, status").order("full_name"),
    supabase
      .from("staff_shifts")
      .select("id, day_of_week, start_time, end_time, users(full_name)")
      .is("deleted_at", null)
      .order("day_of_week"),
    supabase
      .from("v_staff_payroll")
      .select("user_id, full_name, fixed_salary, commission_rate, total_billed, commission_amount, total_pay"),
    me
      ? supabase
          .from("staff_attendance")
          .select("check_in, check_out")
          .eq("user_id", me.id)
          .eq("work_date", today)
          .is("deleted_at", null)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    isDoctor
      ? supabase
          .from("staff_attendance")
          .select("id, work_date, check_in, check_out, users(full_name)")
          .is("deleted_at", null)
          .order("work_date", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{staff?.length ?? 0} موظف</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">الموظفون</h1>
      </div>

      {me && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-ink-muted">تسجيل الحضور والانصراف لهذا اليوم</p>
          <ClockButton userId={me.id} checkedIn={!!myAttendance?.check_in} checkedOut={!!myAttendance?.check_out} />
        </div>
      )}

      {isDoctor && <InviteStaffForm />}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">الدور</th>
              <th className="px-4 py-2.5 font-medium">البريد</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
              <th className="px-4 py-2.5 font-medium">الراتب الثابت</th>
              <th className="px-4 py-2.5 font-medium">نسبة العمولة</th>
            </tr>
          </thead>
          <tbody>
            {staff?.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-2.5 text-ink">
                  <Link href={`/staff/${s.id}`} className="underline underline-offset-2">
                    {s.full_name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-ink-muted">{roleLabels[s.role] ?? s.role}</td>
                <td className="px-4 py-2.5 font-mono text-ink-muted">{s.email}</td>
                <td className="px-4 py-2.5 text-ink-muted">{staffStatusLabels[s.status] ?? s.status}</td>
                <td className="px-4 py-2.5">
                  <FixedSalaryInput userId={s.id} initialSalary={s.fixed_salary} />
                </td>
                <td className="px-4 py-2.5">
                  <CommissionRateInput userId={s.id} initialRate={s.commission_rate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ShiftForm staff={(staff ?? []).map((s) => ({ id: s.id, full_name: s.full_name }))} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">الدوامات</h2>
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الموظف</th>
              <th className="px-4 py-2.5 font-medium">اليوم</th>
              <th className="px-4 py-2.5 font-medium">من</th>
              <th className="px-4 py-2.5 font-medium">إلى</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {shifts?.length ? (
              shifts.map((sh) => (
                <tr key={sh.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    {(sh.users as unknown as { full_name: string } | null)?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{days[sh.day_of_week]}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{sh.start_time}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{sh.end_time}</td>
                  <td className="px-4 py-2.5">
                    <DeleteButton action={deleteShift.bind(null, sh.id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-muted">
                  ما في دوامات مسجّلة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">الرواتب والعمولات</h2>
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الموظف</th>
              <th className="px-4 py-2.5 font-medium">الراتب الثابت</th>
              <th className="px-4 py-2.5 font-medium">إجمالي الفواتير</th>
              <th className="px-4 py-2.5 font-medium">العمولة المستحقة</th>
              <th className="px-4 py-2.5 font-medium">إجمالي المستحق</th>
            </tr>
          </thead>
          <tbody>
            {commissions?.map((c) => (
              <tr key={c.user_id} className="border-t border-border">
                <td className="px-4 py-2.5 text-ink">{c.full_name}</td>
                <td className="px-4 py-2.5 font-mono text-ink-muted">{c.fixed_salary ?? 0}</td>
                <td className="px-4 py-2.5 font-mono text-ink-muted">{c.total_billed}</td>
                <td className="px-4 py-2.5 font-mono text-ink-muted">{c.commission_amount}</td>
                <td className="px-4 py-2.5 font-mono text-primary-strong">{c.total_pay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDoctor && attendanceLog && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">سجل الحضور</h2>
          <table className="w-full text-right text-sm">
            <thead className="bg-surface-alt text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">الموظف</th>
                <th className="px-4 py-2.5 font-medium">التاريخ</th>
                <th className="px-4 py-2.5 font-medium">الحضور</th>
                <th className="px-4 py-2.5 font-medium">الانصراف</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLog.length ? (
                attendanceLog.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-ink">
                      {(a.users as unknown as { full_name: string } | null)?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{a.work_date}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {a.check_in ? new Date(a.check_in).toLocaleTimeString("ar-SY-u-nu-latn") : "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {a.check_out ? new Date(a.check_out).toLocaleTimeString("ar-SY-u-nu-latn") : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-muted">
                    ما في سجلات حضور بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
