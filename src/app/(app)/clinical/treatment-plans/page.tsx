import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import TreatmentPlanForm from "./TreatmentPlanForm";
import { deleteTreatmentPlan } from "./actions";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  proposed: "مقترحة",
  accepted: "مقبولة",
  in_progress: "قيد التنفيذ",
  completed: "منتهية",
  cancelled: "ملغاة",
};

export default async function TreatmentPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  const supabase = await createClient();

  let plansQuery = supabase
    .from("treatment_plans")
    .select("id, title, status, estimated_cost, created_at, patients(id, name)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (patient_id) plansQuery = plansQuery.eq("patient_id", patient_id);

  const [{ data: plans }, { data: patients }] = await Promise.all([
    plansQuery,
    supabase.from("patients").select("id, name").order("name"),
  ]);

  const filteredPatientName = patient_id ? (patients ?? []).find((p) => p.id === patient_id)?.name : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{plans?.length ?? 0} خطة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">خطط العلاج</h1>
        {filteredPatientName && (
          <p className="mt-1 text-sm text-ink-muted">
            مفلترة لـ {filteredPatientName} —{" "}
            <Link href="/clinical/treatment-plans" className="underline underline-offset-2">
              إزالة الفلتر
            </Link>
          </p>
        )}
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
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {plans?.length ? (
              plans.map((p) => {
                const patient = p.patients as unknown as { id?: string; name: string } | null;
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-ink">
                      <Link href={`/clinical/treatment-plans/${p.id}`} className="underline underline-offset-2">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      {patient?.id ? (
                        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                          {patient.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{statusLabels[p.status] ?? p.status}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{p.estimated_cost}</td>
                    <td className="px-4 py-2.5">
                      <DeleteButton action={deleteTreatmentPlan.bind(null, p.id)} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
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
