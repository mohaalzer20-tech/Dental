import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import ShiftForm from "./ShiftForm";
import CommissionRateInput from "./CommissionRateInput";
import { deleteShift } from "./actions";

const roleLabels: Record<string, string> = {
  doctor: "طبيب",
  assistant: "مساعد",
  reception: "استقبال",
};

const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default async function StaffPage() {
  const supabase = await createClient();

  const [{ data: staff }, { data: shifts }, { data: commissions }] = await Promise.all([
    supabase.from("users").select("id, full_name, role, email, commission_rate, status").order("full_name"),
    supabase
      .from("staff_shifts")
      .select("id, day_of_week, start_time, end_time, users(full_name)")
      .is("deleted_at", null)
      .order("day_of_week"),
    supabase.from("v_staff_commissions").select("user_id, full_name, commission_rate, total_billed, commission_amount"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{staff?.length ?? 0} موظف</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">الموظفون</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">الدور</th>
              <th className="px-4 py-2.5 font-medium">البريد</th>
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
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">العمولات</h2>
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الموظف</th>
              <th className="px-4 py-2.5 font-medium">إجمالي الفواتير</th>
              <th className="px-4 py-2.5 font-medium">العمولة المستحقة</th>
            </tr>
          </thead>
          <tbody>
            {commissions?.map((c) => (
              <tr key={c.user_id} className="border-t border-border">
                <td className="px-4 py-2.5 text-ink">{c.full_name}</td>
                <td className="px-4 py-2.5 font-mono text-ink-muted">{c.total_billed}</td>
                <td className="px-4 py-2.5 font-mono text-primary-strong">{c.commission_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
