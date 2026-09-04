import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TreatmentPlanForm from "./TreatmentPlanForm";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  proposed: "مقترحة",
  accepted: "مقبولة",
  in_progress: "قيد التنفيذ",
  completed: "منتهية",
  cancelled: "ملغاة",
};

export default async function TreatmentPlansPage() {
  const supabase = await createClient();

  const [{ data: plans }, { data: patients }] = await Promise.all([
    supabase
      .from("treatment_plans")
      .select("id, title, status, estimated_cost, created_at, patients(name)")
      .order("created_at", { ascending: false }),
    supabase.from("patients").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{plans?.length ?? 0} خطة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">خطط العلاج</h1>
      </div>

      <TreatmentPlanForm patients={patients ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">العنوان</th>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
              <th className="px-4 py-2.5 font-medium">التكلفة المقدّرة</th>
            </tr>
          </thead>
          <tbody>
            {plans?.length ? (
              plans.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    <Link href={`/clinical/treatment-plans/${p.id}`} className="underline underline-offset-2">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    {(p.patients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{statusLabels[p.status] ?? p.status}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{p.estimated_cost}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  ما في خطط علاج بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
