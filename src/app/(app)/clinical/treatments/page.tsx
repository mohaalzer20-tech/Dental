import { createClient } from "@/lib/supabase/server";
import TreatmentForm from "./TreatmentForm";

export default async function TreatmentsPage() {
  const supabase = await createClient();

  const [{ data: treatments }, { data: patients }, { data: procedures }, { data: doctors }] = await Promise.all([
    supabase
      .from("treatments")
      .select("id, tooth_numbers, diagnosis, cost, performed_at, patients(name), procedures(name), users(full_name)")
      .order("performed_at", { ascending: false }),
    supabase.from("patients").select("id, name").order("name"),
    supabase.from("procedures").select("id, name").order("name"),
    supabase.from("users").select("id, full_name").order("full_name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{treatments?.length ?? 0} معالجة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">سجل المعالجات</h1>
      </div>

      <TreatmentForm patients={patients ?? []} procedures={procedures ?? []} doctors={doctors ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">الإجراء</th>
              <th className="px-4 py-2.5 font-medium">الطبيب</th>
              <th className="px-4 py-2.5 font-medium">الأسنان</th>
              <th className="px-4 py-2.5 font-medium">التكلفة</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {treatments?.length ? (
              treatments.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    {(t.patients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    {(t.procedures as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    {(t.users as unknown as { full_name: string } | null)?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{t.tooth_numbers ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{t.cost}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {new Date(t.performed_at).toLocaleDateString("ar-SY")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  ما في معالجات مسجّلة بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
