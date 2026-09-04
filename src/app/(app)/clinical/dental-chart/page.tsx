import { createClient } from "@/lib/supabase/server";
import ChartForm from "./ChartForm";

const conditionLabels: Record<string, string> = {
  healthy: "سليم",
  caries: "تسوس",
  filled: "حشوة",
  crown: "تاج",
  bridge: "جسر",
  implant: "زراعة",
  root_canal: "علاج عصب",
  extraction: "خلع",
  missing: "مفقود",
  fractured: "كسر",
};

export default async function DentalChartPage() {
  const supabase = await createClient();

  const [{ data: entries }, { data: patients }] = await Promise.all([
    supabase
      .from("dental_chart_entries")
      .select("id, tooth_number, condition, notes, diagnosed_date, patients(name)")
      .order("diagnosed_date", { ascending: false }),
    supabase.from("patients").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{entries?.length ?? 0} سجل</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">رسم الأسنان (Odontogram)</h1>
      </div>

      <ChartForm patients={patients ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">السن</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
              <th className="px-4 py-2.5 font-medium">ملاحظات</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {entries?.length ? (
              entries.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    {(e.patients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink">{e.tooth_number}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{conditionLabels[e.condition] ?? e.condition}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{e.notes ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{e.diagnosed_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  ما في سجلات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
