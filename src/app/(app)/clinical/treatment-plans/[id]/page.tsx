import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlanItemForm from "./PlanItemForm";
import PlanStatusSelect from "./PlanStatusSelect";
import PlanAcceptanceForm from "./PlanAcceptanceForm";

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  scheduled: "مجدول",
  in_progress: "قيد التنفيذ",
  completed: "منتهي",
  cancelled: "ملغى",
};

export default async function TreatmentPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: plan }, { data: items }, { data: procedures }] = await Promise.all([
    supabase
      .from("treatment_plans")
      .select("id, title, notes, status, accepted_at, accepted_by_name, patients(id, name)")
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("treatment_plan_items")
      .select("id, tooth_numbers, estimated_cost, status, procedures(name)")
      .eq("treatment_plan_id", id),
    supabase.from("procedures").select("id, name").is("deleted_at", null).order("name"),
  ]);

  if (!plan) {
    return <p className="text-ink-muted">الخطة غير موجودة</p>;
  }

  const patient = plan.patients as unknown as { id: string; name: string } | null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-muted">
            {patient ? (
              <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                {patient.name}
              </Link>
            ) : (
              "—"
            )}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{plan.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {plan.accepted_at && (
            <Link
              href={`/clinical/treatment-plans/${id}/consent/print`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-alt"
            >
              طباعة نموذج الموافقة
            </Link>
          )}
          <PlanStatusSelect id={plan.id} status={plan.status} />
        </div>
      </div>

      <PlanAcceptanceForm planId={plan.id} acceptedAt={plan.accepted_at} acceptedByName={plan.accepted_by_name} />

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">البنود</h2>
        <table className="w-full text-right text-sm">
          <thead className="text-ink-muted">
            <tr>
              <th className="pb-2 font-medium">الإجراء</th>
              <th className="pb-2 font-medium">الأسنان</th>
              <th className="pb-2 font-medium">التكلفة</th>
              <th className="pb-2 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="py-2 text-ink">
                  {(it.procedures as unknown as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="py-2 font-mono text-ink-muted">{it.tooth_numbers ?? "—"}</td>
                <td className="py-2 font-mono text-ink-muted">{it.estimated_cost}</td>
                <td className="py-2 text-ink-muted">{statusLabels[it.status] ?? it.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 border-t border-border pt-4">
          <PlanItemForm planId={id} procedures={procedures ?? []} />
        </div>
      </div>
    </div>
  );
}
